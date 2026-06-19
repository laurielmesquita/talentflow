'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import UserMenu from '@/components/UserMenu';

interface NavbarProps {
  children?: React.ReactNode;
}

export default function Navbar({ children }: NavbarProps) {
  const pathname = usePathname();

  const isLinkActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
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
          <div className="w-8.5 h-8.5 rounded-xl bg-primary flex items-center justify-center font-bold text-primary-foreground shadow-lg shadow-primary/25 group-hover:scale-105 transition-all">
            TF
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            TalentFlow
          </h1>
        </Link>

        {/* Links Principais */}
        <nav className="hidden md:flex gap-2">
          <Link href="/" className={getLinkClass('/')}>
            Dashboard
          </Link>
          <Link href="/candidates" className={getLinkClass('/candidates')}>
            Candidatos
          </Link>
          <Link href="/jobs" className={getLinkClass('/jobs')}>
            Vagas (Smart Match)
          </Link>
          <Link href="/categories" className={getLinkClass('/categories')}>
            Categorias
          </Link>
        </nav>

        {/* Grupo de Ações */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {/* Botões Dinâmicos da Página */}
          {children && (
            <div className="flex items-center">
              {children}
            </div>
          )}
          
          {/* Menu do Usuário Dropdown */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
