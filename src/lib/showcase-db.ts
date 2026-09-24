import fs from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";

/**
 * Database sederhana berbasis file JSON untuk "Pameran Kode"
 * (contoh-contoh coding yang tampil di section Materi).
 * Polanya sama dengan json-db.ts (program):
 * - Lokal (dev/self-host): data tersimpan permanen di db/showcases.json
 * - Vercel/serverless: penulisan diarahkan ke /tmp (sementara; agar
 *   permanen sambungkan Neon — lihat README / PANDUAN-DEPLOY-NEON.md)
 * Jika file tidak ada / rusak, dipakai DEFAULT_SHOWCASES di bawah.
 */
export interface Showcase {
  id: string;
  /** Label yang tampil sebagai badge/tab, cth: "C++ Dasar" */
  title: string;
  /** Nama file pada bar atas jendela editor, cth: "materi-dasar/main.cpp" */
  filename: string;
  /** Isi kode (teks biasa, boleh multi baris) */
  code: string;
  /** Output terminal — satu baris per baris; kosong = panel output disembunyikan */
  output: string;
}

const LOCAL_DB_PATH = path.join(process.cwd(), "db", "showcases.json");
const SERVERLESS_DB_PATH = path.join(os.tmpdir(), "leskomputer-showcases.json");

// Vercel selalu menyetel env VERCEL=1 pada runtime serverless
const IS_SERVERLESS = process.env.VERCEL === "1";

const WRITE_PATH = IS_SERVERLESS ? SERVERLESS_DB_PATH : LOCAL_DB_PATH;
const READ_PATHS = IS_SERVERLESS ? [SERVERLESS_DB_PATH, LOCAL_DB_PATH] : [LOCAL_DB_PATH];

export const DEFAULT_SHOWCASES: Showcase[] = [
  {
    id: "cpp-dasar",
    title: "C++ Dasar",
    filename: "materi-dasar/main.cpp",
    code: `#include <iostream>

using namespace std;

int main()
{
    string var1 = "Belajar C++ di LesKomputer";
    string var2 = "Semangat!!";
    string var3 = "Belajar demi masa depan yang lebih baik";

    cout << "Panjang string var1 adalah " << var1.length() << endl;
    cout << "Panjang string var2 adalah " << var2.length() << endl;
    cout << "Panjang string var3 adalah " << var3.size() << endl;

    return 0;
}`,
    output: `Panjang string var1 adalah 26
Panjang string var2 adalah 10
Panjang string var3 adalah 39`,
  },
  {
    id: "python-dasar",
    title: "Python Dasar",
    filename: "materi-dasar/sapa.py",
    code: `# Belajar Python di LesKomputer
nama = "Peserta LesKomputer"
semangat = "Semangat!!"

def sapa(nama):
    return "Halo " + nama + ", selamat belajar!"

print(sapa(nama))
print("Jumlah huruf nama:", len(nama))
print(semangat)`,
    output: `Halo Peserta LesKomputer, selamat belajar!
Jumlah huruf nama: 19
Semangat!!`,
  },
];

function readFrom(filePath: string): Showcase[] | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as { showcases?: Showcase[] };
    if (Array.isArray(data.showcases)) {
      return data.showcases;
    }
  } catch {
    // File belum ada / tidak bisa dibaca / rusak
  }
  return null;
}

export function readShowcases(): Showcase[] {
  for (const filePath of READ_PATHS) {
    const data = readFrom(filePath);
    if (data) return data;
  }
  return DEFAULT_SHOWCASES;
}

export function writeShowcases(showcases: Showcase[]): void {
  try {
    fs.mkdirSync(path.dirname(WRITE_PATH), { recursive: true });
    fs.writeFileSync(WRITE_PATH, JSON.stringify({ showcases }, null, 2), "utf-8");
  } catch (error) {
    // Fallback terakhir bila path utama tak bisa ditulis
    if (WRITE_PATH !== SERVERLESS_DB_PATH) {
      fs.mkdirSync(path.dirname(SERVERLESS_DB_PATH), { recursive: true });
      fs.writeFileSync(SERVERLESS_DB_PATH, JSON.stringify({ showcases }, null, 2), "utf-8");
    } else {
      throw error;
    }
  }
}

export function newShowcaseId(): string {
  return randomUUID();
}

/** Batas panjang konten agar database tetap ringan */
export const MAX_CODE_LENGTH = 8000;
export const MAX_OUTPUT_LENGTH = 3000;

/** Bersihkan & validasi payload dari admin sebelum disimpan */
export function sanitizeShowcaseInput(body: unknown): Omit<Showcase, "id"> | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;

  const title = typeof b.title === "string" ? b.title.trim().slice(0, 60) : "";
  if (!title) return null;

  const rawCode = typeof b.code === "string" ? b.code.replace(/\r\n?/g, "\n") : "";
  const code = rawCode.replace(/\n+$/, ""); // buang baris kosong di akhir
  if (!code.trim()) return null;
  if (code.length > MAX_CODE_LENGTH) return null;

  const filename =
    typeof b.filename === "string" && b.filename.trim()
      ? b.filename.trim().slice(0, 120)
      : "materi/kode.txt";

  const output = typeof b.output === "string"
    ? b.output
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .map((line) => line.trimEnd())
        .filter((line) => line.trim().length > 0)
        .join("\n")
        .slice(0, MAX_OUTPUT_LENGTH)
    : "";

  return { title, filename, code, output };
}
