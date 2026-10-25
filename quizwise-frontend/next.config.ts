import type { NextConfig } from "next";

// Canlı Render backend URL'i varsa oraya, yoksa yerel backend'e yönlendir
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const backendBase = rawApiUrl.replace(/\/api(\/v1)?\/?$/, "").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendBase || "http://127.0.0.1:8000"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;