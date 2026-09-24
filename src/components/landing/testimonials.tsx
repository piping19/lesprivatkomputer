"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Rina Wulandari",
    role: "Alumni Microsoft Office",
    initials: "RW",
    gradient: "from-sky-400 to-cyan-400",
    quote:
      "Awalnya sama sekali tidak bisa komputer, sekarang saya sudah percaya diri bikin laporan Excel untuk kerjaan. Instrukturnya sabar banget!",
  },
  {
    name: "Andi Pratama",
    role: "Alumni Pemrograman",
    initials: "AP",
    gradient: "from-indigo-400 to-sky-400",
    quote:
      "Kelasnya seru dan praktik langsung. Dari nol sampai bisa bikin website pertama saya dalam 2 bulan. Terima kasih LesKomputer!",
  },
  {
    name: "Salsabila Putri",
    role: "Alumni Desain Grafis",
    initials: "SP",
    gradient: "from-emerald-400 to-teal-400",
    quote:
      "Sekarang saya bisa terima jasa desain logo dari rumah. Materi Photoshop dan CorelDRAW-nya lengkap dan mudah diikuti.",
  },
];

export function Testimonials() {
  return (
    <section
      id="testimoni"
      className="scroll-mt-20 bg-gradient-to-b from-white via-emerald-50/50 to-white py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <span className="mb-3 inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-bold text-emerald-700">
            Testimoni
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
            Kata{" "}
            <span className="bg-gradient-to-r from-sky-600 to-emerald-500 bg-clip-text text-transparent">
              Mereka
            </span>{" "}
            yang Sudah Bergabung
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, index) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: index * 0.12 }}
              className="relative flex flex-col rounded-3xl border border-sky-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-100"
            >
              <Quote
                className="absolute right-5 top-5 h-8 w-8 text-sky-100"
                aria-hidden="true"
              />
              <div className="mb-3 flex gap-1" aria-label="Rating 5 dari 5 bintang">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                ))}
              </div>
              <blockquote className="flex-1 text-sm leading-relaxed text-slate-600">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-dashed border-slate-200 pt-4">
                <Avatar className={`h-10 w-10 ring-2 ring-offset-2 ring-sky-100 bg-gradient-to-br ${t.gradient}`}>
                  <AvatarFallback className="text-sm font-bold text-white bg-transparent">
                    {t.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-slate-800">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
