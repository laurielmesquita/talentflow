import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      // Assets de marca: logos, og-image — cache de 24h com revalidação suave
      // Resolve o problema crítico de re-download de 1.8MB a cada visita no Safari
      {
        source: "/brand/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=3600",
          },
        ],
      },
      // Icons do app — cache de 24h
      {
        source: "/icon.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, immutable",
          },
        ],
      },
      {
        source: "/apple-icon.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
