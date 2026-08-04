'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import UserMenu from '@/components/UserMenu';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/candidates', label: 'Candidatos' },
  { href: '/jobs', label: 'Vagas' },
  { href: '/smart-match', label: 'Smart Match' },
  { href: '/categories', label: 'Categorias' },
] as const;

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) =>
    path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl transition-colors duration-300">
      {/* Linha de acento superior */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="flex items-center justify-between px-6 h-14 max-w-7xl mx-auto">

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

        {/* ── Navegação Principal ── */}
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

        {/* ── Ações ── */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
