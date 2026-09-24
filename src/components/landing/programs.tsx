"use client";

import { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  FileSpreadsheet,
  Code2,
  Palette,
  BookOpen,
  Check,
  Link2,
  MessageCircle,
  Clock,
  GraduationCap,
  Wallet,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppStore } from "@/lib/store";
import { waLink, waProgramMessage } from "@/lib/site-config";
import { DEFAULT_PACKAGES, type PricingPackage } from "@/lib/packages-data";
import type { Program } from "@/lib/json-db";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, { icon: LucideIcon; className: string }> = {
  office: { icon: FileSpreadsheet, className: "bg-sky-100 text-sky-600" },
  code: { icon: Code2, className: "bg-indigo-100 text-indigo-600" },
  design: { icon: Palette, className: "bg-emerald-100 text-emerald-600" },
  book: { icon: BookOpen, className: "bg-cyan-100 text-cyan-600" },
};

const FALLBACK_ICON = ICON_MAP.book;

/** Ubah nama program jadi slug ramah-URL, cth: "Microsoft Office" → "microsoft-office" */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Parameter URL (?program=...) untuk sebuah program — slug nama, fallback id */
function programParam(program: Program): string {
  return slugify(program.name) || program.id;
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export function Programs() {
  const { programs, programsLoading, fetchPrograms, packages, fetchPackages } =
    useAppStore();

  /** ID program yang sedang dibuka di jendela detail */
  const [detailId, setDetailId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Tanda agar ?program=... di URL hanya diproses sekali setelah data termuat */
  const autoOpenRef = useRef(false);

  useEffect(() => {
    void fetchPrograms();
    void fetchPackages();
  }, [fetchPrograms, fetchPackages]);

  // Bersihkan timer feedback "Link Tersalin!" saat komponen hilang
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  /** Buka otomatis jendela detail bila URL berisi ?program=<slug|id> */
  useEffect(() => {
    if (programsLoading || autoOpenRef.current) return;
    autoOpenRef.current = true;
    if (typeof window === "undefined") return;
    const param = new URLSearchParams(window.location.search).get("program");
    if (!param) return;
    const target = programs.find(
      (p) => p.id === param || slugify(p.name) === param.toLowerCase()
    );
    if (!target) return;
    // Tunda 1 tick agar bukan setState sinkron di dalam effect (react-hooks)
    const timer = setTimeout(() => setDetailId(target.id), 0);
    return () => clearTimeout(timer);
  }, [programs, programsLoading]);

  const detailProgram = programs.find((p) => p.id === detailId) ?? null;

  /** Sinkronkan URL tanpa navigasi ulang — agar link detail bisa disalin */
  function syncDetailUrl(program: Program | null) {
    if (typeof window === "undefined") return;
    const url = program
      ? `${window.location.pathname}?program=${encodeURIComponent(programParam(program))}`
      : window.location.pathname;
    window.history.replaceState(null, "", url);
  }

  function openDetail(program: Program) {
    setDetailId(program.id);
    setCopied(false);
    syncDetailUrl(program);
  }

  function closeDetail() {
    setDetailId(null);
    setCopied(false);
    syncDetailUrl(null);
  }

  async function handleCopyLink() {
    if (!detailProgram) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?program=${encodeURIComponent(programParam(detailProgram))}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // Fallback browser lama / konteks non-HTTPS
      const helper = document.createElement("textarea");
      helper.value = shareUrl;
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      try {
        document.execCommand("copy");
      } catch {
        // diamkan — feedback tetap tampil
      }
      document.body.removeChild(helper);
    }
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  }

  /** Paket harga dari database; jika belum ada, pakai nilai bawaan */
  const displayPackages: PricingPackage[] =
    packages.length > 0 ? packages : DEFAULT_PACKAGES;
  const highlighted = displayPackages.find((p) => p.highlight);
  const sertifikatPrice = highlighted?.price ?? "Rp 1.900.000";

  return (
    <section
      id="program"
      className="scroll-mt-20 bg-gradient-to-b from-white via-sky-50/60 to-white py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Judul section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <span className="mb-3 inline-block rounded-full bg-sky-100 px-4 py-1.5 text-sm font-bold text-sky-700">
            Program Les
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
            Pilih Program yang{" "}
            <span className="bg-gradient-to-r from-sky-600 to-emerald-500 bg-clip-text text-transparent">
              Sesuai Maumu
            </span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Klik{" "}
            <strong className="font-semibold text-slate-700">Lihat Detail</strong> untuk
            melihat materi lengkap tiap program — link halamannya bisa disalin &
            dibagikan di berbagai platform. Siap lanjut? Tekan tombol daftar untuk langsung
            terhubung dengan admin kami via WhatsApp.
          </p>
        </motion.div>

        {/* Skeleton saat memuat */}
        {programsLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Memuat program">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm sm:p-7">
                <div className="mb-5 flex items-center justify-between">
                  <Skeleton className="h-14 w-14 rounded-2xl" />
                  <Skeleton className="h-6 w-28 rounded-full" />
                </div>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-3/4" />
                <div className="mt-6 space-y-3">
                  {[0, 1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
                <Skeleton className="mt-6 h-11 w-full rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* Kartu program dari database */}
        {!programsLoading && programs.length > 0 && (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {programs.map((program) => {
              const meta = ICON_MAP[program.icon] ?? FALLBACK_ICON;
              const Icon = meta.icon;
              return (
                <motion.article
                  key={program.id}
                  variants={card}
                  className="group relative flex flex-col rounded-3xl border border-sky-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-sky-100 sm:p-7"
                >
                  {/* Gambar program (jika ada) */}
                  {program.image ? (
                    <div className="relative mb-5 overflow-hidden rounded-2xl ring-1 ring-slate-100">
                      <img
                        src={program.image}
                        alt={`Gambar program ${program.name}`}
                        loading="lazy"
                        className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute right-2.5 top-2.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 backdrop-blur-sm">
                        {program.level}
                      </span>
                    </div>
                  ) : (
                    <div className="mb-5 flex items-center justify-between">
                      <span
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${meta.className} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                      >
                        <Icon className="h-7 w-7" aria-hidden="true" />
                      </span>
                      <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                        {program.level}
                      </span>
                    </div>
                  )}

                  <h3 className="text-xl font-extrabold text-slate-800">
                    <button
                      type="button"
                      onClick={() => openDetail(program)}
                      className="rounded text-left transition-colors hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                      aria-label={`Lihat detail program ${program.name}`}
                    >
                      {program.name}
                    </button>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {program.description}
                  </p>

                  {/* Materi */}
                  <ul className="mt-5 flex-1 space-y-2.5">
                    {program.topics.map((topic) => (
                      <li key={topic} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <span
                          className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full ${meta.className}`}
                        >
                          <Check className="h-3 w-3" aria-hidden="true" />
                        </span>
                        {topic}
                      </li>
                    ))}
                  </ul>

                  {/* Info durasi & pilihan jenis les */}
                  <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-dashed border-slate-200 pt-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 ring-1 ring-slate-200">
                      <Clock className="h-3.5 w-3.5 text-sky-500" aria-hidden="true" />
                      {program.duration}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 font-semibold text-sky-700 ring-1 ring-sky-100">
                      <BookOpen className="h-3.5 w-3.5 text-sky-500" aria-hidden="true" />
                      Les Biasa — Tanpa Sertifikat
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 ring-1 ring-emerald-100">
                      <GraduationCap className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                      Sertifikat: {program.certificatePrice || sertifikatPrice}
                    </span>
                  </div>

                  {/* Harga */}
                  <div className="mt-4 flex items-baseline justify-between rounded-xl bg-emerald-50 px-4 py-2.5">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700/80">
                      <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
                      Biaya Les Biasa
                    </span>
                    <span className="text-base font-extrabold text-emerald-700">
                      {program.price || "Hubungi Admin"}
                    </span>
                  </div>

                  {/* Tombol detail -> jendela materi lengkap + link bagikan */}
                  <Button
                    variant="outline"
                    className="mt-4 w-full rounded-full border-sky-200 bg-white py-3 text-sm font-bold text-sky-700 transition-all hover:bg-sky-50 hover:text-sky-800"
                    onClick={() => openDetail(program)}
                    aria-label={`Lihat detail dan materi program ${program.name}`}
                  >
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    Lihat Detail Program
                  </Button>

                  {/* Tombol daftar -> WhatsApp */}
                  <Button
                    asChild
                    className="mt-2 w-full rounded-full bg-emerald-500 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-600 hover:shadow-emerald-200"
                  >
                    <a
                      href={waLink(waProgramMessage(program.name))}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Daftar program ${program.name} via WhatsApp`}
                      className="flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      Daftar Program Ini
                    </a>
                  </Button>
                </motion.article>
              );
            })}
          </motion.div>
        )}

        {/* Kondisi kosong */}
        {!programsLoading && programs.length === 0 && (
          <div className="mx-auto max-w-md rounded-3xl border border-dashed border-sky-200 bg-white/70 p-10 text-center">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-sky-300" aria-hidden="true" />
            <p className="font-bold text-slate-700">Belum ada program tersedia</p>
            <p className="mt-1 text-sm text-slate-500">
              Silakan hubungi admin via WhatsApp untuk info program terbaru.
            </p>
            <Button
              asChild
              className="mt-5 rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
            >
              <a
                href={waLink(
                  "Halo Admin LesKomputer! 👋 Saya ingin menanyakan daftar program les yang tersedia. Terima kasih 🙏"
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                Hubungi Admin
              </a>
            </Button>
          </div>
        )}

        {/* Pilihan jenis les: Les Biasa (tanpa sertifikat) vs Les Resmi Sertifikat */}
        {!programsLoading && programs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-12 max-w-4xl"
          >
            <h3 className="mb-1.5 text-center text-lg font-extrabold text-slate-800 sm:text-xl">
              Pilih Jenis Les yang Kamu Mau
            </h3>
            <p className="mx-auto mb-6 max-w-xl text-center text-sm text-slate-500">
              Harga yang tertera pada daftar program di atas adalah harga{" "}
              <strong className="text-slate-700">LES BIASA</strong> (tanpa sertifikat).
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {displayPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${
                    pkg.highlight
                      ? "border-emerald-200 shadow-md ring-1 ring-emerald-100 hover:shadow-lg"
                      : "border-sky-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-10 w-10 flex-none items-center justify-center rounded-full ${
                        pkg.highlight
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-sky-100 text-sky-600"
                      }`}
                    >
                      {pkg.highlight ? (
                        <Award className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <BookOpen className="h-5 w-5" aria-hidden="true" />
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-extrabold tracking-wide text-slate-800">
                        {pkg.name}
                      </p>
                      {pkg.tagline && (
                        <p className="text-xs text-slate-500">{pkg.tagline}</p>
                      )}
                    </div>
                  </div>
                  <div
                    className={`mt-4 flex items-baseline justify-between rounded-xl px-4 py-2.5 ${
                      pkg.highlight
                        ? "bg-emerald-50"
                        : "bg-sky-50"
                    }`}
                  >
                    <span
                      className={`text-xs font-medium ${
                        pkg.highlight ? "text-emerald-700/80" : "text-sky-700/80"
                      }`}
                    >
                      {pkg.priceLabel || "Harga"}
                    </span>
                    <span
                      className={`text-base font-extrabold ${
                        pkg.highlight ? "text-emerald-700" : "text-sky-700"
                      }`}
                    >
                      {pkg.price}
                    </span>
                  </div>
                  {pkg.note && (
                    <p className="mt-3 text-xs leading-relaxed text-slate-500">{pkg.note}</p>
                  )}
                  <Button
                    asChild
                    className={`mt-4 w-full rounded-full py-2.5 text-xs font-bold text-white shadow-md transition-colors ${
                      pkg.highlight
                        ? "bg-emerald-500 shadow-emerald-100 hover:bg-emerald-600"
                        : "bg-sky-500 shadow-sky-100 hover:bg-sky-600"
                    }`}
                  >
                    <a
                      href={waLink(pkg.waMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Daftar ${pkg.name} via WhatsApp`}
                      className="flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      Daftar {pkg.name}
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Catatan khusus */}
        {!programsLoading && programs.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto mt-10 max-w-xl text-center text-sm text-slate-500"
          >
            💡 Belum yakin pilih yang mana?{" "}
            <a
              href={waLink(
                "Halo Admin LesKomputer! 👋 Saya ingin konsultasi dulu untuk memilih program les yang cocok. Terima kasih 🙏"
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-sky-600 underline decoration-sky-300 underline-offset-4 transition-colors hover:text-sky-700"
            >
              Konsultasi gratis dengan admin
            </a>{" "}
            lewat WhatsApp.
          </motion.p>
        )}

        {/* ============ JENDELA DETAIL PROGRAM (materi lengkap + link bagikan) ============ */}
        <Dialog
          open={!!detailProgram}
          onOpenChange={(open) => {
            if (!open) closeDetail();
          }}
        >
          <DialogContent className="gap-0 overflow-hidden border-sky-100 p-0 sm:max-w-3xl [&>button]:rounded-full [&>button]:bg-white/90 [&>button]:shadow-md [&>button]:backdrop-blur-sm">
            {detailProgram && (
              <>
                <DialogHeader className="sr-only">
                  <DialogTitle>Detail Program {detailProgram.name}</DialogTitle>
                  <DialogDescription>
                    Materi lengkap, durasi, dan biaya program {detailProgram.name} di
                    LesKomputer.
                  </DialogDescription>
                </DialogHeader>

                {(() => {
                  const meta = ICON_MAP[detailProgram.icon] ?? FALLBACK_ICON;
                  const DetailIcon = meta.icon;
                  const materiList =
                    detailProgram.materials && detailProgram.materials.length > 0
                      ? detailProgram.materials
                      : detailProgram.topics;
                  const certPrice = detailProgram.certificatePrice || sertifikatPrice;
                  return (
                    <div className="max-h-[88dvh] overflow-y-auto overscroll-contain sm:grid sm:h-[92dvh] sm:max-h-[780px] sm:grid-cols-5 sm:overflow-hidden">
                      {/* Kolom kiri: gambar / ikon program (tinggi penuh di layar besar) */}
                      <div className="relative h-36 flex-none sm:col-span-2 sm:h-full">
                        {detailProgram.image ? (
                          <img
                            src={detailProgram.image}
                            alt={`Gambar program ${detailProgram.name}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            className={`flex h-full w-full items-center justify-center ${meta.className}`}
                          >
                            <DetailIcon className="h-12 w-12" aria-hidden="true" />
                          </div>
                        )}
                        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 backdrop-blur-sm">
                          {detailProgram.level}
                        </span>
                      </div>

                      {/* Kolom kanan: isi detail — scroll sendiri agar tidak terpotong */}
                      <div className="p-5 sm:col-span-3 sm:overflow-y-auto sm:p-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                            <Clock className="h-3.5 w-3.5 text-sky-500" aria-hidden="true" />
                            {detailProgram.duration}
                          </span>
                          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                            {detailProgram.level}
                          </span>
                        </div>

                        <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-800">
                          {detailProgram.name}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                          {detailProgram.description}
                        </p>

                        {/* Materi lengkap */}
                        <div className="mt-6 rounded-2xl bg-sky-50/70 p-4 ring-1 ring-sky-100 sm:p-5">
                          <p className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
                            <BookOpen className="h-4 w-4 text-sky-500" aria-hidden="true" />
                            Materi yang Dipelajari
                          </p>
                          <ol className="mt-3.5 space-y-2.5">
                            {materiList.map((materi, index) => (
                              <li
                                key={`${index}-${materi}`}
                                className="flex items-start gap-2.5 text-sm text-slate-700"
                              >
                                <span
                                  className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full text-[10px] font-bold ${meta.className}`}
                                >
                                  {index + 1}
                                </span>
                                {materi}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Ringkasan biaya */}
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-xl bg-emerald-50 px-4 py-3">
                            <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700/80">
                              <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
                              Biaya Les Biasa
                            </p>
                            <p className="mt-1 text-lg font-extrabold text-emerald-700">
                              {detailProgram.price || "Hubungi Admin"}
                            </p>
                          </div>
                          <div className="rounded-xl bg-sky-50 px-4 py-3">
                            <p className="flex items-center gap-1.5 text-xs font-medium text-sky-700/80">
                              <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                              Harga Bersertifikat
                            </p>
                            <p className="mt-1 text-lg font-extrabold text-sky-700">
                              {certPrice}
                            </p>
                          </div>
                        </div>

                        {/* Aksi: salin link + daftar */}
                        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => void handleCopyLink()}
                            className={`flex-1 rounded-full border py-3 text-sm font-bold transition-all ${
                              copied
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                            aria-label="Salin link halaman detail program ini"
                          >
                            {copied ? (
                              <Check className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Link2 className="h-4 w-4" aria-hidden="true" />
                            )}
                            {copied ? "Link Tersalin!" : "Salin Link"}
                          </Button>
                          <Button
                            asChild
                            className="flex-1 rounded-full bg-emerald-500 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-600 hover:shadow-emerald-200"
                          >
                            <a
                              href={waLink(waProgramMessage(detailProgram.name))}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Daftar program ${detailProgram.name} via WhatsApp`}
                              className="flex items-center justify-center gap-2"
                            >
                              <MessageCircle className="h-4 w-4" aria-hidden="true" />
                              Daftar Program Ini
                            </a>
                          </Button>
                        </div>

                        <p className="mt-3.5 text-center text-xs leading-relaxed text-slate-400">
                          Link halaman detail ini bisa disalin & dibagikan ke WhatsApp,
                          Facebook, Instagram, TikTok, dan platform lainnya.
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
