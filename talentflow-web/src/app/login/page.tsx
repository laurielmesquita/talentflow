'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowLeft, User, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { setSession } from '@/lib/auth';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('signup') === 'true') {
      setIsSignUp(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      let res;
      if (isSignUp) {
        res = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email, 
            password, 
            company_name: companyName, 
            full_name: fullName 
          }),
        });
      } else {
        res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || (isSignUp ? 'Falha ao registrar conta.' : 'Falha ao autenticar. Verifique suas credenciais.'));
      }

      // Salva sessão nos cookies
      setSession(data.access_token, data.role, data.full_name, data.email);

      // Redireciona para a página interna
      router.push(redirect);
    } catch (err: any) {
      setError(err.message || 'Erro de conexão com o servidor.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background text-foreground font-sans relative overflow-hidden selection:bg-primary/30 select-none">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse duration-[6000ms]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse duration-[8000ms]" />

      {/* Header */}
      <header className="border-b border-border/40 bg-background/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
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
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              TalentFlow
            </span>
          </Link>

          <Link 
            href="/" 
            className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors py-2 px-3 rounded-lg border border-border bg-background/50"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para Home
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          layout
          transition={{ type: "spring", stiffness: 350, damping: 32 }}
          className="w-full max-w-md bg-card/65 backdrop-blur-xl border border-border/80 rounded-2xl p-8 shadow-2xl flex flex-col relative transition-all duration-300 animate-fade-in"
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden mb-3 flex-shrink-0">
              <Image
                src="/brand/logo-dark.webp"
                alt="TalentFlow Logo"
                fill
                sizes="40px"
                className="object-contain dark:hidden"
                priority
              />
              <Image
                src="/brand/logo-light.webp"
                alt="TalentFlow Logo"
                fill
                sizes="40px"
                className="object-contain hidden dark:block"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-1.5 text-center">
              {isSignUp ? 'Crie sua conta no TalentFlow' : 'Bem-vindo ao TalentFlow'}
            </h1>
            <p className="text-sm text-muted-foreground text-center">
              {isSignUp 
                ? 'Comece a triar candidatos com IA gratuitamente.' 
                : 'Insira suas credenciais para gerenciar a triagem de talentos.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="relative grid grid-cols-2 p-1 mb-6 bg-secondary/30 dark:bg-zinc-800/40 rounded-xl border border-border/40">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setIsSignUp(false);
                setError(null);
              }}
              className={`relative z-10 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 cursor-pointer ${
                !isSignUp
                  ? "text-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground disabled:opacity-50"
              }`}
            >
              {!isSignUp && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border/30 -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              Entrar
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setIsSignUp(true);
                setError(null);
              }}
              className={`relative z-10 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 cursor-pointer ${
                isSignUp
                  ? "text-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground disabled:opacity-50"
              }`}
            >
              {isSignUp && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border/30 -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              Criar Conta
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-shake">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <AnimatePresence initial={false}>
              {isSignUp && (
                <motion.div
                  key="signup-fields"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ 
                    opacity: 1, 
                    height: "auto", 
                    marginTop: 0,
                    transition: {
                      height: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2, delay: 0.05 }
                    }
                  }}
                  exit={{ 
                    opacity: 0, 
                    height: 0, 
                    marginTop: 0,
                    transition: {
                      height: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.15 }
                    }
                  }}
                  className="overflow-hidden flex flex-col gap-5"
                >
                  {/* Nome Completo */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground/80" htmlFor="fullName">
                      Nome completo
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-muted-foreground">
                        <User className="w-4.5 h-4.5" />
                      </span>
                      <input
                        id="fullName"
                        type="text"
                        required={isSignUp}
                        disabled={loading}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Seu nome completo"
                        className="w-full pl-11 pr-4 py-3 bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Nome da Empresa */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground/80" htmlFor="companyName">
                      Nome da empresa
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-muted-foreground">
                        <Building className="w-4.5 h-4.5" />
                      </span>
                      <input
                        id="companyName"
                        type="text"
                        required={isSignUp}
                        disabled={loading}
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Nome da sua empresa ou time"
                        className="w-full pl-11 pr-4 py-3 bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* E-mail corporativo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground/80" htmlFor="email">
                E-mail corporativo
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
                  placeholder="nome@empresa.com"
                  className="w-full pl-11 pr-4 py-3 bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-foreground/80" htmlFor="password">
                  Senha de acesso
                </label>
                {!isSignUp && (
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline transition-all"
                  >
                    Esqueceu a senha?
                  </Link>
                )}
              </div>
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
                  placeholder="Sua senha secreta"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-primary text-primary-foreground font-semibold rounded-xl text-sm shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  {isSignUp ? 'Criando Conta...' : 'Autenticando...'}
                </>
              ) : (
                isSignUp ? 'Criar Conta & Acessar' : 'Entrar no Painel'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
