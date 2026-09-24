-- ╔══════════════════════════════════════════════════════════════════╗
-- ║   DATABASE PROGRAM LES KOMPUTER — SIAP UPLOAD KE NEON ✅          ║
-- ╚══════════════════════════════════════════════════════════════════╝
--
-- CARA UPLOAD KE NEON (2 menit):
-- 1. Buka https://neon.tech → login → klik project database Anda
-- 2. Di menu kiri, klik "SQL Editor"
-- 3. Copy SELURUH isi file ini (Ctrl+A lalu Ctrl+C)
-- 4. Paste ke kotak SQL Editor → klik tombol "Run"
-- 5. Selesai! Database langsung berisi:
--    - tabel "programs"  : 3 program les
--    - tabel "packages"  : 2 paket harga (LES BIASA / LES RESMI SERTIFIKAT)
--    - tabel "showcases" : 2 contoh kode (Pameran Kode / Contoh Materi)
--    (Lihat hasilnya di menu "Tables")
--
-- Catatan:
-- - File ini AMAN dijalankan berulang kali (data tidak akan dobel).
-- - Sebenarnya website juga bisa membuat tabel + mengisi data ini
--   OTOMATIS saat pertama kali tersambung ke Neon. File ini hanya
--   pilihan kalau Anda ingin mengisinya sendiri lebih dulu.
-- - Setelah database jadi, jangan lupa tempel "Connection string"
--   dari Neon ke file src/lib/db-config.ts di repo GitHub Anda.
-- ════════════════════════════════════════════════════════════════════

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
);

-- Untuk database yang sudah ada sebelum kolom gambar (aman dijalankan berulang)
ALTER TABLE programs ADD COLUMN IF NOT EXISTS image TEXT NOT NULL DEFAULT '';

-- Kolom harga bersertifikat khusus per program (aman dijalankan berulang)
ALTER TABLE programs ADD COLUMN IF NOT EXISTS certificate_price TEXT NOT NULL DEFAULT '';

-- Kolom materi lengkap untuk jendela detail program (aman dijalankan berulang)
ALTER TABLE programs ADD COLUMN IF NOT EXISTS materials TEXT NOT NULL DEFAULT '';

INSERT INTO programs (id, name, level, description, topics, materials, duration, price, icon, image)
VALUES
  (
    'office',
    'Microsoft Office',
    'Pemula - Menengah',
    'Kuasai aplikasi perkantoran yang paling banyak dibutuhkan di dunia kerja. Cocok untuk pelajar, mahasiswa, dan profesional.',
    '["Microsoft Word (dokumen & laporan)","Microsoft Excel (formula & grafik)","Microsoft PowerPoint (presentasi)","Internet, email & printing"]',
    '["Pengenalan komputer & Windows dasar","Microsoft Word: format dokumen, tabel & mail merge","Microsoft Excel: formula, VLOOKUP & grafik data","Microsoft PowerPoint: slide presentasi yang menarik","Internet, email profesional & teknik printing","Project akhir: laporan kerja + presentasi"]',
    '24 Sesi',
    'Rp 350.000',
    'office',
    '/images/programs/office.jpg'
  ),
  (
    'programming',
    'Pemrograman',
    'Pemula - Mahir',
    'Belajar coding dari nol dengan pendekatan praktis. Bangun website dan aplikasi pertamamu secara bertahap.',
    '["Dasar logika & algoritma","HTML, CSS & JavaScript","Python untuk pemula","Membangun project web sederhana"]',
    '["Dasar logika & algoritma pemrograman","HTML: membangun struktur halaman web","CSS: mempercantik tampilan website","JavaScript: membuat web interaktif","Python untuk pemula: variabel, perulangan & fungsi","Project akhir: membangun website sederhana"]',
    '32 Sesi',
    'Rp 500.000',
    'code',
    '/images/programs/programming.jpg'
  ),
  (
    'design',
    'Desain Grafis',
    'Pemula - Menengah',
    'Ciptakan desain yang menarik dengan Photoshop dan CorelDRAW. Cocok untuk usaha, karier kreatif, atau hobi.',
    '["Adobe Photoshop (edit foto)","CorelDRAW (vektor & layout)","Desain logo & branding","Desain poster & media sosial"]',
    '["Pengenalan dunia desain grafis & tools","Adobe Photoshop: edit foto & manipulasi gambar","CorelDRAW: desain vektor & layout","Desain logo & brand identity","Desain poster, brosur & media sosial","Project akhir: portofolio desain pribadi"]',
    '28 Sesi',
    'Rp 450.000',
    'design',
    '/images/programs/design.jpg'
  )
ON CONFLICT (id) DO NOTHING;

