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
  KeyRound, 
  Send, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { getSession, clearSession, getAuthHeaders } from '@/lib/auth';
import Portal from '@/components/Portal';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Form State para alteração de senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    window.location.href = '/login';
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('A nova senha e a confirmação não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      setError('A nova senha deve conter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Erro ao alterar a senha.');
      }

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Fecha o modal após 2 segundos
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
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
              {(userRole === 'SuperAdmin' || userRole === 'Manager') && (
                <Link
                  href="/invite"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/15 transition-all"
                >
                  <Send className="w-4 h-4 text-primary" />
                  Convidar Colega
                </Link>
              )}

              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/15 transition-all text-left cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-amber-500" />
                Segurança & Senha
              </button>

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

      {/* Modal de Alteração de Senha */}
      <AnimatePresence>
        {isModalOpen && (
          <Portal lockScroll>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !loading && setIsModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />

              {/* Modal Content */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="bg-card border border-border/80 rounded-2xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden z-10"
              >
                {/* Glow decorativo */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">Alterar Senha</h3>
                      <p className="text-xs text-muted-foreground">Mantenha sua conta TalentFlow protegida</p>
                    </div>
                  </div>
                  <button
                    disabled={loading}
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 rounded-xl hover:bg-secondary/20 transition-all text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Feedbacks */}
                {error && (
                  <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium flex items-start gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Senha alterada com sucesso!</span>
                  </div>
                )}

                {/* Formulário */}
                <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                      Senha Atual
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={loading || success}
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary/15 border border-border/80 focus:border-primary/50 text-sm outline-none transition-all disabled:opacity-50"
                      placeholder="Digite sua senha atual"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading || success}
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary/15 border border-border/80 focus:border-primary/50 text-sm outline-none transition-all disabled:opacity-50"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading || success}
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary/15 border border-border/80 focus:border-primary/50 text-sm outline-none transition-all disabled:opacity-50"
                      placeholder="Repita a nova senha"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      disabled={loading || success}
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/10 transition-all cursor-pointer disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading || success}
                      className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-md shadow-primary/10 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        'Atualizar Senha'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
}
