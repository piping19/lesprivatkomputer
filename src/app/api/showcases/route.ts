import { NextResponse } from "next/server";
import { getShowcases } from "@/lib/showcase-store";

export const dynamic = "force-dynamic";

/** Endpoint publik: daftar contoh kode (Pameran Kode) + mode penyimpanan */
export async function GET() {
  try {
    const { showcases, storage } = await getShowcases();
    return NextResponse.json({ showcases, storage });
  } catch (error) {
    console.error("GET /api/showcases error:", error);
    return NextResponse.json(
      { error: "Gagal memuat contoh kode" },
      { status: 500 }
    );
  }
}
