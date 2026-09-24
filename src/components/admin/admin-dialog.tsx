"use client";

import { useState, useRef } from "react";
import {
  Lock,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  FileSpreadsheet,
  Code2,
  Palette,
  BookOpen,
  X,
  Check,
  AlertCircle,
  Wallet,
  Database,
  HardDrive,
  ImagePlus,
  ImageIcon,
  FileCode2,
  GraduationCap,
} from "lucide-react";
import { PackagesManager } from "@/components/admin/packages-manager";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { ADMIN_TOKEN_KEY } from "@/lib/site-config";
import { fileToCompressedDataUrl, MAX_IMAGE_DATA_URL_LENGTH } from "@/lib/image-utils";
import type { Program } from "@/lib/json-db";
import type { Showcase } from "@/lib/showcase-db";
import type { AdminSection } from "@/lib/store";
import type { LucideIcon } from "lucide-react";

interface ProgramForm {
  name: string;
  level: string;
  description: string;
  duration: string;
  price: string;
  certificatePrice: string;
  icon: string;
  topics: string[];
  /** Materi lengkap untuk halaman detail — satu materi per baris */
  materials: string;
  image: string;
}

const EMPTY_FORM: ProgramForm = {
  name: "",
  level: "Pemula",
  description: "",
  duration: "16 Sesi",
  price: "",
  certificatePrice: "",
  icon: "book",
  topics: [""],
  materials: "",
  image: "",
};

interface ShowcaseForm {
  title: string;
  filename: string;
  code: string;
  output: string;
}

const EMPTY_SHOWCASE_FORM: ShowcaseForm = {
  title: "",
  filename: "",
  code: "",
  output: "",
};

const ICON_OPTIONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "office", label: "Office", icon: FileSpreadsheet },
  { value: "code", label: "Coding", icon: Code2 },
  { value: "design", label: "Desain", icon: Palette },
  { value: "book", label: "Lainnya", icon: BookOpen },
];

