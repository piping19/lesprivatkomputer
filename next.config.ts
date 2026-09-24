import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 'standalone' hanya diperlukan untuk self-hosting (VPS/Docker):
  // jalankan `bun run build:standalone`. Untuk deploy Vercel, biarkan default.
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
  reactStrictMode: false,
};

export default nextConfig;
