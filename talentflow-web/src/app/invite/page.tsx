'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, UserPlus, Loader2, CheckCircle2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { getAuthHeaders, getSession, clearSession } from '@/lib/auth';
import Navbar from '@/components/Navbar';

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

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-6 py-16 flex flex-col justify-center">
        <div className="bg-card/65 backdrop-blur-xl border border-border/80 rounded-2xl p-8 shadow-2xl transition-all duration-300">
          
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
              {/* Header */}
              <div className="flex flex-col items-center mb-8 text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                  <UserPlus className="w-5.5 h-5.5" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight mb-1">Convidar Integrante</h1>
                <p className="text-sm text-muted-foreground">
                  Envie um convite exclusivo por e-mail para adicionar um novo membro à equipe do TalentFlow.
                </p>
              </div>

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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-primary text-primary-foreground font-semibold rounded-xl text-sm shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
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
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
