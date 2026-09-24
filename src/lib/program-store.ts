import { neon } from "@neondatabase/serverless";
import {
  DEFAULT_PROGRAMS,
  newProgramId,
  readPrograms,
  writePrograms,
  type Program,
} from "./json-db";
import { MANUAL_DATABASE_URL } from "./db-config";

/**
 * Lapisan penyimpanan program dengan dua backend:
 *
 * 1. "database" — Postgres (Neon) via driver HTTP serverless.
 *    Aktif otomatis jika env DATABASE_URL / POSTGRES_URL ada
 *    (mis. setelah menghubungkan "Storage → Neon" di Vercel).
 *    Data tersimpan PERMANEN di database.
 *
 * 2. "file" — file JSON (db/programs.json lokal, /tmp di serverless).
 *    Dipakai saat env database tidak ada. Di Vercel sifatnya sementara.
 *
 * Tabel dibuat otomatis + di-seed program bawaan saat kosong,
 * sehingga tidak ada setup database manual sama sekali.
 */

export type StorageMode = "database" | "file";

/**
 * Sumber koneksi database (urutan prioritas):
 * 1. MANUAL_DATABASE_URL — diisi manual di src/lib/db-config.ts
 *    (cara termudah: tempel URL Neon langsung di file itu, bisa lewat
 *     website GitHub tanpa menyentuh Vercel sama sekali)
 * 2. env DATABASE_URL / POSTGRES_URL — otomatis jika memakai
 *    "Storage → Neon" di Vercel atau env variable lain.
 *
 * Hanya URL ber-format Postgres (postgresql:// / postgres://) yang
 * dianggap database Neon. URL dengan format lain (mis. file:... sqlite)
 * diabaikan agar tidak memicu error driver.
 */
const RAW_DB_URL = (
  MANUAL_DATABASE_URL.trim() ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  ""
).trim();
const DATABASE_URL = /^(postgres(ql)?:\/\/)/.test(RAW_DB_URL) ? RAW_DB_URL : "";

export function getStorageMode(): StorageMode {
  return DATABASE_URL ? "database" : "file";
}

type SqlClient = ReturnType<typeof neon>;

let sqlClient: SqlClient | null = null;

function getSql(): SqlClient {
  if (!sqlClient) sqlClient = neon(DATABASE_URL);
  return sqlClient;
}

interface ProgramRow {
  id: string;
  name: string;
  level: string;
  description: string;
  /** JSON array string */
  topics: string;
  /** JSON array string — materi lengkap untuk halaman detail */
  materials: string;
  duration: string;
  price: string;
  certificate_price: string;
  icon: string;
  image: string | null;
}

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS programs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    level TEXT NOT NULL,
    description TEXT NOT NULL,
    topics TEXT NOT NULL,
    materials TEXT NOT NULL DEFAULT '',
    duration TEXT NOT NULL,
    price TEXT NOT NULL,
    certificate_price TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT 'book',
    image TEXT NOT NULL DEFAULT '',
    seq BIGSERIAL NOT NULL UNIQUE
  )
`;

/**
 * Migrasi ringan untuk database lama yang dibuat sebelum kolom image ada.
 * Idempotent — aman dijalankan setiap kali init.
 */
const MIGRATE_IMAGE_SQL =
  "ALTER TABLE programs ADD COLUMN IF NOT EXISTS image TEXT NOT NULL DEFAULT ''";

/**
 * Migrasi ringan untuk database lama sebelum kolom certificate_price ada.
 * Harga sertifikat khusus per program — kosong = pakai harga paket global.
 */
const MIGRATE_CERT_PRICE_SQL =
  "ALTER TABLE programs ADD COLUMN IF NOT EXISTS certificate_price TEXT NOT NULL DEFAULT ''";

/**
 * Migrasi ringan untuk database lama sebelum kolom materials ada.
 * Materi lengkap per program untuk jendela detail (?program=...).
 */
const MIGRATE_MATERIALS_SQL =
  "ALTER TABLE programs ADD COLUMN IF NOT EXISTS materials TEXT NOT NULL DEFAULT ''";

/**
 * Isi gambar bawaan untuk program bawaan pada database lama yang
 * belum memiliki gambar. Idempotent — hanya mengisi bila masih kosong.
 */
const BACKFILL_IMAGE_SQL = `
  UPDATE programs SET image = $2
  WHERE id = $1 AND (image IS NULL OR image = '')
`;

/**
 * Isi materi lengkap bawaan untuk program bawaan pada database lama yang
 * belum memiliki materi detail. Idempotent — hanya mengisi bila masih kosong.
 */
const BACKFILL_MATERIALS_SQL = `
  UPDATE programs SET materials = $2
  WHERE id = $1 AND (materials IS NULL OR materials = '')
