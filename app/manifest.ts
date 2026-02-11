import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CreationX",
    short_name: "CreationX",
    description: "Tu espacio creativo profesional",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#111827",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { src: "/icon.svg", sizes: "512x512", type: "image/svg+xml" },
      { src: "/ChatGPT Image 11 feb 2026, 02_07_12 p.m..png", sizes: "any", type: "image/png" }
    ]
  };
}