export function AdminDialog() {
  const {
    adminOpen,
    openAdmin,
    closeAdmin,
    adminToken: token,
    setAdminToken,
    adminView: view,
    setAdminView: setView,
    logoutAdmin,
    programs,
    storage,
    fetchPrograms,
    showcases,
    fetchShowcases,
    adminSection,
    setAdminSection,
  } = useAppStore();

  // Form login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Form program
  const [form, setForm] = useState<ProgramForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Form pameran kode (contoh coding)
  const [showcaseForm, setShowcaseForm] = useState<ShowcaseForm>(EMPTY_SHOWCASE_FORM);
  const [editingShowcaseId, setEditingShowcaseId] = useState<string | null>(null);
  const [savingShowcase, setSavingShowcase] = useState(false);
  const [showcaseError, setShowcaseError] = useState("");
  const [deletingShowcaseId, setDeletingShowcaseId] = useState<string | null>(null);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login gagal");
        localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        setAdminToken(data.token);
        setView("list");
        void fetchShowcases();
      })
      .catch((err: Error) => setLoginError(err.message))
      .finally(() => setLoggingIn(false));
  }

  function handleLogout() {
    logoutAdmin();
  }

  function switchSection(section: AdminSection) {
    setAdminSection(section);
    setShowcaseError("");
    setFormError("");
    if (section === "showcase") {
      void fetchShowcases();
    }
  }

  function openCreateForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError("");
    setView("form");
  }

  function openEditForm(program: Program) {
    setForm({
      name: program.name,
      level: program.level,
      description: program.description,
      duration: program.duration,
      price: program.price,
      certificatePrice: program.certificatePrice ?? "",
      icon: program.icon,
      topics: program.topics.length > 0 ? [...program.topics] : [""],
      materials: (program.materials ?? []).join("\n"),
      image: program.image ?? "",
    });
    setEditingId(program.id);
    setFormError("");
    setView("form");
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // agar file yang sama bisa dipilih ulang
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("File harus berupa gambar (JPG, PNG, WebP, dll).");
      return;
    }
    setFormError("");
    setProcessingImage(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      if (dataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
        throw new Error("Gambar terlalu besar. Gunakan gambar yang lebih kecil.");
      }
      setForm((prev) => ({ ...prev, image: dataUrl }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal memproses gambar.");
    } finally {
      setProcessingImage(false);
    }
  }

  function handleUnauthorized() {
    logoutAdmin();
    setLoginError("Sesi berakhir. Silakan login ulang.");
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    const topics = form.topics.map((t) => t.trim()).filter(Boolean);
    const materials = form.materials
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!form.name.trim()) {
      setFormError("Nama program wajib diisi");
      return;
    }
    if (topics.length === 0) {
      setFormError("Minimal isi 1 materi");
      return;
    }

    setSaving(true);
    const payload = {
      id: editingId,
      name: form.name.trim(),
      level: form.level.trim() || "Pemula",
      description: form.description.trim(),
      duration: form.duration.trim() || "16 Sesi",
      price: form.price.trim(),
      certificatePrice: form.certificatePrice.trim(),
      icon: form.icon,
      topics,
      materials,
      image: form.image,
    };

    fetch("/api/admin/programs", {
      method: editingId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token ?? ""}`,
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 401) {
          handleUnauthorized();
          throw new Error("Sesi berakhir");
        }
        if (!res.ok) throw new Error(data.error || "Gagal menyimpan program");
        return data;
      })
      .then(async () => {
        await fetchPrograms();
        setView("list");
        setEditingId(null);
      })
      .catch((err: Error) => {
        if (err.message !== "Sesi berakhir") setFormError(err.message);
      })
      .finally(() => setSaving(false));
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    fetch(`/api/admin/programs?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token ?? ""}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 401) {
          handleUnauthorized();
          throw new Error("Sesi berakhir");
        }
        if (!res.ok) throw new Error(data.error || "Gagal menghapus program");
        await fetchPrograms();
      })
      .catch((err: Error) => {
        if (err.message !== "Sesi berakhir") setFormError(err.message);
      })
      .finally(() => setDeletingId(null));
  }

  // ============ Pameran Kode (contoh coding) ============

  function openShowcaseCreate() {
    setShowcaseForm(EMPTY_SHOWCASE_FORM);
    setEditingShowcaseId(null);
    setShowcaseError("");
    setView("form");
  }

  function openShowcaseEdit(showcase: Showcase) {
    setShowcaseForm({
      title: showcase.title,
      filename: showcase.filename,
      code: showcase.code,
      output: showcase.output,
    });
    setEditingShowcaseId(showcase.id);
    setShowcaseError("");
    setView("form");
  }

  function handleShowcaseSave(e: React.FormEvent) {
    e.preventDefault();
    setShowcaseError("");

    if (!showcaseForm.title.trim()) {
      setShowcaseError("Judul / label wajib diisi");
      return;
    }
    if (!showcaseForm.code.trim()) {
      setShowcaseError("Kode wajib diisi");
      return;
    }

    setSavingShowcase(true);
    const payload = {
      id: editingShowcaseId,
      title: showcaseForm.title.trim(),
      filename: showcaseForm.filename.trim() || "materi/kode.txt",
      code: showcaseForm.code.replace(/\r\n?/g, "\n"),
      output: showcaseForm.output.replace(/\r\n?/g, "\n").trim(),
    };

    fetch("/api/admin/showcases", {
      method: editingShowcaseId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token ?? ""}`,
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 401) {
          handleUnauthorized();
          throw new Error("Sesi berakhir");
        }
        if (!res.ok) throw new Error(data.error || "Gagal menyimpan contoh kode");
        return data;
      })
      .then(async () => {
        await fetchShowcases();
        setView("list");
        setEditingShowcaseId(null);
      })
      .catch((err: Error) => {
        if (err.message !== "Sesi berakhir") setShowcaseError(err.message);
      })
      .finally(() => setSavingShowcase(false));
  }

  function handleShowcaseDelete(id: string) {
    setDeletingShowcaseId(id);
    fetch(`/api/admin/showcases?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token ?? ""}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 401) {
          handleUnauthorized();
          throw new Error("Sesi berakhir");
        }
        if (!res.ok) throw new Error(data.error || "Gagal menghapus contoh kode");
        await fetchShowcases();
      })
      .catch((err: Error) => {
        if (err.message !== "Sesi berakhir") setShowcaseError(err.message);
      })
      .finally(() => setDeletingShowcaseId(null));
  }

  return (
    <Dialog open={adminOpen} onOpenChange={(open) => (open ? openAdmin() : closeAdmin())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {/* ============ LOGIN ============ */}
        {view === "login" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white">
                  <Lock className="h-4 w-4" aria-hidden="true" />
                </span>
                Login Admin
              </DialogTitle>
              <DialogDescription>
                Masuk untuk mengelola program, harga, materi les, dan pameran kode.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleLogin} className="space-y-4 pt-1">
              <div className="space-y-2">
                <Label htmlFor="admin-username">Username</Label>
                <Input
                  id="admin-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              {loginError && (
                <p
                  role="alert"
                  className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
                >
                  <AlertCircle className="h-4 w-4 flex-none" aria-hidden="true" />
                  {loginError}
                </p>
              )}

              <Button
                type="submit"
                disabled={loggingIn}
                className="w-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 py-2.5 text-white hover:from-sky-600 hover:to-emerald-600"
              >
                {loggingIn ? "Memproses..." : "Masuk"}
              </Button>
            </form>
          </>
        )}

        {/* ============ DAFTAR (Program / Pameran Kode) ============ */}
        {view === "list" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white">
                  {adminSection === "programs" ? (
                    <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
                  ) : adminSection === "prices" ? (
                    <Wallet className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <FileCode2 className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>
                {adminSection === "programs"
                  ? "Kelola Program Les"
                  : adminSection === "prices"
                    ? "Harga Paket"
                    : "Pameran Kode"}
              </DialogTitle>
              <DialogDescription>
                {adminSection === "programs"
                  ? "Tambah, ubah, atau hapus program beserta harga dan materinya."
                  : adminSection === "prices"
                    ? "Ubah pilihan LES BIASA / LES RESMI SERTIFIKAT beserta harganya."
                    : "Kelola contoh-contoh kode yang tampil di bagian Materi website."}
              </DialogDescription>
            </DialogHeader>

            {/* Tab bagian admin */}
            <div
              className="grid grid-cols-3 gap-1 rounded-full bg-slate-100 p-1"
              role="tablist"
              aria-label="Bagian admin"
            >
              <button
                type="button"
                role="tab"
                aria-selected={adminSection === "programs"}
                onClick={() => switchSection("programs")}
                className={`rounded-full px-2 py-1.5 text-xs font-bold transition-all ${
                  adminSection === "programs"
                    ? "bg-white text-sky-700 shadow-sm ring-1 ring-sky-100"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Program Les
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={adminSection === "prices"}
                onClick={() => switchSection("prices")}
                className={`rounded-full px-2 py-1.5 text-xs font-bold transition-all ${
                  adminSection === "prices"
                    ? "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Harga Paket
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={adminSection === "showcase"}
                onClick={() => switchSection("showcase")}
                className={`rounded-full px-2 py-1.5 text-xs font-bold transition-all ${
                  adminSection === "showcase"
                    ? "bg-white text-slate-800 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Pameran Kode
              </button>
            </div>

            {/* Status penyimpanan */}
            {storage === "database" && (
              <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                <Database className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
                Penyimpanan: <strong>Database</strong> — perubahan tersimpan permanen.
              </p>
            )}
            {storage === "file" && (
              <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                <HardDrive className="mt-0.5 h-3.5 w-3.5 flex-none" aria-hidden="true" />
                <span>
                  Penyimpanan: <strong>File sementara</strong> — data bisa hilang di Vercel.
                  Agar permanen: buat database gratis di <strong>neon.tech</strong>, lalu tempel
                  URL-nya di file <strong>src/lib/db-config.ts</strong> (edit langsung di GitHub
                  dengan ikon pensil ✏️). Panduan lengkap ada di file PANDUAN-DEPLOY-NEON.md.
                </span>
              </p>
            )}

            {/* ===== Daftar program ===== */}
            {adminSection === "programs" && (
              <div className="space-y-3 pt-1">
                <div className="max-h-72 space-y-2.5 overflow-y-auto rounded-xl bg-slate-50/70 p-2.5 ring-1 ring-slate-100">
                  {programs.length === 0 && (
                    <p className="py-8 text-center text-sm text-slate-500">
                      Belum ada program. Klik &ldquo;Tambah Program&rdquo; untuk membuat.
                    </p>
                  )}
                  {programs.map((program) => (
                    <div
                      key={program.id}
                      className="flex items-center gap-3 rounded-xl border border-sky-100 bg-white p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-800">{program.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <Badge className="bg-sky-50 text-sky-700 ring-1 ring-sky-100" variant="secondary">
                            {program.price || "Harga belum diatur"}
                          </Badge>
                          <Badge className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" variant="secondary">
                            {program.duration}
                          </Badge>
                          <Badge className="bg-slate-50 text-slate-600 ring-1 ring-slate-200" variant="secondary">
                            {program.topics.length} materi
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-none items-center gap-1.5">
                        {deletingId === program.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 rounded-full px-3 text-xs"
                              onClick={() => handleDelete(program.id)}
                              disabled={saving}
                            >
                              Hapus?
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 rounded-full px-3 text-xs"
                              onClick={() => setDeletingId(null)}
                            >
                              Batal
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-sky-600 hover:bg-sky-50 hover:text-sky-700"
                              aria-label={`Edit program ${program.name}`}
                              onClick={() => openEditForm(program)}
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                              aria-label={`Hapus program ${program.name}`}
                              onClick={() => setDeletingId(program.id)}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {formError && (
                  <p
                    role="alert"
                    className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
                  >
                    <AlertCircle className="h-4 w-4 flex-none" aria-hidden="true" />
                    {formError}
                  </p>
                )}

                <div className="flex items-center justify-between gap-3 pt-1">
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="rounded-full border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <LogOut className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    Keluar
                  </Button>
                  <Button
                    onClick={openCreateForm}
                    className="rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 text-white hover:from-sky-600 hover:to-emerald-600"
                  >
                    <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    Tambah Program
                  </Button>
                </div>
              </div>
            )}

            {/* ===== Daftar harga paket ===== */}
            {adminSection === "prices" && <PackagesManager />}

            {/* ===== Daftar pameran kode ===== */}
            {adminSection === "showcase" && (
              <div className="space-y-3 pt-1">
                <div className="max-h-72 space-y-2.5 overflow-y-auto rounded-xl bg-slate-50/70 p-2.5 ring-1 ring-slate-100">
                  {showcases.length === 0 && (
                    <p className="py-8 text-center text-sm text-slate-500">
                      Belum ada contoh kode. Klik &ldquo;Tambah Contoh Kode&rdquo; untuk membuat.
                    </p>
                  )}
                  {showcases.map((showcase) => {
                    const barisKode = showcase.code.split("\n").length;
                    const barisOutput = showcase.output
                      ? showcase.output.split("\n").filter((l) => l.trim()).length
                      : 0;
                    return (
                      <div
                        key={showcase.id}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                      >
                        <span
                          className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-slate-800 text-emerald-300"
                          aria-hidden="true"
                        >
                          <FileCode2 className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-800">
                            {showcase.title}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <Badge
                              className="bg-slate-50 font-mono text-[10px] text-slate-600 ring-1 ring-slate-200"
                              variant="secondary"
                            >
                              {showcase.filename}
                            </Badge>
                            <Badge className="bg-sky-50 text-sky-700 ring-1 ring-sky-100" variant="secondary">
                              {barisKode} baris kode
                            </Badge>
                            {barisOutput > 0 && (
                              <Badge className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" variant="secondary">
                                {barisOutput} baris output
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-none items-center gap-1.5">
                          {deletingShowcaseId === showcase.id ? (
                            <>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 rounded-full px-3 text-xs"
                                onClick={() => handleShowcaseDelete(showcase.id)}
                                disabled={savingShowcase}
                              >
                                Hapus?
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 rounded-full px-3 text-xs"
                                onClick={() => setDeletingShowcaseId(null)}
                              >
                                Batal
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-sky-600 hover:bg-sky-50 hover:text-sky-700"
                                aria-label={`Edit contoh kode ${showcase.title}`}
                                onClick={() => openShowcaseEdit(showcase)}
                              >
                                <Pencil className="h-4 w-4" aria-hidden="true" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                aria-label={`Hapus contoh kode ${showcase.title}`}
                                onClick={() => setDeletingShowcaseId(showcase.id)}
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {showcaseError && (
                  <p
                    role="alert"
                    className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
                  >
                    <AlertCircle className="h-4 w-4 flex-none" aria-hidden="true" />
                    {showcaseError}
                  </p>
                )}

                <div className="flex items-center justify-between gap-3 pt-1">
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="rounded-full border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <LogOut className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    Keluar
                  </Button>
                  <Button
                    onClick={openShowcaseCreate}
                    className="rounded-full bg-slate-800 text-white hover:bg-slate-900"
                  >
                    <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    Tambah Contoh Kode
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ============ FORM PROGRAM ============ */}
        {view === "form" && adminSection === "programs" && (
          <>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Program" : "Tambah Program Baru"}
              </DialogTitle>
              <DialogDescription>
                Isi detail program: nama, ikon, harga, durasi, deskripsi, dan materi.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4 pt-1">
              <div className="space-y-2">
                <Label htmlFor="prog-name">
                  Nama Program <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="prog-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="cth: Microsoft Office"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Ikon Program</Label>
                <div className="flex gap-2" role="radiogroup" aria-label="Pilih ikon program">
                  {ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={form.icon === opt.value}
                      onClick={() => setForm({ ...form, icon: opt.value })}
                      className={`flex flex-1 flex-col items-center gap-1 rounded-xl border-2 py-2.5 text-[11px] font-semibold transition-all ${
                        form.icon === opt.value
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-500 hover:border-sky-200"
                      }`}
                    >
                      <opt.icon className="h-5 w-5" aria-hidden="true" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gambar program (opsional) */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-sky-600" aria-hidden="true" />
                  Gambar Program{" "}
                  <span className="text-xs font-normal text-slate-400">(opsional)</span>
                </Label>

                {form.image ? (
                  <div className="flex items-center gap-3 rounded-xl border border-sky-100 bg-slate-50/70 p-2.5">
                    <img
                      src={form.image}
                      alt="Pratinjau gambar program"
                      className="h-16 w-28 flex-none rounded-lg object-cover ring-1 ring-slate-200"
                    />
                    <div className="min-w-0 flex-1 text-xs text-slate-500">
                      Gambar siap disimpan.
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 flex-none text-red-500 hover:bg-red-50 hover:text-red-600"
                      aria-label="Hapus gambar program"
                      onClick={() => setForm({ ...form, image: "" })}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={processingImage}
                      className="flex w-full flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-5 text-center transition-colors hover:border-sky-300 hover:bg-sky-50/50 disabled:opacity-60"
                    >
                      <ImagePlus className="h-6 w-6 text-sky-500" aria-hidden="true" />
                      <span className="text-xs font-semibold text-slate-600">
                        {processingImage ? "Memproses gambar..." : "Klik untuk pilih gambar dari perangkat"}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        JPG / PNG — otomatis diperkecil agar website tetap cepat
                      </span>
                    </button>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="prog-level">Level</Label>
                  <Input
                    id="prog-level"
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                    placeholder="cth: Pemula - Menengah"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prog-duration">Durasi</Label>
                  <Input
                    id="prog-duration"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="cth: 24 Sesi"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prog-price" className="flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  Harga Les Biasa
                </Label>
                <Input
                  id="prog-price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="cth: Rp 350.000 (kosongkan untuk 'Hubungi Admin')"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prog-cert-price" className="flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  Harga Bersertifikat{" "}
                  <span className="text-xs font-normal text-slate-400">(opsional)</span>
                </Label>
                <Input
                  id="prog-cert-price"
                  value={form.certificatePrice}
                  onChange={(e) => setForm({ ...form, certificatePrice: e.target.value })}
                  placeholder="cth: Rp 2.300.000 — kosongkan untuk pakai harga paket global"
                />
                <p className="text-[11px] leading-relaxed text-slate-400">
                  Khusus program ini. Kalau kosong, kartu memakai harga pada tab
                  &ldquo;Harga Paket&rdquo;.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prog-desc">Deskripsi Singkat</Label>
                <Textarea
                  id="prog-desc"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Deskripsi program yang tampil di kartu beranda..."
                  rows={2}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Materi <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-2">
                  {form.topics.map((topic, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={topic}
                        onChange={(e) => {
                          const next = [...form.topics];
                          next[index] = e.target.value;
                          setForm({ ...form, topics: next });
                        }}
                        placeholder={`cth: Materi ${index + 1}`}
                        aria-label={`Materi ${index + 1}`}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 flex-none text-red-500 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Hapus materi ${index + 1}`}
                        disabled={form.topics.length <= 1}
                        onClick={() =>
                          setForm({
                            ...form,
                            topics: form.topics.filter((_, i) => i !== index),
                          })
                        }
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  onClick={() => setForm({ ...form, topics: [...form.topics, ""] })}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                  Tambah Materi
                </Button>
              </div>

              {/* Materi detail (halaman detail program via link ?program=...) */}
              <div className="space-y-2">
                <Label htmlFor="prog-materials" className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-sky-600" aria-hidden="true" />
                  Materi Halaman Detail{" "}
                  <span className="text-xs font-normal text-slate-400">(opsional)</span>
                </Label>
                <Textarea
                  id="prog-materials"
                  value={form.materials}
                  onChange={(e) => setForm({ ...form, materials: e.target.value })}
                  placeholder={"cth:\nPertemuan 1: Pengenalan komputer\nPertemuan 2: Word dasar\nPertemuan 3: Excel formula"}
                  rows={5}
                  className="resize-y text-sm leading-relaxed"
                />
                <p className="text-[11px] leading-relaxed text-slate-400">
                  Satu materi per baris. Tampil di jendela detail program (halaman yang
                  dibagikan lewat link). Jika kosong, dipakai daftar materi di kartu.
                </p>
              </div>

              {formError && (
                <p
                  role="alert"
                  className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
                >
                  <AlertCircle className="h-4 w-4 flex-none" aria-hidden="true" />
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setView("list")}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 text-white hover:from-sky-600 hover:to-emerald-600"
                >
                  {saving ? (
                    "Menyimpan..."
                  ) : (
                    <>
                      <Check className="mr-1.5 h-4 w-4" aria-hidden="true" />
                      {editingId ? "Simpan Perubahan" : "Tambah Program"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}

        {/* ============ FORM PAMERAN KODE ============ */}
        {view === "form" && adminSection === "showcase" && (
          <>
            <DialogHeader>
              <DialogTitle>
                {editingShowcaseId ? "Edit Contoh Kode" : "Tambah Contoh Kode"}
              </DialogTitle>
              <DialogDescription>
                Contoh kode ini yang tampil di jendela &ldquo;Contoh Materi&rdquo; pada beranda.
                Boleh C++, Python, Java, HTML, dan lainnya.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleShowcaseSave} className="space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="sc-title">
                    Judul / Label <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="sc-title"
                    value={showcaseForm.title}
                    onChange={(e) => setShowcaseForm({ ...showcaseForm, title: e.target.value })}
                    placeholder="cth: C++ Dasar"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sc-filename">Nama File</Label>
                  <Input
                    id="sc-filename"
                    value={showcaseForm.filename}
                    onChange={(e) => setShowcaseForm({ ...showcaseForm, filename: e.target.value })}
                    placeholder="cth: materi-dasar/main.cpp"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sc-code">
                  Kode <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="sc-code"
                  value={showcaseForm.code}
                  onChange={(e) => setShowcaseForm({ ...showcaseForm, code: e.target.value })}
                  placeholder={"cth:\nint main() {\n    return 0;\n}"}
                  rows={10}
                  spellCheck={false}
                  className="resize-y font-mono text-xs leading-relaxed"
                />
                <p className="text-[11px] leading-relaxed text-slate-400">
                  Tulis kode apa adanya — website otomatis memberi warna seperti editor sungguhan.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sc-output">
                  Output <span className="text-xs font-normal text-slate-400">(opsional)</span>
                </Label>
                <Textarea
                  id="sc-output"
                  value={showcaseForm.output}
                  onChange={(e) => setShowcaseForm({ ...showcaseForm, output: e.target.value })}
                  placeholder="cth:&#10;Halo LesKomputer!"
                  rows={4}
                  spellCheck={false}
                  className="resize-y font-mono text-xs leading-relaxed"
                />
                <p className="text-[11px] leading-relaxed text-slate-400">
                  Hasil jalannya program, satu baris per baris. Kosongkan bila tidak perlu —
                  panel output otomatis disembunyikan.
                </p>
              </div>

              {showcaseError && (
                <p
                  role="alert"
                  className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
                >
                  <AlertCircle className="h-4 w-4 flex-none" aria-hidden="true" />
                  {showcaseError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setView("list")}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={savingShowcase}
                  className="rounded-full bg-slate-800 text-white hover:bg-slate-900"
                >
                  {savingShowcase ? (
                    "Menyimpan..."
                  ) : (
                    <>
                      <Check className="mr-1.5 h-4 w-4" aria-hidden="true" />
                      {editingShowcaseId ? "Simpan Perubahan" : "Tambah Contoh Kode"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
