'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import { clearSession } from '@/lib/auth';

export default function LogoutButton() {
  const handleLogout = () => {
    clearSession();
    // Redireciona com recarga para limpar caches locais
    window.location.href = '/login';
  };

  return (
    <button
      onClick={handleLogout}
      title="Sair da conta"
      className="p-2 rounded-xl bg-secondary/10 text-muted-foreground hover:text-foreground hover:bg-secondary/20 transition-all border border-border/10 cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold"
    >
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:inline">Sair</span>
    </button>
  );
}
