/**
 * Data paket harga (LES BIASA / LES RESMI SERTIFIKAT).
 * File ini AMAN untuk client (tanpa modul Node seperti fs/path),
 * sehingga bisa dipakai langsung oleh komponen landing page sebagai
 * nilai fallback saat API belum tersedia.
 */

/** Paket harga (pilihan jenis les) yang tampil di bagian bawah daftar program */
export interface PricingPackage {
  id: string;
  /** Nama paket, mis. "LES BIASA" */
  name: string;
  /** Deskripsi singkat di bawah nama, mis. "Tanpa sertifikat" */
  tagline: string;
  /** Label kecil di samping harga, mis. "Harga mulai" */
  priceLabel: string;
  /** Harga, mis. "Rp 350.000" */
  price: string;
  /** Catatan tambahan di dalam kartu paket */
  note: string;
  /** Pesan WhatsApp saat tombol paket ini diklik */
  waMessage: string;
  /** true = kartu ditonjolkan (warna hijau + ikon sertifikat) */
  highlight: boolean;
}

export const DEFAULT_PACKAGES: PricingPackage[] = [
  {
    id: "les-biasa",
    name: "LES BIASA",
    tagline: "Tanpa sertifikat",
    priceLabel: "Harga mulai",
    price: "Rp 350.000",
    note: "Harga tiap program berbeda — lihat pada kartu program di atas.",
    waMessage:
      "Halo Admin LesKomputer! 👋 Saya ingin mendaftar LES BIASA (tanpa sertifikat). Terima kasih 🙏",
    highlight: false,
  },
  {
    id: "les-resmi",
    name: "LES RESMI SERTIFIKAT",
    tagline: "Dengan sertifikat resmi",
    priceLabel: "Harga",
    price: "Rp 1.900.000",
    note:
      "Lengkap dengan sertifikat resmi — cocok untuk melamar kerja atau melengkapi portofolio.",
    waMessage:
      "Halo Admin LesKomputer! 👋 Saya ingin bertanya tentang LES RESMI SERTIFIKAT. Terima kasih 🙏",
    highlight: true,
  },
];
