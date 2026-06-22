'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, KeyRound, Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { getAuthHeaders, clearSession } from '@/lib/auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import UserMenu from '@/components/UserMenu';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          clearSession();
          window.location.href = '/login';
          return;
        }
        throw new Error(data.detail || 'Erro ao alterar a senha.');
      }

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-300 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Simplified Header */}
      <header className="border-b border-border/40 bg-background/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-8.5 h-8.5 rounded-xl bg-primary flex items-center justify-center font-bold text-primary-foreground shadow-lg shadow-primary/25 group-hover:scale-105 transition-all">
              TF
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              TalentFlow
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 md:py-12 w-full">
        {/* Section Tag */}
        <div className="flex items-center gap-3 mb-6 text-amber-500">
          <KeyRound className="w-6 h-6" />
          <span className="text-sm font-bold tracking-wider uppercase">Segurança da Conta</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-center gap-3">
          <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center justify-center">
            <ArrowLeft className="w-8 h-8 md:w-10 md:h-10" />
          </Link>
          Alterar Senha
        </h1>

        {/* Subtext */}
        <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
          Escolha uma senha forte de no mínimo 6 caracteres e não a reutilize em outras contas corporativas.
        </p>

        {/* Form Card Box */}
        <div className="max-w-2xl mt-10">
          <div className="bg-card/40 backdrop-blur-md border border-border/80 rounded-2xl p-8 shadow-sm relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Error Feedbacks */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Feedbacks */}
            {success && (
              <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-medium flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Sua senha foi alterada com sucesso!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Senha Atual */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground/80" htmlFor="currentPassword">
                  Senha Atual
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-muted-foreground">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    id="currentPassword"
                    type="password"
                    required
                    disabled={loading || success}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                    className="w-full pl-11 pr-4 py-3 bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Nova Senha */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground/80" htmlFor="newPassword">
                  Nova Senha
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-muted-foreground">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    disabled={loading || success}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                    className="w-full pl-11 pr-4 py-3 bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Confirmar Nova Senha */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground/80" htmlFor="confirmPassword">
                  Confirmar Nova Senha
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-muted-foreground">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    disabled={loading || success}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full pl-11 pr-4 py-3 bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Ações */}
              <div className="pt-2 flex justify-end gap-3">
                <Link
                  href="/dashboard"
                  className="px-5 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/20 transition-all text-center flex items-center justify-center"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={loading || success}
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Alterar Senha'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
