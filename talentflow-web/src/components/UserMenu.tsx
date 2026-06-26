'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Shield, 
  LogOut, 
  ChevronDown, 
  KeyRound 
} from 'lucide-react';
import { getSession, clearSession } from '@/lib/auth';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    setUserName(session.name);
    setUserEmail(session.email);
    setUserRole(session.role);
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearSession();
    window.location.href = '/';
  };

  // Iniciais do Usuário
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Role Badge Styling
  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case 'SuperAdmin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/35 text-red-500">
            <Shield className="w-3 h-3" />
            Super Admin
          </span>
        );
      case 'Manager':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/35 text-purple-500">
            <Shield className="w-3 h-3" />
            Gerente
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/35 text-blue-500">
            <User className="w-3 h-3" />
            Recrutador
          </span>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão de Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-secondary/10 hover:bg-secondary/20 transition-all border border-border/10 cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md shadow-primary/10">
          {getInitials(userName)}
        </div>
        <span className="hidden sm:inline text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors max-w-[100px] truncate">
          {userName?.split(' ')[0] || 'Perfil'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2.5 w-64 bg-card/90 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl p-2.5 z-[100] origin-top-right"
          >
            {/* Header com dados do usuário */}
            <div className="p-3 border-b border-border/60 flex flex-col gap-1.5 mb-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-foreground truncate max-w-[140px]">
                  {userName || 'Carregando...'}
                </p>
                {getRoleBadge(userRole)}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{userEmail || '---'}</span>
              </div>
            </div>

            {/* Ações */}
            <div className="flex flex-col gap-1">

              <Link
                href="/change-password"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/15 transition-all"
              >
                <KeyRound className="w-4 h-4 text-amber-500" />
                Segurança & Senha
              </Link>

              <div className="border-t border-border/40 my-1.5" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-all text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sair da Conta
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
