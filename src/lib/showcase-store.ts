import { neon } from "@neondatabase/serverless";
import {
  DEFAULT_SHOWCASES,
  newShowcaseId,
  readShowcases,
  writeShowcases,
  type Showcase,
} from "./showcase-db";
import { MANUAL_DATABASE_URL } from "./db-config";

/**
 * Lapisan penyimpanan "Pameran Kode" (contoh coding) dengan dua backend,
 * pola sama dengan program-store.ts:
 *
 * 1. "database" — Postgres (Neon) via driver HTTP serverless. Aktif otomatis
 *    jika URL database terdeteksi (db-config.ts / env). Tabel `showcases`
 *    dibuat + di-seed otomatis saat pertama kali tersambung.
 * 2. "file" — file JSON (db/showcases.json lokal, /tmp di serverless).
 */

export type ShowcaseStorageMode = "database" | "file";

/** Sumber URL sama dengan program-store (prioritas: db-config.ts > env) */
const RAW_DB_URL = (
  MANUAL_DATABASE_URL.trim() ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  ""
).trim();
const DATABASE_URL = /^(postgres(ql)?:\/\/)/.test(RAW_DB_URL) ? RAW_DB_URL : "";

export function getShowcaseStorageMode(): ShowcaseStorageMode {
  return DATABASE_URL ? "database" : "file";
}

type SqlClient = ReturnType<typeof neon>;

let sqlClient: SqlClient | null = null;

function getSql(): SqlClient {
  if (!sqlClient) sqlClient = neon(DATABASE_URL);
  return sqlClient;
}

interface ShowcaseRow {
  id: string;
  title: string;
  filename: string;
  code: string;
  output: string;
}

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS showcases (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    filename TEXT NOT NULL,
    code TEXT NOT NULL,
    output TEXT NOT NULL DEFAULT '',
    seq BIGSERIAL NOT NULL UNIQUE
  )
`;

/** Init dijalankan maksimal sekali per instance (buat tabel + seed) */
let initPromise: Promise<void> | null = null;

function ensureDbReady(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const sql = getSql();
      await sql.query(CREATE_TABLE_SQL);
      const rows = (await sql.query(
        "SELECT COUNT(*)::int AS count FROM showcases"
      )) as { count: number }[];
      if (!rows[0] || Number(rows[0].count) === 0) {
        // Seed contoh kode bawaan (aman dijalankan berulang)
        for (const s of DEFAULT_SHOWCASES) {
          await sql.query(
            `INSERT INTO showcases (id, title, filename, code, output)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO NOTHING`,
            [s.id, s.title, s.filename, s.code, s.output]
          );
        }
      }
    })().catch((error) => {
      // Reset agar request berikutnya bisa mencoba ulang
      initPromise = null;
      throw error;
    });
  }
  return initPromise;
}

function rowToShowcase(row: ShowcaseRow): Showcase {
  return {
    id: row.id,
    title: row.title,
    filename: row.filename,
    code: row.code,
    output: row.output || "",
  };
}

const SELECT_COLUMNS = "id, title, filename, code, output";

/** Ambil daftar contoh kode (database bila tersedia, file sebagai fallback baca) */
export async function getShowcases(): Promise<{
  showcases: Showcase[];
  storage: ShowcaseStorageMode;
}> {
  if (!DATABASE_URL) {
    return { showcases: readShowcases(), storage: "file" };
  }
  try {
    await ensureDbReady();
    const rows = (await getSql().query(
      `SELECT ${SELECT_COLUMNS} FROM showcases ORDER BY seq ASC`
    )) as ShowcaseRow[];
    return { showcases: rows.map(rowToShowcase), storage: "database" };
  } catch (error) {
    // Section tetap tampil meski database bermasalah
    console.error("showcase-store: gagal baca database, fallback ke file:", error);
    return { showcases: readShowcases(), storage: "file" };
  }
}

/** Tambah contoh kode baru (id dibuat otomatis) */
export async function createShowcase(clean: Omit<Showcase, "id">): Promise<Showcase> {
  if (!DATABASE_URL) {
    const showcases = readShowcases();
    const showcase: Showcase = { id: newShowcaseId(), ...clean };
    showcases.push(showcase);
    writeShowcases(showcases);
    return showcase;
  }
  await ensureDbReady();
  const rows = (await getSql().query(
    `INSERT INTO showcases (id, title, filename, code, output)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${SELECT_COLUMNS}`,
    [newShowcaseId(), clean.title, clean.filename, clean.code, clean.output]
  )) as ShowcaseRow[];
  if (!rows[0]) throw new Error("Gagal menyimpan contoh kode ke database");
  return rowToShowcase(rows[0]);
}

/** Perbarui contoh kode; null jika id tidak ditemukan */
export async function updateShowcase(
  id: string,
  clean: Omit<Showcase, "id">
): Promise<Showcase | null> {
  if (!DATABASE_URL) {
    const showcases = readShowcases();
    const index = showcases.findIndex((s) => s.id === id);
    if (index === -1) return null;
    const updated: Showcase = { id, ...clean };
    showcases[index] = updated;
    writeShowcases(showcases);
    return updated;
  }
  await ensureDbReady();
  const rows = (await getSql().query(
    `UPDATE showcases
     SET title = $2, filename = $3, code = $4, output = $5
     WHERE id = $1
     RETURNING ${SELECT_COLUMNS}`,
    [id, clean.title, clean.filename, clean.code, clean.output]
  )) as ShowcaseRow[];
  return rows[0] ? rowToShowcase(rows[0]) : null;
}

/** Hapus contoh kode; false jika id tidak ditemukan */
export async function deleteShowcase(id: string): Promise<boolean> {
  if (!DATABASE_URL) {
    const showcases = readShowcases();
    const filtered = showcases.filter((s) => s.id !== id);
    if (filtered.length === showcases.length) return false;
    writeShowcases(filtered);
    return true;
  }
  await ensureDbReady();
  const rows = (await getSql().query(
    "DELETE FROM showcases WHERE id = $1 RETURNING id",
    [id]
  )) as { id: string }[];
  return rows.length > 0;
}
