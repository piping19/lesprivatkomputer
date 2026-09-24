# 🖥️ Les Komputer — Website Kursus Komputer

Website landing page untuk usaha les/kursus komputer dengan **panel admin** untuk mengelola program les (nama, harga, materi) dan **pameran kode** (contoh-contoh coding di section Materi). Dibangun dengan [Next.js 16](https://nextjs.org) (App Router), TypeScript, Tailwind CSS 4, shadcn/ui, dan Framer Motion.

## ✨ Fitur

- **Landing page** satu halaman: hero, program, keunggulan, contoh materi, CTA, footer
- **Program dinamis** — data diambil dari API, bisa dikelola admin (termasuk gambar tiap program)
- **Pameran Kode dinamis** — contoh-contoh kode di section "Contoh Materi" bisa ditambah/ubah/hapus dari admin (C++, Python, Java, dll — otomatis berwarna seperti editor sungguhan)
- **Pendaftaran via WhatsApp** — setiap kartu program punya tombol yang langsung membuka chat WA dengan pesan otomatis
- **Login admin + CRUD** — kelola Program Les & Pameran Kode dari satu panel admin
- **Responsif penuh** (mobile & desktop) dan ringan

## 🔐 Login Admin — Tanpa Setup Apa Pun ✅

**Tidak perlu mengatur environment variables sama sekali.** Website langsung jalan begitu di-deploy.

Kredensial bawaan (sudah tertanam di kode, otomatis aktif):

| Username | Password   |
| -------- | ---------- |
| `admin`  | `admin123` |

Tombol **Login Admin** ada di bagian bawah footer.

### Ingin mengganti password?
Tidak perlu environment variables — cukup **edit 1 baris di `src/lib/auth.ts`**:

```ts
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
//                                                              ^^^^^^^^^ ganti di sini
```

Ubah `"admin123"` menjadi password yang Anda mau, lalu commit & push — selesai.

## 💾 Penyimpanan Data — Agar Perubahan Admin Tersimpan Permanen di Vercel

Vercel **serverless tidak punya penyimpanan file permanen** — file `/tmp` hilang saat server
restart/redeploy. Karena itu, perubahan program lewat panel admin bisa "menghilang" jika
website masih memakai mode file.

Solusinya: hubungkan **database gratis Neon** (Postgres) — cukup **tempel 1 baris
URL di 1 file** (bisa langsung lewat website GitHub), tanpa environment variables,
tanpa Vercel Storage:

### Cara A — Tempel 1 baris di `src/lib/db-config.ts` (PALING MUDAH, recommended)

1. Buat database gratis di [neon.tech](https://neon.tech) → **Create project** → copy **Connection string** (`postgresql://…`)
2. Di repo GitHub, buka **`src/lib/db-config.ts`** → klik ikon **pensil ✏️** → tempel URL di antara tanda kutip:

   ```ts
   export const MANUAL_DATABASE_URL = "postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require";
   ```

3. **Commit changes** → Vercel otomatis deploy ulang → selesai ✅ (tanpa Vercel Storage, tanpa environment variables)

> 📦 **Ingin mengisi database secara manual?** Buka **SQL Editor** di dashboard Neon,
> paste isi file **`database.sql`** (ikut dalam project) → klik **Run** → database
> langsung berisi 3 program les + 2 contoh kode (Pameran Kode). Lihat datanya lewat
> menu **Tables → programs / showcases**.
> (Tidak wajib — website juga mengisi otomatis saat pertama kali tersambung.)

### Cara B — Otomatis lewat Vercel Storage (jika Cara A gagal)

1. Buka dashboard [vercel.com](https://vercel.com) → pilih **project** Anda
2. Buka tab **Storage** → klik **Create Database**
3. Pilih **Neon** → **Continue** → pilih plan **Free** (Gratis)
4. Di bagian **Connect to project**, pilih project website Anda → klik **Connect**
5. Vercel otomatis membuat database Neon, mengisi `DATABASE_URL`, dan men-deploy ulang — tunggu ±1 menit ✅

### Cara C — Manual env variable (alternatif lain)

Vercel → **Settings → Environment Variables** → Key: `DATABASE_URL`, Value: connection string Neon → **Save** → **Deployments → ⋯ → Redeploy** ✅

### Cara cek berhasil / belum

Buka `https://alamat-website-anda.vercel.app/api/programs` — jika
`"storage":"database"` berarti database aktif; jika `"storage":"file"`
berarti database belum tersambung (atau deploy ulang belum selesai).

Ringkasan mode penyimpanan:

| Mode                 | Kapan aktif                                   | Sifat data                      |
| -------------------- | --------------------------------------------- | ------------------------------- |
| Database (Neon)      | `DATABASE_URL` ada (setelah hubungkan Storage)| **Permanen** di Postgres        |
| File                 | Lokal (dev/self-host) → `db/programs.json`    | Permanen                        |
| File (sementara)     | Vercel tanpa database → `/tmp`                | Sementara (hilang saat restart) |

> Tabel & data bawaan dibuat otomatis saat pertama kali database dipakai — tidak ada setup SQL.
> ⚠️ Program yang dibuat **sebelum** database terhubung tidak dapat dipulihkan (file `/tmp`
> sudah hilang) — silakan buat ulang lewat panel admin; setelah itu semua tersimpan permanen.
> Berjalan juga dengan Postgres lain (Supabase, Railway, dll) yang menyediakan `DATABASE_URL`.

## 🚀 Deploy ke Vercel via GitHub

> ⚠️ **Penting:** repo GitHub Anda harus menampilkan **`package.json`** di
> **halaman depan repo**. Jika isinya hanya 1 folder → Vercel akan error
> **404 "This page doesn't exist"**. Panduan lengkap anti-gagal:
> lihat **[PANDUAN-DEPLOY-NEON.md](./PANDUAN-DEPLOY-NEON.md)**.

1. **Push project ini ke repositori GitHub** — pastikan `package.json` langsung terlihat di halaman depan repo.
2. Buka [vercel.com](https://vercel.com) → login → **Add New… → Project**.
3. **Import** repositorinya. Vercel otomatis mendeteksi **Next.js** — biarkan semua setting default (Build Command: `next build`).
4. **Langsung klik Deploy.** Tidak ada yang perlu diatur — tanpa environment variables, tanpa konfigurasi tambahan. 🎉
5. Setelah online, sambungkan database Neon (bagian *Penyimpanan Data* di atas) agar perubahan admin tersimpan permanen.
6. Setiap push berikutnya ke GitHub otomatis ter-deploy ulang.

> **Catatan:** login admin otomatis memakai bawaan `admin` / `admin123`. Ingin menggantinya? Cukup edit 1 baris di `src/lib/auth.ts` (lihat bagian *Login Admin* di atas).

## 💻 Menjalankan di Komputer Lokal

```bash
# pastikan Node.js >= 20 terpasang
npm install        # atau: bun install / pnpm install
npm run dev        # buka http://localhost:3000
```

Build production:

```bash
npm run build      # untuk deploy (Vercel otomatis menjalankan ini)
npm run start:next # preview hasil build secara lokal
```

## 📦 Struktur Penting

```
src/
├── app/
│   ├── page.tsx                  # Halaman utama (landing)
│   └── api/
│       ├── programs/route.ts     # GET program (publik)
│       └── admin/
│           ├── login/route.ts    # POST login admin
│           └── programs/route.ts # POST/PUT/DELETE program (butuh token)
├── components/
│   ├── landing/                  # Hero, program, materi, footer, dll.
│   └── admin/admin-dialog.tsx    # Dialog login + kelola program
└── lib/
    ├── site-config.ts            # ⚠️ Nomor WhatsApp & alamat (edit di sini)
    ├── json-db.ts                # "Database" file JSON + data seed
    ├── auth.ts                   # Token HMAC untuk admin
    └── store.ts                  # State global (zustand)
db/programs.json                  # Data program (lokal)
```

## 📱 Mengganti Nomor WhatsApp / Alamat

Semua kontak terpusat di **`src/lib/site-config.ts`** — cukup ubah `WHATSAPP_NUMBER`, `WHATSAPP_DISPLAY`, dan `ADDRESS` lalu commit & push.
