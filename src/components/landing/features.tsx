"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  UserCheck,
  MonitorSmartphone,
  CalendarClock,
  BadgeCheck,
  GraduationCap,
  School,
  Briefcase,
} from "lucide-react";

const features = [
  {
    icon: UserCheck,
    title: "Instruktur Berpengalaman",
    description: "Dibimbing langsung oleh pengajar profesional yang sabar dan ramah untuk pemula.",
    color: "bg-sky-100 text-sky-600",
  },
  {
    icon: MonitorSmartphone,
    title: "Praktik 80% Teori 20%",
    description: "Setiap peserta mendapat komputer sendiri untuk belajar sambil langsung mempraktikkan.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: CalendarClock,
    title: "Jadwal Fleksibel",
    description: "Pilih jadwal pagi, siang, sore, atau akhir pekan sesuai kesibukanmu.",
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    icon: BadgeCheck,
    title: "Sertifikat & Pendampingan",
    description: "Dapatkan sertifikat kelulusan dan konsultasi berkelanjutan setelah program selesai.",
    color: "bg-teal-100 text-teal-600",
  },
];

const audiences = [
  { icon: GraduationCap, label: "Mahasiswa" },
  { icon: School, label: "SMK" },
  { icon: Briefcase, label: "Umum / Kerja" },
];

export function Features() {
  return (
    <section id="keunggulan" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-5 lg:gap-8">
          {/* Gambar */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative order-2 lg:order-1 lg:col-span-3"
          >
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-tr from-emerald-100 via-white to-sky-100"
            />
            <div className="relative overflow-hidden rounded-[2rem] border-4 border-white shadow-xl shadow-emerald-100">
              <Image
                src="/images/classroom.png"
                alt="Suasana kelas les komputer untuk mahasiswa, pelajar SMK, dan umum/kerja"
                width={1152}
                height={729}
                className="h-auto w-full object-cover transition-transform duration-500 hover:scale-105"
              />
              {/* Caption nama kelas */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent px-5 pb-5 pt-16 sm:px-6 sm:pb-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-300">
                  Program Untuk
                </p>
                <p className="mt-1 text-xl font-extrabold tracking-wide text-white drop-shadow sm:text-2xl">
                  LES KOMPUTER
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {audiences.map((audience) => (
                    <span
                      key={audience.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm"
                    >
                      <audience.icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {audience.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {/* Badge melayang */}
            <div className="absolute -top-4 right-4 flex items-center gap-2 rounded-2xl border border-sky-100 bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur">
              <MonitorSmartphone className="h-5 w-5 text-sky-500" aria-hidden="true" />
              <span className="text-sm font-bold text-slate-700">1 Peserta 1 Komputer</span>
            </div>
          </motion.div>

          {/* Teks & daftar keunggulan */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="order-1 lg:order-2 lg:col-span-2"
          >
            <span className="mb-3 inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-bold text-emerald-700">
              Kenapa Kami?
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
              Belajar Nyaman,{" "}
              <span className="bg-gradient-to-r from-sky-600 to-emerald-500 bg-clip-text text-transparent">
                Hasil Maksimal
              </span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Kami percaya semua orang bisa mahir komputer dengan cara belajar yang tepat. Metode
              kami dirancang ramah untuk pemula sekalipun.
            </p>

            <ul className="mt-8 space-y-4">
              {features.map((feature, index) => (
                <motion.li
                  key={feature.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-4 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span
                    className={`flex h-11 w-11 flex-none items-center justify-center rounded-xl ${feature.color}`}
                  >
                    <feature.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-800">{feature.title}</h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
