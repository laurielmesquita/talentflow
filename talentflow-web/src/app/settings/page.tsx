'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Mail, Phone, Settings, User } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import UserMenu from '@/components/UserMenu';
import { clearSession } from '@/lib/auth';

type Profile = {
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  timezone: string;
  email_notifications: boolean;
  theme: 'system' | 'light' | 'dark';
};

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [theme, setTheme] = useState<Profile['theme']>('system');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    void apiFetch<Profile>('/api/auth/me')
      .then((data) => {
        setProfile(data);
        setFullName(data.full_name);
        setPhone(data.phone || '');
        setTimezone(data.timezone);
        setEmailNotifications(data.email_notifications);
        setTheme(data.theme);
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
        body: JSON.stringify({ full_name: fullName, phone: phone || null, timezone, email_notifications: emailNotifications, theme }),
      });
      setProfile(updated);
      setFullName(updated.full_name);
      setPhone(updated.phone || '');
      setTimezone(updated.timezone);
      setEmailNotifications(updated.email_notifications);
      setTheme(updated.theme);
      setMessage('Perfil atualizado com sucesso.');
    } catch (err: unknown) {
      setError(errorMessage(err, 'Não foi possível salvar seu perfil.'));
    } finally {
      setSaving(false);
    }
  };

  const handleEmailChange = async (event: FormEvent) => {
    event.preventDefault();
    setEmailMessage(null);
    setError(null);
    try {
      await apiFetch('/api/auth/email-change/request', {
        method: 'POST',
        body: JSON.stringify({ current_password: currentPassword, new_email: newEmail }),
      });
      setEmailMessage('Enviamos um link de confirmação para o novo e-mail.');
      setNewEmail('');
      setCurrentPassword('');
    } catch (err: unknown) {
      setError(errorMessage(err, 'Não foi possível solicitar a alteração do e-mail.'));
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      const data = await apiFetch<Record<string, unknown>>('/api/auth/me/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'talentflow-meus-dados.json';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(errorMessage(err, 'Não foi possível exportar seus dados.'));
    } finally {
      setExporting(false);
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
            <div className="rounded-xl px-3 py-2 text-sm text-muted-foreground">Preferências</div>
            <div className="rounded-xl px-3 py-2 text-sm text-muted-foreground">Privacidade e dados</div>
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
                <div className="block text-sm font-medium">E-mail de acesso<div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-muted-foreground"><Mail className="h-4 w-4" />{profile.email}</div></div>
                <label className="block text-sm font-medium">Telefone<span className="ml-1 text-xs font-normal text-muted-foreground">(opcional)</span><div className="relative mt-1.5"><Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={32} placeholder="+55 11 99999-9999" className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3" /></div></label>
                <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium">Fuso horário<select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5"><option value="America/Sao_Paulo">Brasília (UTC−03:00)</option><option value="America/Manaus">Manaus (UTC−04:00)</option><option value="America/Rio_Branco">Rio Branco (UTC−05:00)</option></select></label><label className="block text-sm font-medium">Tema<select value={theme} onChange={(e) => setTheme(e.target.value as Profile['theme'])} className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5"><option value="system">Automático</option><option value="light">Claro</option><option value="dark">Escuro</option></select></label></div>
                <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} className="h-4 w-4 rounded border-border text-primary" />Receber notificações operacionais por e-mail</label>
                <button disabled={saving} type="submit" className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Salvar alterações</button>
              </form>
            )}
            {!loading && profile && <form onSubmit={handleEmailChange} className="mt-8 space-y-4 border-t border-border/60 pt-6">
              <div><h3 className="flex items-center gap-2 font-semibold"><Mail className="h-4 w-4 text-primary" />Alterar e-mail</h3><p className="mt-1 text-sm text-muted-foreground">O endereço atual só muda depois da confirmação enviada ao novo endereço.</p></div>
              {emailMessage && <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" />{emailMessage}</div>}
              <input required type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Novo e-mail" className="w-full rounded-xl border border-border bg-background px-3 py-2.5" />
              <div className="relative"><KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><input required type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Senha atual" className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3" /></div>
              <button type="submit" className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent">Enviar confirmação</button>
            </form>}
            {!loading && profile && <section className="mt-8 border-t border-border/60 pt-6"><h3 className="font-semibold">Privacidade e dados</h3><p className="mt-1 text-sm text-muted-foreground">Baixe uma cópia dos dados pessoais associados ao seu acesso.</p><button type="button" onClick={() => void handleExport()} disabled={exporting} className="mt-4 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent disabled:opacity-60">{exporting ? 'Preparando exportação...' : 'Exportar meus dados'}</button></section>}
          </section>
        </div>
      </div>
    </main>
  );
}
