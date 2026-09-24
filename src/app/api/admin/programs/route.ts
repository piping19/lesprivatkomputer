import { NextRequest, NextResponse } from "next/server";
import { extractToken, verifyToken } from "@/lib/auth";
import { sanitizeProgramInput } from "@/lib/json-db";
import {
  createProgram,
  deleteProgram,
  updateProgram,
} from "@/lib/program-store";

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

/** Tambah program baru */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const body = await req.json().catch(() => null);
    const clean = sanitizeProgramInput(body);
    if (!clean) {
      return NextResponse.json(
        { error: "Nama program dan minimal 1 materi wajib diisi" },
        { status: 400 }
      );
    }

    const program = await createProgram(clean);
    return NextResponse.json({ program }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/programs error:", error);
    return NextResponse.json({ error: "Gagal menambah program" }, { status: 500 });
  }
}

/** Perbarui program berdasarkan id (id dikirim di body) */
export async function PUT(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const body = await req.json().catch(() => null);
    const id = typeof body?.id === "string" ? body.id : "";
    const clean = sanitizeProgramInput(body);
    if (!id || !clean) {
      return NextResponse.json(
        { error: "Data tidak valid. Nama program dan minimal 1 materi wajib diisi" },
        { status: 400 }
      );
    }

    const updated = await updateProgram(id, clean);
    if (!updated) {
      return NextResponse.json({ error: "Program tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ program: updated });
  } catch (error) {
    console.error("PUT /api/admin/programs error:", error);
    return NextResponse.json({ error: "Gagal memperbarui program" }, { status: 500 });
  }
}

/** Hapus program: /api/admin/programs?id=xxx */
export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const id = req.nextUrl.searchParams.get("id") ?? "";
    if (!id) {
      return NextResponse.json({ error: "ID program wajib disertakan" }, { status: 400 });
    }

    const ok = await deleteProgram(id);
    if (!ok) {
      return NextResponse.json({ error: "Program tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/programs error:", error);
    return NextResponse.json({ error: "Gagal menghapus program" }, { status: 500 });
  }
}
