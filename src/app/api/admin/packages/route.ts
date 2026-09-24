import { NextRequest, NextResponse } from "next/server";
import { extractToken, verifyToken } from "@/lib/auth";
import { sanitizePackageInput } from "@/lib/json-db";
import {
  createPackage,
  deletePackage,
  updatePackage,
} from "@/lib/package-store";

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

/** Tambah paket harga baru */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const body = await req.json().catch(() => null);
    const clean = sanitizePackageInput(body);
    if (!clean) {
      return NextResponse.json(
        { error: "Nama paket dan harga wajib diisi" },
        { status: 400 }
      );
    }

    const pkg = await createPackage(clean);
    return NextResponse.json({ package: pkg }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/packages error:", error);
    return NextResponse.json({ error: "Gagal menambah paket" }, { status: 500 });
  }
}

/** Perbarui paket berdasarkan id (id dikirim di body) */
export async function PUT(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const body = await req.json().catch(() => null);
    const id = typeof body?.id === "string" ? body.id : "";
    const clean = sanitizePackageInput(body);
    if (!id || !clean) {
      return NextResponse.json(
        { error: "Data tidak valid. Nama paket dan harga wajib diisi" },
        { status: 400 }
      );
    }

    const updated = await updatePackage(id, clean);
    if (!updated) {
      return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ package: updated });
  } catch (error) {
    console.error("PUT /api/admin/packages error:", error);
    return NextResponse.json({ error: "Gagal memperbarui paket" }, { status: 500 });
  }
}

/** Hapus paket: /api/admin/packages?id=xxx */
export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const id = req.nextUrl.searchParams.get("id") ?? "";
    if (!id) {
      return NextResponse.json({ error: "ID paket wajib disertakan" }, { status: 400 });
    }

    const ok = await deletePackage(id);
    if (!ok) {
      return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/packages error:", error);
    return NextResponse.json({ error: "Gagal menghapus paket" }, { status: 500 });
  }
}
