'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, UserPlus, Loader2, CheckCircle2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { getAuthHeaders, getSession, clearSession } from '@/lib/auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import UserMenu from '@/components/UserMenu';

export default function InvitePage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Recruiter');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    setCurrentUserRole(session.role);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      const res = await fetch(`${API_URL}/api/auth/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ email, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          clearSession();
          window.location.href = '/login';
          return;
        }
        throw new Error(data.detail || 'Erro ao processar convite.');
      }

      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Erro de conexão.');
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

      {/* Main Content (max-w-4xl) */}
      <main className="max-w-4xl mx-auto px-6 py-8 md:py-12 w-full">
        {/* Section Tag */}
        <div className="flex items-center gap-3 mb-6 text-primary">
          <UserPlus className="w-6 h-6" />
          <span className="text-sm font-bold tracking-wider uppercase">Membros da Equipe</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-center gap-3">
          <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center justify-center">
            <ArrowLeft className="w-8 h-8 md:w-10 md:h-10" />
          </Link>
          Convidar Integrante
        </h1>

        {/* Subtext */}
        <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
          Envie um convite exclusivo por e-mail para adicionar um novo membro à equipe do TalentFlow.
        </p>

        {/* Form Card Box */}
        <div className="max-w-2xl mt-10">
          <div className="bg-card/40 backdrop-blur-md border border-border/80 rounded-2xl p-8 shadow-sm relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
            
            {success ? (
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold tracking-tight mb-2">Convite Enviado!</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  O convite foi enviado por e-mail com sucesso. O novo integrante poderá completar o cadastro e acessar a plataforma.
                </p>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl text-sm shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all duration-200"
                >
                  Convidar Outra Pessoa
                </button>
              </div>
            ) : (
              <>
                {/* Error Alert */}
                {error && (
                  <div className="mb-6 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  
                  {/* E-mail */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground/80" htmlFor="email">
                      E-mail do convidado
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-muted-foreground">
                        <Mail className="w-4.5 h-4.5" />
                      </span>
                      <input
                        id="email"
                        type="email"
                        required
                        disabled={loading}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@empresa.com"
                        className="w-full pl-11 pr-4 py-3 bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Cargo */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground/80" htmlFor="role">
                      Nível de Acesso (Cargo)
                    </label>
                    <select
                      id="role"
                      disabled={loading}
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50"
                    >
                      <option value="Recruiter">Recrutador (Recruiter)</option>
                      {currentUserRole === 'SuperAdmin' && (
                        <option value="Manager">Gerente (Manager)</option>
                      )}
                    </select>
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <Link
                      href="/dashboard"
                      className="px-5 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/20 transition-all text-center flex items-center justify-center"
                    >
                      Cancelar
                    </Link>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                          Enviando convite...
                        </>
                      ) : (
                        'Enviar Convite'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
