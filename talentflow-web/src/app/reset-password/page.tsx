'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Token de redefinição ausente. Utilize o link enviado por e-mail.');
    }
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
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Erro ao redefinir a senha.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse duration-[6000ms]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse duration-[8000ms]" />

      <div className="w-full max-w-md bg-card/65 backdrop-blur-xl border border-border/80 rounded-2xl p-8 shadow-2xl flex flex-col relative transition-all duration-300">
        
        {success ? (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-2">Senha Alterada!</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Sua nova senha de acesso foi salva com sucesso. Você já pode fazer login na plataforma.
            </p>
            <Link
              href="/login"
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl text-sm shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all duration-200 text-center"
            >
              Fazer Login
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <h1 className="text-2xl font-bold tracking-tight mb-1.5">Redefinir Senha</h1>
              <p className="text-sm text-muted-foreground text-center">
                Insira sua nova senha secreta abaixo para restabelecer o acesso à sua conta.
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
            {token && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground/80" htmlFor="password">
                    Nova Senha
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
                  className="w-full mt-2 py-3 bg-primary text-primary-foreground font-semibold rounded-xl text-sm shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      Salvando senha...
                    </>
                  ) : (
                    'Salvar Nova Senha'
                  )}
                </button>
              </form>
            )}

            {!token && (
              <Link
                href="/login"
                className="w-full py-3 bg-secondary text-secondary-foreground font-semibold rounded-xl text-sm hover:bg-secondary/90 transition-all duration-200 text-center"
              >
                Voltar para o Login
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
