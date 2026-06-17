"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

interface FooterProps {
  version?: string;
}

const navLinks = [
  { href: "/", label: "Candidatos" },
  { href: "/jobs", label: "Vagas (Smart Match)" },
  { href: "/categories", label: "Categorias" },
];


const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Footer({ version = "0.1.0" }: FooterProps) {
  return (
    <footer className="relative mt-auto border-t border-border bg-background overflow-hidden">
      {/* Subtle gradient glow at top edge */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[80px] bg-primary/[0.04] blur-[60px] pointer-events-none" />

      {/* Main grid */}
      <motion.div
        className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
      >
        {/* ── Col 1: Brand ── */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm shadow-lg shadow-primary/25 flex-shrink-0">
              TF
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              TalentFlow
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
            Banco de Talentos com triagem inteligente de currículos via IA
            generativa.
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              v{version}
            </span>
          </div>
        </motion.div>

        {/* ── Col 2: Navigation ── */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Navegação
          </h3>
          <ul className="flex flex-col gap-2.5">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:translate-x-0.5 inline-flex items-center gap-1.5 group"
                >
                  <span className="w-1 h-1 rounded-full bg-primary/40 group-hover:bg-primary transition-colors duration-200 flex-shrink-0" />
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/docs"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:translate-x-0.5 inline-flex items-center gap-1.5 group"
              >
                <span className="w-1 h-1 rounded-full bg-primary/40 group-hover:bg-primary transition-colors duration-200 flex-shrink-0" />
                Documentação
              </Link>
            </li>
          </ul>
        </motion.div>

        {/* ── Col 3: Contato ── */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Contato
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Precisa de suporte ou quer falar com a equipe?
          </p>
          <a
            href="mailto:suporte@spacesquare.com.br"
            className="inline-flex items-center gap-2 px-4 py-2 mt-1 rounded-lg bg-muted/60 border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 w-fit"
          >
            <Mail className="w-4 h-4 text-primary/70" />
            suporte@spacesquare.com.br
          </a>
        </motion.div>
      </motion.div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-border/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TalentFlow. Todos os direitos
            reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Desenvolvido por{" "}
            <span className="text-foreground font-medium">Space Square</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
