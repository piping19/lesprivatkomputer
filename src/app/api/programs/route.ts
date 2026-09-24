import { NextResponse } from "next/server";
import { getPrograms } from "@/lib/program-store";

export const dynamic = "force-dynamic";

/** Endpoint publik: daftar program les + mode penyimpanan aktif */
export async function GET() {
  try {
    const { programs, storage } = await getPrograms();
    return NextResponse.json({ programs, storage });
  } catch (error) {
    console.error("GET /api/programs error:", error);
    return NextResponse.json(
      { error: "Gagal memuat program" },
      { status: 500 }
    );
  }
}
