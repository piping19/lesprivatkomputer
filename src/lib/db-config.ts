/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║   KONEKSI DATABASE (NEON) — CUKUP TEMPEL 1 BARIS DI SINI! ✏️      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * AGAR PERUBAHAN ADMIN TERSIMPAN PERMANEN DI VERCEL:
 *
 * 1. Buat database gratis di https://neon.tech
 *    - Sign up (boleh pakai akun Google/GitHub)
 *    - Klik "Create project" → tunggu sebentar
 *    - Cari tulisan "Connection string" yang diawali  postgresql://
 *    - Klik ikon salin (copy)
 *
 * 2. Buka file ini di website GitHub Anda:
 *    src/lib/db-config.ts  →  klik ikon PENSIL ✏️ (Edit this file)
 *
 * 3. Tempel (paste) connection string di antara tanda kutip di bawah,
 *    contoh:
 *    export const MANUAL_DATABASE_URL = "postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require";
 *
 * 4. Klik "Commit changes" → Vercel otomatis deploy ulang (±1 menit).
 *    SELESAI! Data admin kini tersimpan permanen. ✅
 *
 * ────────────────────────────────────────────────────────────────────
 * Cek berhasil / belum:
 * buka  https://alamat-website-anda.vercel.app/api/programs
 * jika  "storage":"database"  →  berhasil! 🎉
 * ────────────────────────────────────────────────────────────────────
 * Kosongkan ("") untuk memakai mode file biasa (lokal / belum ada Neon).
 * Baris di bawah ini TIDAK perlu diubah — hanya isi tanda kutipnya saja.
 */

export const MANUAL_DATABASE_URL = "";
