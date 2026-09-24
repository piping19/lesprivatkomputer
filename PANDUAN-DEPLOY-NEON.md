# 📗 PANDUAN DEPLOY — Database Neon + Vercel

> Tujuan: setiap perubahan program lewat **Login Admin** **TERSIMPAN PERMANEN**
> di database **Neon** (gratis), tidak hilang lagi seperti sebelumnya.
>
> Ikuti 3 tahap di bawah **berurutan, jangan ada yang dilewati**.

---

## ✅ TAHAP 1 — Upload ke GitHub dengan cara yang BENAR

> ⚠️ Error **404 "This page doesn't exist"** di Vercel terjadi karena upload GitHub salah:
> isi website masuk ke dalam sebuah folder, bukan di halaman depan repo.
> Ikuti langkah ini persis.

1. **Extract (unzip)** file `les-komputer-website.zip` di komputer Anda.
2. **BUKA / masuk ke dalam** folder hasil extract — sampai Anda melihat
   `package.json`, folder `src`, folder `public`, dll.
3. Tekan **Ctrl + A** (pilih SEMUA file & folder di dalamnya).
4. Buka [github.com](https://github.com) → login → klik **+** (kanan atas) → **New repository**.
   - Nama: `les-komputer` (bebas)
   - Pilih **Private** (disarankan) atau Public
   - Klik **Create repository**
5. Di halaman repo baru, klik link **uploading an existing file**.
6. **Drag / pilih semua file** hasil Ctrl+A tadi ke area upload GitHub.
7. Tunggu sampai semua selesai di-upload → klik **Commit changes**.

### 🔍 CARA CEK BENAR / SALAH (WAJIB!)

Buka halaman depan repo GitHub Anda. Harus terlihat seperti ini:

```
✅ BENAR                          ❌ SALAH (penyebab 404!)
─────────────────────             ─────────────────────
package.json                      les-komputer/
next.config.ts                    (hanya ada 1 folder,
src/                               isi website tersembunyi
public/                            di dalamnya)
README.md
...
```

Jika di halaman depan repo Anda **hanya ada 1 folder** → upload Anda salah.
Hapus isinya, lalu ulangi dari langkah 3 (masuk ke dalam folder dulu, baru pilih semua).

---

## 🚀 TAHAP 2 — Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) → login (pakai akun GitHub Anda).
2. Klik **Add New… → Project**.
3. Cari repo `les-komputer` yang barusan Anda buat → klik **Import**.
4. **Tidak perlu mengatur apa pun** — biarkan setting default.
5. Klik **Deploy** → tunggu ±1–2 menit.
6. Jika berhasil, muncul tombol **Continue to Dashboard** / **Visit**.
   Website Anda sudah online! 🎉

> Jika masih 404 setelah deploy → berarti TAHAP 1 masih salah (package.json
> tidak di halaman depan repo). Perbaiki TAHAP 1 dulu.

---

## 🗄️ TAHAP 3 — Buat Database Neon & Sambungkan (agar data permanen)

Pilih **salah satu** cara di bawah. **Cara A paling mudah dan paling anti-gagal** —
tanpa menyentuh Vercel sama sekali, cukup edit 1 file langsung di website GitHub.

### CARA A — Tempel 1 baris di file `db-config.ts` (PALING MUDAH, RECOMMENDED)

1. Buka [neon.tech](https://neon.tech) → **Sign Up** (boleh pakai Google/GitHub).
2. Klik **Create project** → nama bebas → **Create** → tunggu ±10 detik.
3. Akan muncul kotak **Connection string** yang diawali `postgresql://…`
   → klik ikon **salin/copy**.
4. Buka repo GitHub Anda → masuk ke folder **`src/lib`** → klik file
   **`db-config.ts`** → klik ikon **PENSIL ✏️** (Edit this file).
5. Tempel (paste) connection string **di antara tanda kutip**, sehingga menjadi:

   ```ts
   export const MANUAL_DATABASE_URL = "postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require";
   ```

   ⚠️ Jangan hapus tanda kutip `"` — hanya ganti isi di dalamnya.

6. Klik **Commit changes** → Vercel otomatis deploy ulang (±1 menit). ✅
7. Selesai! Tidak perlu Vercel Storage, tidak perlu environment variables.

#### (Opsional) Upload isi database sendiri lewat SQL Editor

Kalau Anda ingin database-nya **langsung berisi data** sebelum website tersambung:

1. Di project Neon, klik **SQL Editor** (menu kiri dashboard).
2. Buka file **`database.sql`** dari ZIP ini → copy semua isinya (Ctrl+A, Ctrl+C).
3. Paste ke kotak SQL Editor → klik **Run**.
4. Cek menu **Tables** → tabel **programs** → 3 program les langsung terlihat. ✅
   File yang sama juga membuat tabel **showcases** (Pameran Kode / contoh coding
   di section "Contoh Materi").

> Tidak wajib — website juga otomatis membuat tabel + mengisi data bawaan saat
> pertama kali tersambung ke Neon. Data yang nanti Anda tambah lewat panel admin
> otomatis masuk ke database yang sama. File ini aman dijalankan berulang
> (data tidak akan dobel).

> 🔒 Disarankan repo Anda **Private** (lihat TAHAP 1) agar connection string
> tidak terlihat orang lain.

### CARA B — Otomatis lewat Vercel Storage (jika Cara A gagal)

1. Buka project Anda di dashboard Vercel.
2. Klik tab **Storage** (menu atas dalam project).
3. Klik **Create Database** → pilih **Neon** → **Continue**.
4. Pilih plan **Free** (gratis) → daftar/login Neon boleh pakai akun GitHub.
5. Di bagian **Connect to project**, pilih project website Anda → klik **Connect**.
6. Vercel otomatis membuat database Neon, mengisi `DATABASE_URL`,
   dan **men-deploy ulang** website Anda. Tunggu ±1 menit. ✅

### CARA C — Manual lewat environment variable Vercel

1. Copy connection string dari [neon.tech](https://neon.tech) (seperti Cara A langkah 1–3).
2. Vercel → project Anda → **Settings → Environment Variables** → tambah:
   - **Key** : `DATABASE_URL`
   - **Value** : tempel connection string tadi
   - Environment: biarkan semua tercentang → **Save**
3. Tab **Deployments** → deployment teratas → **⋯ → Redeploy**. ✅

---

## 🔍 CARA MEMASTIKAN SUDAH BERHASIL

1. Buka alamat website Anda, tambahkan `/api/programs` di belakangnya,
   contoh: `https://les-komputer.vercel.app/api/programs`
   - Lihat bagian `"storage"`:
     - `"storage":"database"` → 🎉 **Berhasil! Data permanen.**
     - `"storage":"file"` → database belum tersambung, ulangi TAHAP 3.
2. Buka website → **Login Admin** (admin / admin123) → ubah sesuatu → simpan.
3. Refresh halaman — perubahan masih ada = **BERHASIL**.
4. Di panel admin juga muncul **badge hijau**
   *"Penyimpanan: Database — perubahan tersimpan permanen"*.

### 👀 Cara melihat isi database Anda di Neon

1. Buka [neon.tech](https://neon.tech) → masuk ke project Anda.
2. Klik **Tables** (menu kiri) → klik tabel **programs**.
3. Semua data program (nama, harga, materi) terlihat di situ — data ini
   yang tampil di website dan berubah otomatis saat admin mengedit.
4. Ada juga tabel **showcases** — berisi contoh-contoh kode (Pameran Kode)
   yang tampil di section "Contoh Materi". Tabel ini bisa dikelola langsung
   dari **Login Admin → tab "Pameran Kode"** tanpa perlu buka Neon.
5. Ingin mengisi database secara manual? Gunakan **SQL Editor** + file
   **`database.sql`** (lihat TAHAP 3 Cara A, langkah opsional).

---

## ❓ MASALAH UMUM

| Gejala | Penyebab | Solusi |
| --- | --- | --- |
| Vercel 404 "This page doesn't exist" | `package.json` tidak di halaman depan repo GitHub | Perbaiki TAHAP 1 |
| `/api/programs` menampilkan `"storage":"file"` | Database Neon belum tersambung | Kerjakan TAHAP 3 (Cara A) |
| Sudah tempel URL di `db-config.ts` tapi masih `"file"` | URL belum ter-commit / tanda kutip hilang / deploy belum selesai | Cek file di GitHub, tunggu redeploy selesai, cek lagi |
| Perubahan admin hilang setelah beberapa jam | Masih mode file (sementara di Vercel) | Kerjakan TAHAP 3 |
| Salah ketik connection string | Value salah / terpotong | Perbaiki lagi lewat ikon pensil ✏️ di GitHub atau hapus env var lalu ulangi |
| Error setelah commit URL di `db-config.ts` | Tanda kutip terhapus / URL tidak diawali `postgresql://` | Edit ulang file, pastikan persis seperti contoh |

> Tabel & data program bawaan dibuat **otomatis** di Neon saat pertama kali
> tersambung — tidak perlu setup SQL apa pun.
