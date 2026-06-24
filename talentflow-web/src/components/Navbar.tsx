'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import UserMenu from '@/components/UserMenu';

export default function Navbar() {
  const pathname = usePathname();

  const isLinkActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  const getLinkClass = (path: string) => {
    const baseClass = "text-sm font-semibold transition-all duration-200 px-3 py-1.5 rounded-xl";
    return isLinkActive(path)
      ? `${baseClass} text-primary bg-primary/10 border border-primary/20 shadow-sm shadow-primary/5`
      : `${baseClass} text-muted-foreground hover:text-foreground hover:bg-secondary/10 border border-transparent`;
  };

  return (
    <header className="border-b border-border/80 bg-background/60 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
      <div className="flex items-center justify-between px-6 py-4.5 max-w-7xl mx-auto">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8.5 h-8.5 rounded-xl overflow-hidden group-hover:scale-105 transition-all flex-shrink-0">
            <Image
              src="/brand/logo-dark.webp"
              alt="TalentFlow Logo"
              fill
              sizes="34px"
              className="object-contain dark:hidden"
              priority
            />
            <Image
              src="/brand/logo-light.webp"
              alt="TalentFlow Logo"
              fill
              sizes="34px"
              className="object-contain hidden dark:block"
              priority
            />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            TalentFlow
          </h1>
        </Link>

        {/* Links Principais */}
        <nav className="hidden md:flex gap-2">
          <Link href="/dashboard" className={getLinkClass('/dashboard')}>
            Dashboard
          </Link>
          <Link href="/candidates" className={getLinkClass('/candidates')}>
            Candidatos
          </Link>
          <Link href="/jobs" className={getLinkClass('/jobs')}>
            Vagas
          </Link>
          <Link href="/smart-match" className={getLinkClass('/smart-match')}>
            Smart Match
          </Link>
          <Link href="/categories" className={getLinkClass('/categories')}>
            Categorias
          </Link>
        </nav>

        {/* Grupo de Ações */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {/* Menu do Usuário Dropdown */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