`;

/** Init dijalankan maksimal sekali per instance (buat tabel + seed) */
let initPromise: Promise<void> | null = null;

function ensureDbReady(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const sql = getSql();
      await sql.query(CREATE_TABLE_SQL);
      await sql.query(MIGRATE_IMAGE_SQL);
      await sql.query(MIGRATE_CERT_PRICE_SQL);
      await sql.query(MIGRATE_MATERIALS_SQL);
      const rows = (await sql.query(
        "SELECT COUNT(*)::int AS count FROM programs"
      )) as { count: number }[];
      if (!rows[0] || Number(rows[0].count) === 0) {
        // Seed program bawaan (aman dijalankan berulang: ON CONFLICT DO NOTHING)
        for (const p of DEFAULT_PROGRAMS) {
          await sql.query(
            `INSERT INTO programs (id, name, level, description, topics, materials, duration, price, certificate_price, icon, image)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             ON CONFLICT (id) DO NOTHING`,
            [
              p.id,
              p.name,
              p.level,
              p.description,
              JSON.stringify(p.topics),
              JSON.stringify(p.materials ?? []),
              p.duration,
              p.price,
              p.certificatePrice ?? "",
              p.icon,
              p.image ?? "",
            ]
          );
        }
      } else {
        // Database lama: pastikan program bawaan punya gambar + materi bawaan
        for (const p of DEFAULT_PROGRAMS) {
          if (p.image) {
            await sql.query(BACKFILL_IMAGE_SQL, [p.id, p.image]);
          }
          if (p.materials && p.materials.length > 0) {
            await sql.query(BACKFILL_MATERIALS_SQL, [p.id, JSON.stringify(p.materials)]);
          }
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

function rowToProgram(row: ProgramRow): Program {
  let topics: string[] = [];
  try {
    const parsed: unknown = JSON.parse(row.topics);
    if (Array.isArray(parsed)) topics = parsed.map((t) => String(t));
  } catch {
    // topics tidak valid → anggap kosong
  }
  let materials: string[] = [];
  try {
    const parsed: unknown = JSON.parse(row.materials || "[]");
    if (Array.isArray(parsed)) materials = parsed.map((t) => String(t));
  } catch {
    // materials tidak valid → anggap kosong
  }
  return {
    id: row.id,
    name: row.name,
    level: row.level,
    description: row.description,
    topics,
    materials,
    duration: row.duration,
    price: row.price,
    certificatePrice: row.certificate_price || "",
    icon: row.icon,
    image: row.image || "",
  };
}

const SELECT_COLUMNS =
  "id, name, level, description, topics, materials, duration, price, certificate_price, icon, image";

/** Ambil daftar program (database bila tersedia, file sebagai fallback baca) */
export async function getPrograms(): Promise<{
  programs: Program[];
  storage: StorageMode;
}> {
  if (!DATABASE_URL) {
    return { programs: readPrograms(), storage: "file" };
  }
  try {
    await ensureDbReady();
    const rows = (await getSql().query(
      `SELECT ${SELECT_COLUMNS} FROM programs ORDER BY seq ASC`
    )) as ProgramRow[];
    return { programs: rows.map(rowToProgram), storage: "database" };
  } catch (error) {
    // Situs tetap tampil meski database bermasalah
    console.error("program-store: gagal baca database, fallback ke file:", error);
    return { programs: readPrograms(), storage: "file" };
  }
}

/** Tambah program baru (id dibuat otomatis) */
export async function createProgram(
  clean: Omit<Program, "id">
): Promise<Program> {
  if (!DATABASE_URL) {
    const programs = readPrograms();
    const program: Program = { id: newProgramId(), ...clean };
    programs.push(program);
    writePrograms(programs);
    return program;
  }
  await ensureDbReady();
  const rows = (await getSql().query(
    `INSERT INTO programs (id, name, level, description, topics, materials, duration, price, certificate_price, icon, image)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING ${SELECT_COLUMNS}`,
    [
      newProgramId(),
      clean.name,
      clean.level,
      clean.description,
      JSON.stringify(clean.topics),
      JSON.stringify(clean.materials ?? []),
      clean.duration,
      clean.price,
      clean.certificatePrice ?? "",
      clean.icon,
      clean.image ?? "",
    ]
  )) as ProgramRow[];
  if (!rows[0]) throw new Error("Gagal menyimpan program ke database");
  return rowToProgram(rows[0]);
}

/** Perbarui program; null jika id tidak ditemukan */
export async function updateProgram(
  id: string,
  clean: Omit<Program, "id">
): Promise<Program | null> {
  if (!DATABASE_URL) {
    const programs = readPrograms();
    const index = programs.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const updated: Program = { id, ...clean };
    programs[index] = updated;
    writePrograms(programs);
    return updated;
  }
  await ensureDbReady();
  const rows = (await getSql().query(
    `UPDATE programs
     SET name = $2, level = $3, description = $4, topics = $5, materials = $6,
         duration = $7, price = $8, certificate_price = $9, icon = $10, image = $11
     WHERE id = $1
     RETURNING ${SELECT_COLUMNS}`,
    [
      id,
      clean.name,
      clean.level,
      clean.description,
      JSON.stringify(clean.topics),
      JSON.stringify(clean.materials ?? []),
      clean.duration,
      clean.price,
      clean.certificatePrice ?? "",
      clean.icon,
      clean.image ?? "",
    ]
  )) as ProgramRow[];
  return rows[0] ? rowToProgram(rows[0]) : null;
}

/** Hapus program; false jika id tidak ditemukan */
export async function deleteProgram(id: string): Promise<boolean> {
  if (!DATABASE_URL) {
    const programs = readPrograms();
    const filtered = programs.filter((p) => p.id !== id);
    if (filtered.length === programs.length) return false;
    writePrograms(filtered);
    return true;
  }
  await ensureDbReady();
  const rows = (await getSql().query(
    "DELETE FROM programs WHERE id = $1 RETURNING id",
    [id]
  )) as { id: string }[];
  return rows.length > 0;
}
