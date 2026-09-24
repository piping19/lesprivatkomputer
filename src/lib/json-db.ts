import fs from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import { DEFAULT_PACKAGES, type PricingPackage } from "./packages-data";

// Re-export agar kode server lama yang mengimpor dari json-db tetap berfungsi
export { DEFAULT_PACKAGES, type PricingPackage } from "./packages-data";

/**
 * Database sederhana berbasis file JSON.
 * - Lokal (dev/self-host): data tersimpan permanen di db/programs.json
 * - Vercel/serverless: filesystem project read-only, sehingga penulisan
 *   diarahkan ke /tmp (data bertahan selama instance hang; lihat README
 *   untuk opsi penyimpanan permanen).
 * Jika file tidak ada / rusak, dipakai DEFAULT_PROGRAMS di bawah.
 */
export interface Program {
  id: string;
  name: string;
  level: string;
  description: string;
  topics: string[];
  duration: string;
  price: string;
  icon: string; // 'office' | 'code' | 'design' | 'book'
  /**
   * Harga les BERSERTIFIKAT khusus program ini (opsional).
   * Kosong = kartu memakai harga paket global (tab Harga Paket).
   */
  certificatePrice?: string;
  /**
   * Materi lengkap program (opsional) — tampil pada jendela detail
   * program (link ?program=...). Jika kosong, dipakai daftar topics.
   */
  materials?: string[];
  /**
   * Gambar program (opsional). Berupa:
   * - path publik  : "/images/programs/office.jpg"
   * - data URL     : "data:image/jpeg;base64,..." (hasil upload admin)
   * - URL eksternal: "https://..."
   */
  image?: string;
}

const LOCAL_DB_PATH = path.join(process.cwd(), "db", "programs.json");
const SERVERLESS_DB_PATH = path.join(os.tmpdir(), "leskomputer-programs.json");

const LOCAL_PACKAGES_PATH = path.join(process.cwd(), "db", "packages.json");
const SERVERLESS_PACKAGES_PATH = path.join(os.tmpdir(), "leskomputer-packages.json");

// Vercel selalu menyetel env VERCEL=1 pada runtime serverless
const IS_SERVERLESS = process.env.VERCEL === "1";

const WRITE_PATH = IS_SERVERLESS ? SERVERLESS_DB_PATH : LOCAL_DB_PATH;
const READ_PATHS = IS_SERVERLESS ? [SERVERLESS_DB_PATH, LOCAL_DB_PATH] : [LOCAL_DB_PATH];

export const DEFAULT_PROGRAMS: Program[] = [
  {
    id: "office",
    name: "Microsoft Office",
    level: "Pemula - Menengah",
    description:
      "Kuasai aplikasi perkantoran yang paling banyak dibutuhkan di dunia kerja. Cocok untuk pelajar, mahasiswa, dan profesional.",
    topics: [
      "Microsoft Word (dokumen & laporan)",
      "Microsoft Excel (formula & grafik)",
      "Microsoft PowerPoint (presentasi)",
      "Internet, email & printing",
    ],
    duration: "24 Sesi",
    price: "Rp 350.000",
    icon: "office",
    image: "/images/programs/office.jpg",
    materials: [
      "Pengenalan komputer & Windows dasar",
      "Microsoft Word: format dokumen, tabel & mail merge",
      "Microsoft Excel: formula, VLOOKUP & grafik data",
      "Microsoft PowerPoint: slide presentasi yang menarik",
      "Internet, email profesional & teknik printing",
      "Project akhir: laporan kerja + presentasi",
    ],
  },
  {
    id: "programming",
    name: "Pemrograman",
    level: "Pemula - Mahir",
    description:
      "Belajar coding dari nol dengan pendekatan praktis. Bangun website dan aplikasi pertamamu secara bertahap.",
    topics: [
      "Dasar logika & algoritma",
      "HTML, CSS & JavaScript",
      "Python untuk pemula",
      "Membangun project web sederhana",
    ],
    duration: "32 Sesi",
    price: "Rp 500.000",
    icon: "code",
    image: "/images/programs/programming.jpg",
    materials: [
      "Dasar logika & algoritma pemrograman",
      "HTML: membangun struktur halaman web",
      "CSS: mempercantik tampilan website",
      "JavaScript: membuat web interaktif",
      "Python untuk pemula: variabel, perulangan & fungsi",
      "Project akhir: membangun website sederhana",
    ],
  },
  {
    id: "design",
    name: "Desain Grafis",
    level: "Pemula - Menengah",
    description:
      "Ciptakan desain yang menarik dengan Photoshop dan CorelDRAW. Cocok untuk usaha, karier kreatif, atau hobi.",
    topics: [
      "Adobe Photoshop (edit foto)",
      "CorelDRAW (vektor & layout)",
      "Desain logo & branding",
      "Desain poster & media sosial",
    ],
    duration: "28 Sesi",
    price: "Rp 450.000",
    icon: "design",
    image: "/images/programs/design.jpg",
    materials: [
      "Pengenalan dunia desain grafis & tools",
      "Adobe Photoshop: edit foto & manipulasi gambar",
      "CorelDRAW: desain vektor & layout",
      "Desain logo & brand identity",
      "Desain poster, brosur & media sosial",
      "Project akhir: portofolio desain pribadi",
    ],
  },
];

