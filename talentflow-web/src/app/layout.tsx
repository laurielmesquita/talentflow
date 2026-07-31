import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PresetProvider } from "@/components/preset-provider";
import { DesignSwitcher } from "@/components/design-switcher";
import dynamic from "next/dynamic";

const Footer = dynamic(() => import("@/components/Footer"), { ssr: true });

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { version } = require("../../package.json") as { version: string };

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tlntflow.vercel.app"),
  title: {
    default: "TalentFlow — Banco de Talentos Inteligente",
    template: "%s | TalentFlow",
  },
  description: "Triagem automatizada de currículos baseada em Inteligência Artificial Generativa para processos seletivos de alta performance.",
  keywords: ["recrutamento", "triagem de currículos", "IA", "inteligência artificial", "analytics", "RH", "ATS"],
  authors: [{ name: "Space Square" }],
  openGraph: {
    title: "TalentFlow — Banco de Talentos Inteligente",
    description: "Triagem automatizada de currículos baseada em Inteligência Artificial Generativa para processos seletivos de alta performance.",
    url: "https://tlntflow.vercel.app",
    siteName: "TalentFlow",
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "TalentFlow — Banco de Talentos Inteligente"
      }
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TalentFlow — Banco de Talentos Inteligente",
    description: "Triagem automatizada de currículos baseada em Inteligência Artificial Generativa.",
    images: ["/brand/og-image.png"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* Melhoria #2 — Script anti-FOUC: aplica data-preset ANTES da hidratação React.
          Executa síncronamente, impedindo qualquer flash de estilos padrão. */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=localStorage.getItem('talentflow-design-preset')||'linear';document.documentElement.setAttribute('data-preset',p);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/* Melhoria #1 — PresetProvider dentro do ThemeProvider para acessar useTheme() */}
          <PresetProvider>
            {children}
            <Footer version={version} />
            {/* Melhoria #3 — DesignSwitcher visível em dev local e em Preview deploys da Vercel.
                Em produção (tlntflow.vercel.app), VERCEL_ENV === "production" bloqueia a renderização. */}
            {(process.env.NEXT_PUBLIC_ENABLE_DESIGN_SWITCHER === "true" ||
              process.env.VERCEL_ENV === "preview" ||
              process.env.NODE_ENV === "development") &&
              process.env.VERCEL_ENV !== "production" && <DesignSwitcher />}
          </PresetProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
