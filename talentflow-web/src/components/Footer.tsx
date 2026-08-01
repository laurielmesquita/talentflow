"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface FooterProps {
  version?: string;
}

export default function Footer({ version = "2.1.0" }: FooterProps) {
  const pathname = usePathname();

  const isSimplePage =
    pathname === "/" ||
    ["/privacy", "/terms", "/login", "/forgot-password", "/reset-password", "/vagas"].some(
      (route) => pathname?.startsWith(route)
    );

  if (isSimplePage) {
    return (
      <footer className="border-t border-border/60 bg-background py-5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative w-5 h-5 rounded-[4px] overflow-hidden flex-shrink-0">
              <Image src="/brand/logo-dark.webp" alt="TalentFlow Logo" fill sizes="20px" className="object-contain dark:hidden" />
              <Image src="/brand/logo-light.webp" alt="TalentFlow Logo" fill sizes="20px" className="object-contain hidden dark:block" />
            </div>
            <span className="text-[12px] text-muted-foreground">
              © {new Date().getFullYear()} TalentFlow — Desenvolvido por{" "}
              <span className="text-foreground font-medium">Space Square</span>
            </span>
            <span className="text-[10px] text-muted-foreground/60 font-mono bg-surface-2 border border-border px-1.5 py-0.5 rounded">
              v{version}
            </span>
          </div>
          <div className="flex gap-5 text-[12px] text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground transition-colors">Termos</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacidade</Link>
            <a href="mailto:plataforma.talentflow@outlook.com" className="hover:text-foreground transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
    );
  }

  // Variante interna — workspace logado
  return (
    <footer className="border-t border-border/60 bg-background py-5 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative w-5 h-5 rounded-[4px] overflow-hidden flex-shrink-0">
            <Image src="/brand/logo-dark.webp" alt="TalentFlow Logo" fill sizes="20px" className="object-contain dark:hidden" />
            <Image src="/brand/logo-light.webp" alt="TalentFlow Logo" fill sizes="20px" className="object-contain hidden dark:block" />
          </div>
          <span className="text-[12px] text-muted-foreground">
            © {new Date().getFullYear()} TalentFlow —{" "}
            <span className="text-foreground/70 font-medium">Space Square</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/60 font-mono bg-surface-2 border border-border px-1.5 py-0.5 rounded">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            v{version}
          </span>
        </div>
        <div className="flex gap-5 text-[12px] text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors">Termos</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacidade</Link>
          <a href="mailto:plataforma.talentflow@outlook.com" className="hover:text-foreground transition-colors">Suporte</a>
        </div>
      </div>
    </footer>
  );
}
