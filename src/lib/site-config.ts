/**
 * Konfigurasi utama website Les Komputer.
 * Ubah nomor WhatsApp di bawah ini jika nomor berubah.
 * Format: kode negara (62) + nomor tanpa angka 0 di depan.
 * Contoh: 083147850671 -> 6283147850671
 */
export const WHATSAPP_NUMBER = "6283147850671";

/** Format nomor untuk ditampilkan ke pengunjung */
export const WHATSAPP_DISPLAY = "0831-4785-0671";

/** Alamat lengkap lokasi les */
export const ADDRESS =
  "Jl. Diponegoro RT/RW 01/01, Kadisoka, Kalasan, Sleman, DIY";

export const SITE = {
  name: "LesKomputer",
  tagline: "Kursus Komputer Terbaik untuk Semua",
  description:
    "Les komputer dengan program Microsoft Office, Pemrograman, dan Desain Grafis (Photoshop & CorelDRAW). Pembelajaran praktis dengan instruktur berpengalaman.",
} as const;

/** Membuat link WhatsApp dengan pesan otomatis */
export function waLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const WA_MESSAGES = {
  general:
    "Halo Admin LesKomputer! 👋 Saya tertarik dengan program les komputer. Boleh minta info jadwal, biaya, dan cara pendaftarannya? Terima kasih 🙏",
} as const;

/** Pesan pendaftaran untuk program tertentu (dipakai tombol di kartu program) */
export function waProgramMessage(programName: string): string {
  return `Halo Admin LesKomputer! 👋 Saya peserta baru dan ingin mendaftar program les *${programName}*. Boleh minta info jadwal, biaya, dan cara pendaftarannya? Terima kasih 🙏`;
}

export const NAV_LINKS = [
  { label: "Beranda", href: "#beranda" },
  { label: "Program", href: "#program" },
  { label: "Keunggulan", href: "#keunggulan" },
  { label: "Materi", href: "#materi" },
  { label: "Kontak", href: "#kontak" },
] as const;

export const ADMIN_TOKEN_KEY = "leskom_admin_token";
