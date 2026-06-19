'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, User, Eye, EyeOff, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { setSession } from '@/lib/auth';

export default function InviteAcceptPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(true);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Token de convite ausente no endereço. Peça um novo convite.');
      setVerifying(false);
      return;
    }

    const verifyToken = async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      try {
        const res = await fetch(`${API_URL}/api/auth/invite/verify?token=${token}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.detail || 'Convite inválido, expirado ou já utilizado.');
        }

        setEmail(data.email);
        setRole(data.role);
      } catch (err: any) {
        setError(err.message || 'Erro ao validar convite.');
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve conter no mínimo 8 caracteres.');
      return;
    }

    setLoading(true);
    setError(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      const res = await fetch(`${API_URL}/api/auth/invite/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, full_name: fullName, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Erro ao cadastrar conta.');
      }

      // Salva sessão nos cookies
      setSession(data.access_token, data.role, data.full_name, data.email);

      // Redireciona com recarga de página para limpar caches do Next.js
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Erro de conexão.');
      setLoading(false);
    }
  };

  const getRoleLabel = (roleName: string) => {
    const roles: Record<string, string> = {
      SuperAdmin: 'Super Administrador',
      Manager: 'Gerente de Recrutamento',
      Recruiter: 'Recrutador',
    };
    return roles[roleName] || roleName;
  };

  return (
    <div className="flex-1 w-full bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse duration-[6000ms]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse duration-[8000ms]" />

      <div className="w-full max-w-md bg-card/65 backdrop-blur-xl border border-border/80 rounded-2xl p-8 shadow-2xl flex flex-col relative transition-all duration-300">
        
        {verifying ? (
          <div className="flex flex-col items-center py-12 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Verificando validade do convite...</p>
          </div>
        ) : error && !email ? (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-2">Convite Inválido</h2>
            <p className="text-sm text-muted-foreground mb-6">{error}</p>
            <Link
              href="/login"
              className="w-full py-3 bg-secondary text-secondary-foreground font-semibold rounded-xl text-sm hover:bg-secondary/90 transition-all duration-200 text-center"
            >
              Voltar para o Login
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-3">
                <ShieldCheck className="w-5.5 h-5.5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight mb-1">Completar Cadastro</h1>
              <p className="text-sm text-muted-foreground text-center">
                Configure seu nome e senha para ativar seu perfil no TalentFlow.
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
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* Email (Disabled) */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">
                  E-mail de cadastro
                </span>
                <div className="px-4 py-3 bg-muted/40 border border-border rounded-xl text-sm text-muted-foreground select-text overflow-hidden text-ellipsis whitespace-nowrap">
                  {email}
                </div>
              </div>

              {/* Cargo (Disabled) */}
              <div className="flex flex-col gap-1 mb-2">
                <span className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">
                  Cargo designado
                </span>
                <div className="inline-flex self-start px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                  {getRoleLabel(role)}
                </div>
              </div>

              {/* Nome Completo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground/80" htmlFor="fullName">
                  Nome Completo
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-muted-foreground">
                    <User className="w-4.5 h-4.5" />
                  </span>
                  <input
                    id="fullName"
                    type="text"
                    required
                    disabled={loading}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full pl-11 pr-4 py-3 bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground/80" htmlFor="password">
                  Definir Senha
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-muted-foreground">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo de 8 caracteres"
                    className="w-full pl-11 pr-11 py-3 bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground/80" htmlFor="confirmPassword">
                  Confirmar Senha
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-muted-foreground">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={loading}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita sua senha exatamente"
                    className="w-full pl-11 pr-4 py-3 bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 bg-primary text-primary-foreground font-semibold rounded-xl text-sm shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    Ativando conta...
                  </>
                ) : (
                  'Ativar Minha Conta'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
