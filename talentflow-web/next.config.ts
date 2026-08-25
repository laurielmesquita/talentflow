import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  // O Next.js 16 (App Router) injeta scripts inline de bootstrap do RSC
  // (self.__next_f.push). Sem 'unsafe-inline' em produção o navegador bloqueia
  // esses scripts e a hidratação nunca acontece — a página fica presa no
  // fallback de loading. Por isso script-src precisa de 'unsafe-inline' também
  // em produção. 'unsafe-eval' continua restrito ao dev (HMR/Turbopack).
  isDev
    ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  // img-src limitado a Cloudinary (foto de candidatos) + data/blob para o PDFViewer.
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "font-src 'self' data:",
  // Mantém os dois backends durante o rollout: Render é o candidato atual e
  // Fly.io permanece disponível para rollback. Em desenvolvimento libera localhost.
  isDev
    ? "connect-src 'self' https://talentflow-api-free.onrender.com https://talentflow-api-frosty-seastar-3318.fly.dev https://talentflow-api.fly.dev http://localhost:8000"
    : "connect-src 'self' https://talentflow-api-free.onrender.com https://talentflow-api-frosty-seastar-3318.fly.dev https://talentflow-api.fly.dev",
  // frame-src em produção limita a self + blob (PDFViewer emit blob URLs) +
  // Cloudinary (PDFs públicos se houver fallback). Em desenvolvimento libera
  // localhost para o iframe de dev.
  isDev
    ? "frame-src 'self' blob: https://res.cloudinary.com http://localhost:8000"
    : "frame-src 'self' blob: https://res.cloudinary.com",
  "object-src 'self' blob:",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      // Security headers
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: csp,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // HSTS — implícito em vercel.app, mas reforça o primado se
          // o apex domain customizar em vez do subdom营io da Vercel.
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
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
