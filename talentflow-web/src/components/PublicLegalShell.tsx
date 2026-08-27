import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export default function PublicLegalShell({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard-atmosphere flex min-h-screen flex-col overflow-hidden bg-background font-sans text-foreground selection:bg-primary/30">
      <div className="pointer-events-none absolute -top-[10%] -left-[10%] -z-10 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[140px] dark:bg-primary/5" />
      <div className="pointer-events-none absolute -bottom-[10%] left-[20%] -z-10 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[130px] dark:bg-primary/5" />

      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl transition-all group-hover:scale-105">
              <Image src="/brand/logo-dark.webp" alt="TalentFlow Logo" fill sizes="36px" className="object-contain dark:hidden" priority />
              <Image src="/brand/logo-light.webp" alt="TalentFlow Logo" fill sizes="36px" className="hidden object-contain dark:block" priority />
            </div>
            <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-xl font-bold tracking-tight text-transparent">TalentFlow</span>
          </Link>

          <Link href="/" className="flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm font-semibold transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Voltar para Home
          </Link>
        </div>
      </header>

      {children}
    </div>
  );
}
