"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Sparkles, Users, Award, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { waLink, WA_MESSAGES } from "@/lib/site-config";

const stats = [
  { icon: Users, value: "500+", label: "Alumni" },
  { icon: Award, value: "3", label: "Program Unggulan" },
  { icon: Clock, value: "Fleksibel", label: "Jadwal Belajar" },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export function Hero() {
  return (
    <section id="beranda" className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-24">
      {/* Dekorasi latar */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-sky-100 blur-3xl" />
        <div className="absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-emerald-100 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-sky-50 blur-2xl" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8">
        {/* Kolom teks */}
        <motion.div variants={container} initial="hidden" animate="show" className="text-center lg:text-left">
          <motion.div variants={item} className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Pendaftaran Peserta Baru Dibuka!
          </motion.div>

          <motion.h1
            variants={item}
            className="text-4xl font-extrabold leading-tight tracking-tight text-slate-800 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.15]"
          >
            Kuasai Komputer,{" "}
            <span className="bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
              Raih Masa Depan
            </span>{" "}
            Cerahmu!
          </motion.h1>

          <motion.p variants={item} className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg lg:mx-0">
            Belajar <strong className="font-semibold text-sky-700">Microsoft Office</strong>,{" "}
            <strong className="font-semibold text-sky-700">Pemrograman</strong>, dan{" "}
            <strong className="font-semibold text-emerald-700">Desain Grafis</strong> bersama
            instruktur berpengalaman. Praktik langsung, mudah dipahami untuk pemula.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button
              asChild
              size="lg"
              className="h-13 w-full rounded-full bg-emerald-500 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-emerald-200 transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-2xl hover:shadow-emerald-300 sm:w-auto"
            >
              <a
                href={waLink(WA_MESSAGES.general)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                Daftar via WhatsApp
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full rounded-full border-2 border-sky-200 bg-white px-8 py-3.5 text-base font-bold text-sky-700 transition-all hover:border-sky-300 hover:bg-sky-50 sm:w-auto"
            >
              <a href="#program" className="flex items-center gap-2">
                Lihat Program
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </a>
            </Button>
          </motion.div>

          {/* Statistik */}
          <motion.dl variants={item} className="mt-10 grid grid-cols-3 gap-4 sm:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-sky-100 bg-white/80 p-3 text-center shadow-sm backdrop-blur sm:p-4"
              >
                <stat.icon className="mx-auto mb-1.5 h-5 w-5 text-sky-500" aria-hidden="true" />
                <dd className="text-lg font-extrabold text-slate-800 sm:text-2xl">{stat.value}</dd>
                <dt className="text-[11px] font-medium text-slate-500 sm:text-xs">{stat.label}</dt>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* Kolom gambar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div
            aria-hidden="true"
            className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-sky-200/60 via-white to-emerald-200/60 blur-sm"
          />
          <div className="relative overflow-hidden rounded-[2rem] border-4 border-white shadow-2xl shadow-sky-200/70">
            <Image
              src="/images/hero.png"
              alt="Ilustrasi peserta les komputer sedang belajar bersama instruktur"
              width={1024}
              height={1024}
              priority
              className="h-auto w-full object-cover"
            />
          </div>
          {/* Kartu melayang */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white/95 px-4 py-3 shadow-xl backdrop-blur sm:-left-6"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Award className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-800">Sertifikat Resmi</p>
              <p className="text-xs text-slate-500">Setelah menyelesaikan program</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
