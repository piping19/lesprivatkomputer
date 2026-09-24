import { neon } from "@neondatabase/serverless";
import {
  DEFAULT_PACKAGES,
  newPackageId,
  readPackages,
  writePackages,
  type PricingPackage,
} from "./json-db";
import { MANUAL_DATABASE_URL } from "./db-config";

/**
 * Lapisan penyimpanan paket harga (LES BIASA / LES RESMI SERTIFIKAT).
 * Pola sama dengan program-store.ts:
 *
 * 1. "database" — Postgres (Neon) via driver HTTP serverless.
 * 2. "file"     — file JSON (db/packages.json lokal, /tmp di serverless).
 *
 * Tabel dibuat otomatis + di-seed paket bawaan saat kosong.
 */

export type StorageMode = "database" | "file";

const RAW_DB_URL = (
  MANUAL_DATABASE_URL.trim() ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  ""
).trim();
const DATABASE_URL = /^(postgres(ql)?:\/\/)/.test(RAW_DB_URL) ? RAW_DB_URL : "";

export function getPackageStorageMode(): StorageMode {
  return DATABASE_URL ? "database" : "file";
}

type SqlClient = ReturnType<typeof neon>;

let sqlClient: SqlClient | null = null;

function getSql(): SqlClient {
  if (!sqlClient) sqlClient = neon(DATABASE_URL);
  return sqlClient;
}

interface PackageRow {
  id: string;
  name: string;
  tagline: string;
  price_label: string;
  price: string;
  note: string;
  wa_message: string;
  highlight: boolean;
}

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT NOT NULL DEFAULT '',
    price_label TEXT NOT NULL DEFAULT 'Harga',
    price TEXT NOT NULL DEFAULT '',
    note TEXT NOT NULL DEFAULT '',
    wa_message TEXT NOT NULL DEFAULT '',
    highlight BOOLEAN NOT NULL DEFAULT FALSE,
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
        "SELECT COUNT(*)::int AS count FROM packages"
      )) as { count: number }[];
      if (!rows[0] || Number(rows[0].count) === 0) {
        // Seed paket bawaan (aman dijalankan berulang: ON CONFLICT DO NOTHING)
        for (const p of DEFAULT_PACKAGES) {
          await sql.query(
            `INSERT INTO packages (id, name, tagline, price_label, price, note, wa_message, highlight)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) DO NOTHING`,
            [p.id, p.name, p.tagline, p.priceLabel, p.price, p.note, p.waMessage, p.highlight]
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

function rowToPackage(row: PackageRow): PricingPackage {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    priceLabel: row.price_label,
    price: row.price,
    note: row.note,
    waMessage: row.wa_message,
    highlight: row.highlight === true,
  };
}

const SELECT_COLUMNS =
  "id, name, tagline, price_label, price, note, wa_message, highlight";

/** Ambil daftar paket harga (database bila tersedia, file sebagai fallback baca) */
export async function getPackages(): Promise<{
  packages: PricingPackage[];
  storage: StorageMode;
}> {
  if (!DATABASE_URL) {
    return { packages: readPackages(), storage: "file" };
  }
  try {
    await ensureDbReady();
    const rows = (await getSql().query(
      `SELECT ${SELECT_COLUMNS} FROM packages ORDER BY seq ASC`
    )) as PackageRow[];
    // Bila tabel ada tapi kosong (mis. admin menghapus semua), pakai default
    if (rows.length === 0) {
      return { packages: DEFAULT_PACKAGES, storage: "database" };
    }
    return { packages: rows.map(rowToPackage), storage: "database" };
  } catch (error) {
    // Situs tetap tampil meski database bermasalah
    console.error("package-store: gagal baca database, fallback ke file:", error);
    return { packages: readPackages(), storage: "file" };
  }
}

/** Tambah paket baru (id dibuat otomatis) */
export async function createPackage(
  clean: Omit<PricingPackage, "id">
): Promise<PricingPackage> {
  if (!DATABASE_URL) {
    const packages = readPackages();
    const pkg: PricingPackage = { id: newPackageId(), ...clean };
    packages.push(pkg);
    writePackages(packages);
    return pkg;
  }
  await ensureDbReady();
  const rows = (await getSql().query(
    `INSERT INTO packages (id, name, tagline, price_label, price, note, wa_message, highlight)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${SELECT_COLUMNS}`,
    [
      newPackageId(),
      clean.name,
      clean.tagline,
      clean.priceLabel,
      clean.price,
      clean.note,
      clean.waMessage,
      clean.highlight,
    ]
  )) as PackageRow[];
  if (!rows[0]) throw new Error("Gagal menyimpan paket ke database");
  return rowToPackage(rows[0]);
}

/** Perbarui paket; null jika id tidak ditemukan */
export async function updatePackage(
  id: string,
  clean: Omit<PricingPackage, "id">
): Promise<PricingPackage | null> {
  if (!DATABASE_URL) {
    const packages = readPackages();
    const index = packages.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const updated: PricingPackage = { id, ...clean };
    packages[index] = updated;
    writePackages(packages);
    return updated;
  }
  await ensureDbReady();
  const rows = (await getSql().query(
    `UPDATE packages
     SET name = $2, tagline = $3, price_label = $4, price = $5,
         note = $6, wa_message = $7, highlight = $8
     WHERE id = $1
     RETURNING ${SELECT_COLUMNS}`,
    [
      id,
      clean.name,
      clean.tagline,
      clean.priceLabel,
      clean.price,
      clean.note,
      clean.waMessage,
      clean.highlight,
    ]
  )) as PackageRow[];
  return rows[0] ? rowToPackage(rows[0]) : null;
}

/** Hapus paket; false jika id tidak ditemukan */
export async function deletePackage(id: string): Promise<boolean> {
  if (!DATABASE_URL) {
    const packages = readPackages();
    const filtered = packages.filter((p) => p.id !== id);
    if (filtered.length === packages.length) return false;
    writePackages(filtered);
    return true;
  }
  await ensureDbReady();
  const rows = (await getSql().query(
    "DELETE FROM packages WHERE id = $1 RETURNING id",
    [id]
  )) as { id: string }[];
  return rows.length > 0;
}
