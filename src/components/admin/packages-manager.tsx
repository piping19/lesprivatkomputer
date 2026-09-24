"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Wallet,
  Award,
  LogOut,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/lib/store";
import type { PricingPackage } from "@/lib/packages-data";

/**
 * Bagian admin "Harga Paket": kelola pilihan LES BIASA / LES RESMI
 * SERTIFIKAT yang tampil di website. Semua perubahan langsung tersimpan
 * di database (atau file sementara bila database belum diatur).
 */

interface PackageForm {
  name: string;
  tagline: string;
  priceLabel: string;
  price: string;
  note: string;
  waMessage: string;
  highlight: boolean;
}

const EMPTY_FORM: PackageForm = {
  name: "",
  tagline: "",
  priceLabel: "Harga",
  price: "",
  note: "",
  waMessage: "",
  highlight: false,
};

export function PackagesManager() {
  const {
    adminToken: token,
    packages,
    packagesLoading,
    fetchPackages,
    logoutAdmin,
  } = useAppStore();

  const [mode, setMode] = useState<"list" | "form">("list");
  const [form, setForm] = useState<PackageForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    void fetchPackages();
  }, [fetchPackages]);

  function handleUnauthorized() {
    logoutAdmin();
  }

  function openCreateForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError("");
    setMode("form");
  }

  function openEditForm(pkg: PricingPackage) {
    setForm({
      name: pkg.name,
      tagline: pkg.tagline,
      priceLabel: pkg.priceLabel || "Harga",
      price: pkg.price,
      note: pkg.note,
      waMessage: pkg.waMessage,
      highlight: pkg.highlight,
    });
    setEditingId(pkg.id);
    setFormError("");
    setMode("form");
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!form.name.trim()) {
      setFormError("Nama paket wajib diisi");
      return;
    }
    if (!form.price.trim()) {
      setFormError("Harga wajib diisi (mis. Rp 350.000)");
      return;
    }

    setSaving(true);
    const payload = {
      id: editingId,
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      priceLabel: form.priceLabel.trim() || "Harga",
      price: form.price.trim(),
      note: form.note.trim(),
      waMessage: form.waMessage.trim(),
      highlight: form.highlight,
    };

    fetch("/api/admin/packages", {
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
        if (!res.ok) throw new Error(data.error || "Gagal menyimpan paket");
        return data;
      })
      .then(async () => {
        await fetchPackages();
        setMode("list");
        setEditingId(null);
      })
      .catch((err: Error) => {
        if (err.message !== "Sesi berakhir") setFormError(err.message);
      })
      .finally(() => setSaving(false));
  }

  function handleDelete(id: string) {
    setSaving(true);
    fetch(`/api/admin/packages?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token ?? ""}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 401) {
          handleUnauthorized();
          throw new Error("Sesi berakhir");
        }
        if (!res.ok) throw new Error(data.error || "Gagal menghapus paket");
        return data;
      })
      .then(() => fetchPackages())
      .catch(() => {
        // diamkan: daftar akan di-refresh
      })
      .finally(() => {
        setSaving(false);
        setDeletingId(null);
      });
  }

  /* ================== FORM ================== */
  if (mode === "form") {
    return (
      <form onSubmit={handleSave} className="space-y-3 pt-1" noValidate>
        <p className="text-sm font-extrabold text-slate-800">
          {editingId ? "Edit Paket Harga" : "Tambah Paket Harga"}
        </p>

        <div className="space-y-1">
          <Label htmlFor="pkg-name" className="text-xs font-semibold text-slate-600">
            Nama Paket *
          </Label>
          <Input
            id="pkg-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="mis. LES BIASA"
            className="h-9 rounded-xl border-slate-200 text-sm"
            maxLength={60}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="pkg-price" className="text-xs font-semibold text-slate-600">
              Harga *
            </Label>
            <Input
              id="pkg-price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="mis. Rp 350.000"
              className="h-9 rounded-xl border-slate-200 text-sm"
              maxLength={30}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pkg-price-label" className="text-xs font-semibold text-slate-600">
              Label Harga
            </Label>
            <Input
              id="pkg-price-label"
              value={form.priceLabel}
              onChange={(e) => setForm({ ...form, priceLabel: e.target.value })}
              placeholder="mis. Harga mulai"
              className="h-9 rounded-xl border-slate-200 text-sm"
              maxLength={30}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="pkg-tagline" className="text-xs font-semibold text-slate-600">
            Deskripsi Singkat
          </Label>
          <Input
            id="pkg-tagline"
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            placeholder="mis. Tanpa sertifikat"
            className="h-9 rounded-xl border-slate-200 text-sm"
            maxLength={80}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="pkg-note" className="text-xs font-semibold text-slate-600">
            Catatan Tambahan
          </Label>
          <Textarea
            id="pkg-note"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="mis. Harga tiap program berbeda."
            className="min-h-[60px] rounded-xl border-slate-200 text-sm"
            maxLength={200}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="pkg-wa" className="text-xs font-semibold text-slate-600">
            Pesan WhatsApp
          </Label>
          <Textarea
            id="pkg-wa"
            value={form.waMessage}
            onChange={(e) => setForm({ ...form, waMessage: e.target.value })}
            placeholder="Pesan otomatis saat pengunjung klik tombol paket ini"
            className="min-h-[60px] rounded-xl border-slate-200 text-sm"
            maxLength={300}
          />
        </div>

        <label
          className="flex cursor-pointer items-center gap-2.5 rounded-xl bg-emerald-50 px-3 py-2.5 ring-1 ring-emerald-100"
          htmlFor="pkg-highlight"
        >
          <input
            id="pkg-highlight"
            type="checkbox"
            checked={form.highlight}
            onChange={(e) => setForm({ ...form, highlight: e.target.checked })}
            className="h-4 w-4 accent-emerald-600"
          />
          <span className="text-xs font-semibold text-emerald-800">
            Tonjolkan paket ini (warna hijau + ikon sertifikat)
          </span>
        </label>

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
            type="button"
            variant="outline"
            onClick={() => setMode("list")}
            className="rounded-full border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 text-white hover:from-sky-600 hover:to-emerald-600"
          >
            {saving ? "Menyimpan..." : "Simpan Paket"}
          </Button>
        </div>
      </form>
    );
  }

  /* ================== DAFTAR ================== */
  return (
    <div className="space-y-3 pt-1">
      <div className="max-h-72 space-y-2.5 overflow-y-auto rounded-xl bg-slate-50/70 p-2.5 ring-1 ring-slate-100">
        {packagesLoading && (
          <div className="space-y-2 p-1" aria-busy="true" aria-label="Memuat paket">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        )}
        {!packagesLoading && packages.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">
            Belum ada paket harga. Klik &ldquo;Tambah Paket&rdquo; untuk membuat.
          </p>
        )}
        {!packagesLoading &&
          packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`flex items-center gap-3 rounded-xl border bg-white p-3 ${
                pkg.highlight ? "border-emerald-200" : "border-sky-100"
              }`}
            >
              <span
                className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl ${
                  pkg.highlight
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-sky-100 text-sky-600"
                }`}
                aria-hidden="true"
              >
                {pkg.highlight ? <Award className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-800">{pkg.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge
                    className={
                      pkg.highlight
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                        : "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
                    }
                    variant="secondary"
                  >
                    {pkg.price}
                  </Badge>
                  {pkg.highlight && (
                    <Badge
                      className="bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                      variant="secondary"
                    >
                      <Sparkles className="mr-1 h-3 w-3" aria-hidden="true" />
                      Ditonjolkan
                    </Badge>
                  )}
                  {pkg.tagline && (
                    <span className="truncate text-xs text-slate-500">{pkg.tagline}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-none items-center gap-1.5">
                {deletingId === pkg.id ? (
                  <>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 rounded-full px-3 text-xs"
                      onClick={() => handleDelete(pkg.id)}
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
                      aria-label={`Edit paket ${pkg.name}`}
                      onClick={() => openEditForm(pkg)}
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Hapus paket ${pkg.name}`}
                      onClick={() => setDeletingId(pkg.id)}
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
          onClick={logoutAdmin}
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
          Tambah Paket
        </Button>
      </div>
    </div>
  );
}
