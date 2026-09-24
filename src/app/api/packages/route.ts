import { NextResponse } from "next/server";
import { getPackages } from "@/lib/package-store";

export const dynamic = "force-dynamic";

/** Endpoint publik: daftar paket harga (LES BIASA / LES RESMI) + mode penyimpanan */
export async function GET() {
  try {
    const { packages, storage } = await getPackages();
    return NextResponse.json({ packages, storage });
  } catch (error) {
    console.error("GET /api/packages error:", error);
    return NextResponse.json(
      { error: "Gagal memuat paket harga" },
      { status: 500 }
    );
  }
}
