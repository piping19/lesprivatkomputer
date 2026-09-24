import { NextRequest, NextResponse } from "next/server";
import { checkCredentials, createToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Login admin: kembalikan token jika kredensial benar */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const username = typeof body?.username === "string" ? body.username : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!checkCredentials(username, password)) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    return NextResponse.json({ token: createToken() });
  } catch (error) {
    console.error("POST /api/admin/login error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