-- Isi gambar bawaan untuk program bawaan yang masih tanpa gambar
-- (aman dijalankan berulang, tidak menimpa gambar yang sudah ada)
UPDATE programs SET image = '/images/programs/office.jpg'
WHERE id = 'office' AND (image IS NULL OR image = '');
UPDATE programs SET image = '/images/programs/programming.jpg'
WHERE id = 'programming' AND (image IS NULL OR image = '');
UPDATE programs SET image = '/images/programs/design.jpg'
WHERE id = 'design' AND (image IS NULL OR image = '');

-- Isi materi lengkap bawaan untuk program bawaan yang masih kosong
-- (aman dijalankan berulang, tidak menimpa materi yang sudah diubah admin)
UPDATE programs SET materials = '["Pengenalan komputer & Windows dasar","Microsoft Word: format dokumen, tabel & mail merge","Microsoft Excel: formula, VLOOKUP & grafik data","Microsoft PowerPoint: slide presentasi yang menarik","Internet, email profesional & teknik printing","Project akhir: laporan kerja + presentasi"]'
WHERE id = 'office' AND (materials IS NULL OR materials = '');
UPDATE programs SET materials = '["Dasar logika & algoritma pemrograman","HTML: membangun struktur halaman web","CSS: mempercantik tampilan website","JavaScript: membuat web interaktif","Python untuk pemula: variabel, perulangan & fungsi","Project akhir: membangun website sederhana"]'
WHERE id = 'programming' AND (materials IS NULL OR materials = '');
UPDATE programs SET materials = '["Pengenalan dunia desain grafis & tools","Adobe Photoshop: edit foto & manipulasi gambar","CorelDRAW: desain vektor & layout","Desain logo & brand identity","Desain poster, brosur & media sosial","Project akhir: portofolio desain pribadi"]'
WHERE id = 'design' AND (materials IS NULL OR materials = '');

-- ╔══════════════════════════════════════════════════════════════════╗
-- ║   TABEL 2: PACKAGES — HARGA PAKET (LES BIASA / LES RESMI)          ║
-- ╚══════════════════════════════════════════════════════════════════╝
-- Pilihan jenis les yang tampil di bawah daftar program.
-- Bisa juga diubah lewat Admin → tab "Harga Paket" tanpa SQL sama sekali.

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
);

INSERT INTO packages (id, name, tagline, price_label, price, note, wa_message, highlight)
VALUES
  (
    'les-biasa',
    'LES BIASA',
    'Tanpa sertifikat',
    'Harga mulai',
    'Rp 350.000',
    'Harga tiap program berbeda — lihat pada kartu program di atas.',
    'Halo Admin LesKomputer! 👋 Saya ingin mendaftar LES BIASA (tanpa sertifikat). Terima kasih 🙏',
    FALSE
  ),
  (
    'les-resmi',
    'LES RESMI SERTIFIKAT',
    'Dengan sertifikat resmi',
    'Harga',
    'Rp 1.900.000',
    'Lengkap dengan sertifikat resmi — cocok untuk melamar kerja atau melengkapi portofolio.',
    'Halo Admin LesKomputer! 👋 Saya ingin bertanya tentang LES RESMI SERTIFIKAT. Terima kasih 🙏',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- ╔══════════════════════════════════════════════════════════════════╗
-- ║   TABEL 3: SHOWCASES — "PAMERAN KODE" (CONTOH MATERI)             ║
-- ╚══════════════════════════════════════════════════════════════════╝
-- Berisi contoh-contoh coding yang tampil di section "Contoh Materi"
-- (jendela editor dengan output terminal). Bisa juga dikelola lewat
-- Admin → tab "Pameran Kode" tanpa menyentuh SQL sama sekali.

CREATE TABLE IF NOT EXISTS showcases (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  filename TEXT NOT NULL,
  code TEXT NOT NULL,
  output TEXT NOT NULL DEFAULT '',
  seq BIGSERIAL NOT NULL UNIQUE
);

INSERT INTO showcases (id, title, filename, code, output)
VALUES
  (
    'cpp-dasar',
    'C++ Dasar',
    'materi-dasar/main.cpp',
    '#include <iostream>

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
}',
    'Panjang string var1 adalah 26
Panjang string var2 adalah 10
Panjang string var3 adalah 39'
  ),
  (
    'python-dasar',
    'Python Dasar',
    'materi-dasar/sapa.py',
    '# Belajar Python di LesKomputer
nama = "Peserta LesKomputer"
semangat = "Semangat!!"

def sapa(nama):
    return "Halo " + nama + ", selamat belajar!"

print(sapa(nama))
print("Jumlah huruf nama:", len(nama))
print(semangat)',
    'Halo Peserta LesKomputer, selamat belajar!
Jumlah huruf nama: 19
Semangat!!'
  )
ON CONFLICT (id) DO NOTHING;
