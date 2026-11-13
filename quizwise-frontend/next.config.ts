import type { NextConfig } from "next";

// Canlı Render backend URL'i varsa oraya, yoksa yerel backend'e yönlendir
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const backendBase = rawApiUrl.replace(/\/api(\/v1)?\/?$/, "").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendBase || "http://127.0.0.1:8000"}/api/:path*`,
      },
      {
        source: "/decks/:path*",
        destination: `${backendBase || "http://127.0.0.1:8000"}/decks/:path*`,
      },
      {
        source: "/folders/:path*",
        destination: `${backendBase || "http://127.0.0.1:8000"}/folders/:path*`,
      },
      {
        source: "/avatar/:path*",
        destination: `${backendBase || "http://127.0.0.1:8000"}/avatar/:path*`,
      },
      {
        source: "/tts/:path*",
        destination: `${backendBase || "http://127.0.0.1:8000"}/tts/:path*`,
      },
    ];
  },
};

export default nextConfig;