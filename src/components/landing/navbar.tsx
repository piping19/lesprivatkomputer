"use client";

import { useEffect, useState } from "react";
import { Menu, Monitor, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, SITE, waLink, WA_MESSAGES } from "@/lib/site-config";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 shadow-md shadow-sky-100 backdrop-blur-md"
          : "bg-white/60 backdrop-blur-sm"
      }`}
    >
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
      >
        {/* Logo */}
        <a href="#beranda" className="flex items-center gap-2.5" aria-label={`${SITE.name} - Beranda`}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-lg shadow-sky-200">
            <Monitor className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-800">
            Les<span className="text-sky-600">Komputer</span>
          </span>
        </a>

        {/* Menu desktop */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-sky-50 hover:text-sky-700"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <Button
            asChild
            className="rounded-full bg-emerald-500 px-5 text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-600 hover:shadow-emerald-300"
          >
            <a
              href={waLink(WA_MESSAGES.general)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Daftar sekarang via WhatsApp"
            >
              Daftar Sekarang
            </a>
          </Button>
        </div>

        {/* Tombol menu mobile */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-sky-50 md:hidden"
        >
          {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </nav>

      {/* Menu mobile */}
      {open && (
        <div className="border-t border-sky-100 bg-white/95 px-4 pb-5 pt-3 shadow-lg backdrop-blur-md md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-700"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <Button
            asChild
            className="mt-3 w-full rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
          >
            <a
              href={waLink(WA_MESSAGES.general)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
            >
              Daftar via WhatsApp
            </a>
          </Button>
        </div>
      )}
    </header>
  );
}
