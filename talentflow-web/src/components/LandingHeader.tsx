"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getSession } from "@/lib/auth";

const links = [
  { href: "/#sandbox", label: "Demonstração", id: "sandbox" },
  { href: "/#features", label: "Funcionalidades", id: "features" },
  { href: "/#how-it-works", label: "Como funciona", id: "how-it-works" },
  { href: "/vagas", label: "Vagas", id: "vagas" },
];

export default function LandingHeader() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    window.requestAnimationFrame(() => setAuthenticated(Boolean(getSession().token)));
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 16);
      if (y < 120) setActiveSection("");
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    const observers = links.map(({ id }) => {
      const element = document.getElementById(id);
      if (!element || id === "vagas") return null;
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setActiveSection(id);
      }, { rootMargin: "-25% 0px -55% 0px" });
      observer.observe(element);
      return observer;
    });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const linkClass = (id: string) => `px-3 py-2 text-sm transition-colors ${
    activeSection === id || (id === "vagas" && pathname?.startsWith("/vagas"))
      ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`;

  return (
    <header className={`sticky top-0 z-50 border-b transition-colors ${scrolled ? "border-border bg-background/95 backdrop-blur-md" : "border-border/60 bg-background"}`}>
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-6">
        <Link href="/" onClick={closeMenu} className="flex items-center gap-3" aria-label="TalentFlow — página inicial">
          <Image src="/brand/icon.png" alt="" width={34} height={34} className="h-8 w-8 object-contain" priority />
          <span className="text-[1.05rem] font-semibold tracking-[-0.03em] text-foreground">TalentFlow</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegação principal">
          {links.map((link) => <Link key={link.id} href={link.href} className={linkClass(link.id)}>{link.label}</Link>)}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <ThemeToggle />
          {authenticated ? (
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-primary hover:text-primary/80">Abrir sistema <ArrowUpRight className="h-4 w-4" /></Link>
          ) : (
            <Link href="/login" className="px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground">Entrar</Link>
          )}
          <Link href={authenticated ? "/dashboard" : "/login?signup=true"} className="inline-flex items-center gap-2 bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 active:translate-y-0">
            {authenticated ? "Voltar ao painel" : "Criar conta"} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <button type="button" className="inline-flex h-10 w-10 items-center justify-center border border-border text-foreground sm:hidden" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-background px-5 pb-5 pt-3 sm:hidden">
          <nav className="flex flex-col" aria-label="Navegação mobile">
            {links.map((link) => <Link key={link.id} href={link.href} onClick={closeMenu} className="border-b border-border/70 py-3 text-sm font-medium text-foreground">{link.label}</Link>)}
            <Link href={authenticated ? "/dashboard" : "/login"} onClick={closeMenu} className="border-b border-border/70 py-3 text-sm font-semibold text-primary">{authenticated ? "Abrir sistema" : "Entrar"}</Link>
            <Link href={authenticated ? "/dashboard" : "/login?signup=true"} onClick={closeMenu} className="mt-4 inline-flex w-fit items-center gap-2 bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">{authenticated ? "Voltar ao painel" : "Criar conta"} <ArrowUpRight className="h-4 w-4" /></Link>
          </nav>
        </div>
      )}
    </header>
  );
}
