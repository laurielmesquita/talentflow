"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LandingHeader() {
  const [activeSection, setActiveSection] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Check initial scroll
    setScrolled(window.scrollY > 20);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const sections = ["sandbox", "features", "how-it-works"];
    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        {
          rootMargin: "-25% 0px -55% 0px", // Trigger when section occupies the active reading area
        }
      );
      observer.observe(el);
      return { observer, el };
    });

    const handleScrollTop = () => {
      if (window.scrollY < 120) {
        setActiveSection("");
      }
    };
    window.addEventListener("scroll", handleScrollTop);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScrollTop);
      observers.forEach((obs) => {
        if (obs) {
          obs.observer.unobserve(obs.el);
        }
      });
    };
  }, []);

  const getLinkClass = (id: string) => {
    const isActive = activeSection === id;
    return `px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
      isActive
        ? "text-primary bg-primary/10 shadow-sm font-semibold"
        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
    }`;
  };

  return (
    <header
      className={`border-b sticky top-0 z-50 transition-all duration-350 ${
        scrolled
          ? "border-border/60 bg-background/80 backdrop-blur-xl shadow-sm shadow-black/5"
          : "border-transparent bg-background/30 backdrop-blur-md"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group" aria-label="TalentFlow — Página inicial">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-black text-sm text-primary-foreground shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform duration-200">
            TF
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            TalentFlow
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm" aria-label="Navegação principal">
          <a href="#sandbox" className={getLinkClass("sandbox")}>
            Demonstração
          </a>
          <a href="#features" className={getLinkClass("features")}>
            Funcionalidades
          </a>
          <a href="#how-it-works" className={getLinkClass("how-it-works")}>
            Como funciona
          </a>
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          <Link
            href="/login"
            className="hidden sm:block text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors py-2 px-3 rounded-lg"
          >
            Entrar
          </Link>
          <Link
            href="/login?signup=true"
            id="cta-header-signup"
            className="text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] transition-all shadow-md shadow-primary/20 py-2 px-4 rounded-xl flex items-center gap-1.5"
          >
            Solicitar Acesso <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