function readFrom(filePath: string): Program[] | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as { programs?: Program[] };
    if (Array.isArray(data.programs)) {
      return data.programs;
    }
  } catch {
    // File belum ada / tidak bisa dibaca / rusak
  }
  return null;
}

export function readPrograms(): Program[] {
  for (const filePath of READ_PATHS) {
    const data = readFrom(filePath);
    if (data) return data;
  }
  return DEFAULT_PROGRAMS;
}

export function writePrograms(programs: Program[]): void {
  try {
    fs.mkdirSync(path.dirname(WRITE_PATH), { recursive: true });
    fs.writeFileSync(WRITE_PATH, JSON.stringify({ programs }, null, 2), "utf-8");
  } catch (error) {
    // Fallback terakhir bila path utama tak bisa ditulis (mis. filesystem read-only)
    if (WRITE_PATH !== SERVERLESS_DB_PATH) {
      fs.mkdirSync(path.dirname(SERVERLESS_DB_PATH), { recursive: true });
      fs.writeFileSync(SERVERLESS_DB_PATH, JSON.stringify({ programs }, null, 2), "utf-8");
    } else {
      throw error;
    }
  }
}

export function newProgramId(): string {
  return randomUUID();
}

/* ============ Paket harga (LES BIASA / LES RESMI SERTIFIKAT) ============ */

function readPackagesFrom(filePath: string): PricingPackage[] | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as { packages?: PricingPackage[] };
    if (Array.isArray(data.packages)) {
      return data.packages;
    }
  } catch {
    // File belum ada / tidak bisa dibaca / rusak
  }
  return null;
}

export function readPackages(): PricingPackage[] {
  const paths = IS_SERVERLESS
    ? [SERVERLESS_PACKAGES_PATH, LOCAL_PACKAGES_PATH]
    : [LOCAL_PACKAGES_PATH];
  for (const filePath of paths) {
    const data = readPackagesFrom(filePath);
    if (data) return data;
  }
  return DEFAULT_PACKAGES;
}

export function writePackages(packages: PricingPackage[]): void {
  try {
    fs.mkdirSync(path.dirname(WRITE_PATH), { recursive: true });
    fs.writeFileSync(
      IS_SERVERLESS ? SERVERLESS_PACKAGES_PATH : LOCAL_PACKAGES_PATH,
      JSON.stringify({ packages }, null, 2),
      "utf-8"
    );
  } catch (error) {
    if (!IS_SERVERLESS) {
      fs.mkdirSync(path.dirname(SERVERLESS_PACKAGES_PATH), { recursive: true });
      fs.writeFileSync(SERVERLESS_PACKAGES_PATH, JSON.stringify({ packages }, null, 2), "utf-8");
    } else {
      throw error;
    }
  }
}

export function newPackageId(): string {
  return randomUUID();
}

/** Bersihkan & validasi payload paket harga dari admin */
export function sanitizePackageInput(body: unknown): Omit<PricingPackage, "id"> | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) return null;

  const price = typeof b.price === "string" ? b.price.trim() : "";
  if (!price) return null;

  return {
    name,
    tagline: typeof b.tagline === "string" ? b.tagline.trim() : "",
    priceLabel:
      typeof b.priceLabel === "string" && b.priceLabel.trim()
        ? b.priceLabel.trim()
        : "Harga",
    price,
    note: typeof b.note === "string" ? b.note.trim() : "",
    waMessage:
      typeof b.waMessage === "string" && b.waMessage.trim()
        ? b.waMessage.trim()
        : "Halo Admin LesKomputer! 👋 Saya ingin bertanya tentang paket les. Terima kasih 🙏",
    highlight: b.highlight === true,
  };
}

/** Bersihkan & validasi payload dari admin sebelum disimpan */
export function sanitizeProgramInput(body: unknown): Omit<Program, "id"> | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) return null;

  const topics = Array.isArray(b.topics)
    ? b.topics.map((t) => String(t).trim()).filter(Boolean)
    : [];
  if (topics.length === 0) return null;

  const materials = Array.isArray(b.materials)
    ? b.materials.map((t) => String(t).trim()).filter(Boolean)
    : [];

  const allowedIcons = ["office", "code", "design", "book"];

  /**
   * Gambar opsional: boleh data URL (upload admin), path publik (/...),
   * atau URL eksternal (https://...). Ditolak jika bukan format itu atau
   * terlalu besar (> ±900 ribu karakter base64) agar database tetap ringan.
   */
  const rawImage = typeof b.image === "string" ? b.image.trim() : "";
  const imageOk =
    /^data:image\/(png|jpe?g|webp|gif);base64,/.test(rawImage) ||
    /^(https?:\/\/|\/)/.test(rawImage);
  const image = imageOk && rawImage.length <= 900_000 ? rawImage : "";

  return {
    name,
    level: typeof b.level === "string" && b.level.trim() ? b.level.trim() : "Pemula",
    description:
      typeof b.description === "string" && b.description.trim()
        ? b.description.trim()
        : `Program les ${name} dengan pembelajaran praktis dan pendampingan instruktur berpengalaman.`,
    topics,
    duration:
      typeof b.duration === "string" && b.duration.trim() ? b.duration.trim() : "16 Sesi",
    price: typeof b.price === "string" ? b.price.trim() : "",
    certificatePrice:
      typeof b.certificatePrice === "string" ? b.certificatePrice.trim() : "",
    materials,
    icon: typeof b.icon === "string" && allowedIcons.includes(b.icon) ? b.icon : "book",
    image,
  };
}
