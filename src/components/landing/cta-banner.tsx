"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { waLink, WA_MESSAGES } from "@/lib/site-config";

export function CtaBanner() {
  return (
    <section className="px-4 py-10 sm:px-6 sm:py-14">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500 px-6 py-14 text-center shadow-2xl shadow-sky-200 sm:px-12"
      >
        {/* Dekorasi */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        </div>

        <h2 className="relative text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Siap Jadi Mahir Komputer?
        </h2>
        <p className="relative mx-auto mt-4 max-w-2xl text-base leading-relaxed text-sky-50 sm:text-lg">
          Jangan tunda lagi! Kursi terbatas setiap angkatan. Daftar sekarang dan mulai perjalanan
          barumu bersama LesKomputer.
        </p>
        <div className="relative mt-8">
          <Button
            asChild
            size="lg"
            className="h-auto rounded-full bg-white px-9 py-4 text-base font-extrabold text-emerald-600 shadow-xl transition-all hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-2xl"
          >
            <a
              href={waLink(WA_MESSAGES.general)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Daftar Sekarang &mdash; Gratis Konsultasi
            </a>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
