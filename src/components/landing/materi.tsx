"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Code2, GraduationCap, School, Briefcase, Terminal } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { highlightCode } from "@/lib/code-highlight";
import type { Showcase } from "@/lib/showcase-db";

/**
 * Cadangan tampilan bila data belum sempat termuat — contoh C++ bawaan
 * yang dipraktikkan peserta di kelas.
 */
const FALLBACK_SHOWCASE: Showcase = {
  id: "cpp-dasar",
  title: "C++ Dasar",
  filename: "materi-dasar/main.cpp",
  code: `#include <iostream>

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
}`,
  output: `Panjang string var1 adalah 26
Panjang string var2 adalah 10
Panjang string var3 adalah 39`,
};

const audiences = [
  { icon: GraduationCap, label: "Mahasiswa" },
  { icon: School, label: "SMK" },
  { icon: Briefcase, label: "Umum / Kerja" },
];

export function Materi() {
  const { showcases, showcasesLoading, fetchShowcases } = useAppStore();
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    void fetchShowcases();
  }, [fetchShowcases]);

  const items: Showcase[] = showcases.length > 0 ? showcases : [FALLBACK_SHOWCASE];
  const safeIdx = Math.min(activeIdx, items.length - 1);
  const active = items[safeIdx] ?? FALLBACK_SHOWCASE;

  const lines = useMemo(() => highlightCode(active.code), [active.code]);
  const outputLines = useMemo(
    () =>
      active.output
        .replace(/\r/g, "")
        .split("\n")
        .map((line) => line.trimEnd())
        .filter((line) => line.length > 0),
    [active.output]
  );

  return (
    <section id="materi" className="scroll-mt-20 bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Teks */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="min-w-0"
          >
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-4 py-1.5 text-sm font-bold text-sky-700">
              <Code2 className="h-4 w-4" aria-hidden="true" />
              Contoh Materi
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
              Praktik Langsung,{" "}
              <span className="bg-gradient-to-r from-sky-600 to-emerald-500 bg-clip-text text-transparent">
                Bukan Hanya Teori
              </span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Sejak pertemuan pertama, peserta langsung menulis dan menjalankan kode asli seperti
              contoh di samping &mdash; C++, Python, dan bahasa lainnya &mdash; lalu berlatih dengan
              bimbingan instruktur sampai benar-benar paham.
            </p>

            <div className="mt-6 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-sm font-bold text-slate-700">Materi disesuaikan untuk:</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {audiences.map((audience) => (
                  <span
                    key={audience.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
                  >
                    <audience.icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {audience.label}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                Belum punya dasar komputer sama sekali? Tenang, semua materi dimulai dari nol dan
                tempo belajarnya menyesuaikan kemampuan tiap peserta.
              </p>
            </div>
          </motion.div>

          {/* Jendela kode (Pameran Kode) */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative min-w-0"
          >
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-tr from-sky-100 via-white to-emerald-100"
            />

            {/* Skeleton saat memuat data pertama kali */}
            {showcasesLoading && showcases.length === 0 && (
              <div className="relative min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center gap-2 bg-slate-100 px-4 py-3">
                  <span className="h-3 w-3 rounded-full bg-red-300" aria-hidden="true" />
                  <span className="h-3 w-3 rounded-full bg-amber-300" aria-hidden="true" />
                  <span className="h-3 w-3 rounded-full bg-emerald-300" aria-hidden="true" />
                  <span className="ml-3 h-3 w-32 animate-pulse rounded bg-slate-200" />
                </div>
                <div className="space-y-2.5 p-5">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div
                      key={i}
                      className="h-3 animate-pulse rounded bg-slate-100"
                      style={{ width: `${88 - (i % 4) * 14}%` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {!showcasesLoading || showcases.length > 0 ? (
              <>
                {/* Pilihan contoh kode (tab) — muncul bila ada lebih dari satu */}
                {items.length > 1 && (
                  <div
                    className="relative mb-4 flex flex-wrap gap-2"
                    role="tablist"
                    aria-label="Pilih contoh kode"
                  >
                    {items.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={index === safeIdx}
                        onClick={() => setActiveIdx(index)}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                          index === safeIdx
                            ? "bg-slate-800 text-white shadow-md"
                            : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-800"
                        }`}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                )}

                <motion.div
                  key={active.id}
                  initial={{ opacity: 0.35, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="relative min-w-0 overflow-hidden rounded-2xl border border-slate-700/50 shadow-2xl shadow-slate-300"
                >
                  {/* Bar jendela */}
                  <div className="flex items-center gap-2 bg-slate-800 px-4 py-3">
                    <span className="h-3 w-3 rounded-full bg-red-400" aria-hidden="true" />
                    <span className="h-3 w-3 rounded-full bg-amber-400" aria-hidden="true" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400" aria-hidden="true" />
                    <span className="ml-3 truncate font-mono text-xs text-slate-400">
                      {active.filename}
                    </span>
                    <span className="ml-auto flex-none rounded-full bg-sky-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-300">
                      {active.title}
                    </span>
                  </div>
                  {/* Kode */}
                  <pre className="max-h-[420px] overflow-auto bg-slate-900 p-4 font-mono text-[12.5px] leading-relaxed text-slate-200 sm:p-5 sm:text-[13.5px]">
                    <code>
                      {lines.map((tokens, lineIndex) => (
                        <span key={lineIndex} className="block whitespace-pre">
                          {tokens.length === 0
                            ? "\u00A0"
                            : tokens.map((token, tokenIndex) => (
                                <span key={tokenIndex} className={token.cls}>
                                  {token.text}
                                </span>
                              ))}
                        </span>
                      ))}
                    </code>
                  </pre>
                  {/* Output terminal */}
                  {outputLines.length > 0 && (
                    <div className="border-t border-slate-700/60 bg-slate-950 px-4 py-3 sm:px-5">
                      <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        <Terminal className="h-3 w-3" aria-hidden="true" />
                        Output
                      </p>
                      <div className="mt-1.5 space-y-0.5 font-mono text-[11.5px] text-emerald-400 sm:text-xs">
                        {outputLines.map((line, lineIndex) => (
                          <p key={lineIndex}>
                            <span className="text-slate-500">$ </span>
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </>
            ) : null}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
