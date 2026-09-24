import crypto from "crypto";

/**
 * Autentikasi admin sederhana berbasis token HMAC.
 * - Kredensial default: username "admin", password "admin123"
 * - Bisa dioverride lewat env: ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_SECRET
 * - Token berlaku 24 jam: <expiry>.<hmac(expiry)>
 */

const SECRET = process.env.ADMIN_SECRET || "leskomputer-rahasia-2024";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 jam

export function checkCredentials(username?: string, password?: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function createToken(): string {
  const expiry = String(Date.now() + TOKEN_TTL_MS);
  return `${expiry}.${sign(expiry)}`;
}

export function verifyToken(token: string | null | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [expiry, sig] = parts;
  const expected = sign(expiry);
  if (sig.length !== expected.length) return false;
  if (Number.isNaN(Number(expiry)) || Number(expiry) < Date.now()) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

/** Ambil token dari header Authorization: Bearer <token> */
export function extractToken(header: string | null): string | null {
  if (!header) return null;
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}
