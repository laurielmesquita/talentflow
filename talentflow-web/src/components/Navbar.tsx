'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  Sparkles, 
  Layers, 
  Menu, 
  X 
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import UserMenu from '@/components/UserMenu';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/candidates', label: 'Candidatos', icon: Users },
  { href: '/jobs', label: 'Vagas', icon: Target },
  { href: '/smart-match', label: 'Smart Match', icon: Sparkles },
  { href: '/categories', label: 'Categorias', icon: Layers },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fechar menu mobile ao navegar
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Travar o scroll do body quando o menu estiver aberto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isActive = (path: string) =>
    path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl transition-colors duration-300">
      {/* Linha de acento superior */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="flex items-center justify-between px-4 sm:px-6 h-14 max-w-7xl mx-auto">

        {/* ── Logo / Brand ── */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative w-7 h-7 rounded-[6px] overflow-hidden group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
            <Image
              src="/brand/logo-dark.webp"
              alt="TalentFlow Logo"
              fill
              sizes="28px"
              className="object-contain dark:hidden"
              priority
            />
            <Image
              src="/brand/logo-light.webp"
              alt="TalentFlow Logo"
              fill
              sizes="28px"
              className="object-contain hidden dark:block"
              priority
            />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-foreground leading-none">
            TalentFlow
          </span>
        </Link>

        {/* ── Navegação Principal Desktop ── */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'relative px-3 py-1.5 text-[13px] font-medium rounded-md transition-all duration-150',
                  active
                    ? 'text-primary bg-primary/8'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/60',
                ].join(' ')}
              >
                {label}
                {/* Indicador ativo — barra inferior */}
                {active && (
                  <span className="absolute bottom-0 inset-x-3 h-[2px] rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Ações & Botão Hambúrguer Mobile ── */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />

          {/* Botão Hambúrguer (Mobile) */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu de navegação'}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* ── Menu Drawer Mobile (AnimatePresence) ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop escurecido com blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 top-14 bg-black/40 backdrop-blur-xs z-40 md:hidden"
            />

            {/* Slide Down Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-full inset-x-0 bg-background/95 backdrop-blur-2xl border-b border-border/80 shadow-2xl z-50 md:hidden overflow-hidden"
            >
              <nav className="p-4 space-y-1.5 max-w-7xl mx-auto">
                <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">
                  Navegação do Sistema
                </p>
                {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={[
                        'flex items-center gap-3 px-3.5 py-2.5 text-[14px] font-medium rounded-xl transition-all duration-150',
                        active
                          ? 'text-primary bg-primary/10 font-semibold border border-primary/20 shadow-xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/60',
                      ].join(' ')}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-muted-foreground/70'}`} />
                      <span>{label}</span>
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
