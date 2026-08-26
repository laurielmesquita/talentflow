'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2, Mail, Phone, Settings, User } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import UserMenu from '@/components/UserMenu';

type Profile = {
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
};

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void apiFetch<Profile>('/api/auth/me')
      .then((data) => {
        setProfile(data);
        setFullName(data.full_name);
        setPhone(data.phone || '');
      })
      .catch((err: unknown) => setError(errorMessage(err, 'Não foi possível carregar seu perfil.')))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await apiFetch<Profile>('/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ full_name: fullName, phone: phone || null }),
      });
      setProfile(updated);
      setFullName(updated.full_name);
      setPhone(updated.phone || '');
      setMessage('Perfil atualizado com sucesso.');
    } catch (err: unknown) {
      setError(errorMessage(err, 'Não foi possível salvar seu perfil.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Voltar ao dashboard
          </Link>
          <UserMenu />
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <Settings className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
            <p className="text-sm text-muted-foreground">Gerencie sua conta e as preferências do TalentFlow.</p>
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav className="space-y-1" aria-label="Seções de configurações">
            <div className="rounded-xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">Meu perfil</div>
            <Link href="/change-password" className="block rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">Segurança</Link>
            <div className="rounded-xl px-3 py-2 text-sm text-muted-foreground/60">Preferências (em breve)</div>
            <div className="rounded-xl px-3 py-2 text-sm text-muted-foreground/60">Privacidade e dados (em breve)</div>
          </nav>
          <section className="max-w-2xl rounded-2xl border border-border/80 bg-card/40 p-6 shadow-sm">
            <h2 className="mb-1 flex items-center gap-2 text-xl font-semibold"><User className="h-5 w-5 text-primary" /> Dados do perfil</h2>
            <p className="mb-6 text-sm text-muted-foreground">Essas informações identificam você dentro da organização.</p>
            {loading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Carregando...</div>}
            {!loading && profile && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {message && <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" />{message}</div>}
                {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                <label className="block text-sm font-medium">Nome completo<input required minLength={2} value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5" /></label>
                <label className="block text-sm font-medium">E-mail de acesso<div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-muted-foreground"><Mail className="h-4 w-4" />{profile.email}<span className="ml-auto text-xs">Troca segura em breve</span></div></label>
                <label className="block text-sm font-medium">Telefone<span className="ml-1 text-xs font-normal text-muted-foreground">(opcional)</span><div className="relative mt-1.5"><Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={32} placeholder="+55 11 99999-9999" className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3" /></div></label>
                <button disabled={saving} type="submit" className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Salvar alterações</button>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
