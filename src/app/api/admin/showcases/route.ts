import { NextRequest, NextResponse } from "next/server";
import { extractToken, verifyToken } from "@/lib/auth";
import { sanitizeShowcaseInput, MAX_CODE_LENGTH } from "@/lib/showcase-db";
import {
  createShowcase,
  deleteShowcase,
  updateShowcase,
} from "@/lib/showcase-store";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  return verifyToken(extractToken(req.headers.get("authorization")));
}

function unauthorized() {
  return NextResponse.json(
    { error: "Tidak memiliki akses. Silakan login ulang." },
    { status: 401 }
  );
}

/** Tambah contoh kode baru */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const body = await req.json().catch(() => null);
    if (typeof body?.code === "string" && body.code.length > MAX_CODE_LENGTH) {
      return NextResponse.json(
        { error: `Kode terlalu panjang (maksimal ${MAX_CODE_LENGTH} karakter)` },
        { status: 400 }
      );
    }
    const clean = sanitizeShowcaseInput(body);
    if (!clean) {
      return NextResponse.json(
        { error: "Judul dan kode wajib diisi" },
        { status: 400 }
      );
    }

    const showcase = await createShowcase(clean);
    return NextResponse.json({ showcase }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/showcases error:", error);
    return NextResponse.json({ error: "Gagal menambah contoh kode" }, { status: 500 });
  }
}

/** Perbarui contoh kode berdasarkan id (id dikirim di body) */
export async function PUT(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const body = await req.json().catch(() => null);
    const id = typeof body?.id === "string" ? body.id : "";
    if (typeof body?.code === "string" && body.code.length > MAX_CODE_LENGTH) {
      return NextResponse.json(
        { error: `Kode terlalu panjang (maksimal ${MAX_CODE_LENGTH} karakter)` },
        { status: 400 }
      );
    }
    const clean = sanitizeShowcaseInput(body);
    if (!id || !clean) {
      return NextResponse.json(
        { error: "Data tidak valid. Judul dan kode wajib diisi" },
        { status: 400 }
      );
    }

    const updated = await updateShowcase(id, clean);
    if (!updated) {
      return NextResponse.json({ error: "Contoh kode tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ showcase: updated });
  } catch (error) {
    console.error("PUT /api/admin/showcases error:", error);
    return NextResponse.json({ error: "Gagal memperbarui contoh kode" }, { status: 500 });
  }
}

/** Hapus contoh kode: /api/admin/showcases?id=xxx */
export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const id = req.nextUrl.searchParams.get("id") ?? "";
    if (!id) {
      return NextResponse.json({ error: "ID contoh kode wajib disertakan" }, { status: 400 });
    }

    const ok = await deleteShowcase(id);
    if (!ok) {
      return NextResponse.json({ error: "Contoh kode tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/showcases error:", error);
    return NextResponse.json({ error: "Gagal menghapus contoh kode" }, { status: 500 });
  }
}
