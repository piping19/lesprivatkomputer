"use client";

import { create } from "zustand";
import type { Program } from "@/lib/json-db";
import type { PricingPackage } from "@/lib/packages-data";
import type { Showcase } from "@/lib/showcase-db";
import { ADMIN_TOKEN_KEY } from "@/lib/site-config";

export type AdminView = "login" | "list" | "form";
/** Bagian admin yang sedang dibuka: kelola program, harga paket, atau pameran kode */
export type AdminSection = "programs" | "prices" | "showcase";
/** Mode penyimpanan program yang dilaporkan API */
export type StorageMode = "database" | "file";

interface AppStore {
  /** Daftar program dari database */
  programs: Program[];
  programsLoading: boolean;
  /** Backend penyimpanan aktif (database = permanen di Vercel) */
  storage: StorageMode | null;
  fetchPrograms: () => Promise<void>;

  /** Daftar contoh kode (Pameran Kode) dari database */
  showcases: Showcase[];
  showcasesLoading: boolean;
  fetchShowcases: () => Promise<void>;

  /** Daftar paket harga (LES BIASA / LES RESMI SERTIFIKAT) */
  packages: PricingPackage[];
  packagesLoading: boolean;
  fetchPackages: () => Promise<void>;

  /** Sesi admin (dikelola via event, bukan effect) */
  adminSection: AdminSection;
  setAdminSection: (section: AdminSection) => void;
  adminOpen: boolean;
  adminToken: string | null;
  adminView: AdminView;
  openAdmin: () => void;
  closeAdmin: () => void;
  setAdminToken: (token: string | null) => void;
  setAdminView: (view: AdminView) => void;
  logoutAdmin: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  programs: [],
  programsLoading: true,
  storage: null,
  fetchPrograms: async () => {
    set({ programsLoading: true });
    try {
      const res = await fetch("/api/programs", { cache: "no-store" });
      const data = await res.json();
      set({
        programs: Array.isArray(data.programs) ? data.programs : [],
        storage: data.storage === "database" ? "database" : data.storage === "file" ? "file" : null,
      });
    } catch {
      // Jika gagal, biarkan daftar kosong (UI menampilkan pesan)
    } finally {
      set({ programsLoading: false });
    }
  },

  showcases: [],
  showcasesLoading: true,
  fetchShowcases: async () => {
    set({ showcasesLoading: true });
    try {
      const res = await fetch("/api/showcases", { cache: "no-store" });
      const data = await res.json();
      set({
        showcases: Array.isArray(data.showcases) ? data.showcases : [],
        storage: data.storage === "database" ? "database" : data.storage === "file" ? "file" : null,
      });
    } catch {
      // Jika gagal, section materi memakai contoh bawaan
    } finally {
      set({ showcasesLoading: false });
    }
  },

  packages: [],
  packagesLoading: true,
  fetchPackages: async () => {
    set({ packagesLoading: true });
    try {
      const res = await fetch("/api/packages", { cache: "no-store" });
      const data = await res.json();
      set({
        packages: Array.isArray(data.packages) ? data.packages : [],
      });
    } catch {
      // Jika gagal, paket harga memakai nilai bawaan di komponen
    } finally {
      set({ packagesLoading: false });
    }
  },

  adminSection: "programs",
  setAdminSection: (section) => set({ adminSection: section }),

  adminOpen: false,
  adminToken: null,
  adminView: "login",
  openAdmin: () => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(ADMIN_TOKEN_KEY);
    set({
      adminOpen: true,
      adminToken: saved,
      adminView: saved ? "list" : "login",
    });
  },
  closeAdmin: () => set({ adminOpen: false }),
  setAdminToken: (token) => set({ adminToken: token }),
  setAdminView: (view) => set({ adminView: view }),
  logoutAdmin: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
    set({ adminToken: null, adminView: "login" });
  },
}));
