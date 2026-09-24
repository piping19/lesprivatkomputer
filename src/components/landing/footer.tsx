"use client";

import { Monitor, MessageCircle, Clock, MapPin, Lock, Download } from "lucide-react";
import { NAV_LINKS, SITE, WHATSAPP_DISPLAY, ADDRESS, waLink, WA_MESSAGES } from "@/lib/site-config";
import { useAppStore } from "@/lib/store";

export function Footer() {
  const { openAdmin } = useAppStore();
  const year = new Date().getFullYear();

  return (
    <footer id="kontak" className="mt-auto scroll-mt-20 bg-slate-800 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <a href="#beranda" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white">
                <Monitor className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Les<span className="text-sky-400">Komputer</span>
              </span>
            </a>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              {SITE.tagline}. Belajar Microsoft Office, Pemrograman, dan Desain Grafis dengan metode
              praktis yang mudah dipahami.
            </p>
          </div>

          {/* Navigasi */}
          <nav aria-label="Navigasi footer">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              Menu
            </h3>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-sky-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kontak */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              Hubungi Kami
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={waLink(WA_MESSAGES.general)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-2.5 transition-colors"
                >
                  <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-slate-400 transition-colors group-hover:text-emerald-400">
                    WhatsApp: {WHATSAPP_DISPLAY}
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-sky-500/20 text-sky-400">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-slate-400">
                  Senin &ndash; Sabtu, 08.00 &ndash; 20.00 WIB
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-sky-500/20 text-sky-400">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    "LesKomputer " + ADDRESS
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 transition-colors hover:text-sky-400"
                  aria-label="Lihat lokasi di Google Maps"
                >
                  {ADDRESS}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Hak cipta */}
      <div className="border-t border-slate-700/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs text-slate-500 sm:flex-row sm:px-6 sm:text-left">
          <p>
            &copy; {year} {SITE.name}. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <p>
              Dibuat dengan <span className="text-emerald-400">♥</span> untuk pendidikan digital
              Indonesia
            </p>
            <a
              href="/download/les-komputer-website.zip"
              download="les-komputer-website.zip"
              className="flex items-center gap-1.5 rounded-full border border-emerald-600/60 px-3 py-1.5 font-medium text-emerald-400 transition-colors hover:border-emerald-400 hover:text-emerald-300"
              aria-label="Unduh kode sumber website (ZIP)"
            >
              <Download className="h-3 w-3" aria-hidden="true" />
              Download Kode
            </a>
            <button
              type="button"
              onClick={openAdmin}
              className="flex items-center gap-1.5 rounded-full border border-slate-600/60 px-3 py-1.5 font-medium text-slate-400 transition-colors hover:border-sky-500/50 hover:text-sky-400"
              aria-label="Login admin untuk mengelola program"
            >
              <Lock className="h-3 w-3" aria-hidden="true" />
              Login Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
