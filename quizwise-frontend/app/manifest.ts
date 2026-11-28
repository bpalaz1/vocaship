import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VocaShip — Sail to Fluency",
    short_name: "VocaShip",
    description: "AI Destekli Akıllı Kelime, Okuma ve Konuşma Platformu",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0B0F19",
    theme_color: "#0B0F19",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
