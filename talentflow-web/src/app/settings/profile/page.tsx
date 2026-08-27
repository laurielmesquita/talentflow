'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { KeyRound, Mail, Phone, User } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import StatusMessage from '@/components/StatusMessage';
import { Input } from '@/components/ui/input';

type Profile = { email: string; full_name: string; phone: string | null };
const messageFor = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;

export default function SettingsProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void apiFetch<Profile>('/api/auth/me').then((data) => { setProfile(data); setFullName(data.full_name); setPhone(data.phone ?? ''); }).catch((reason: unknown) => setError(messageFor(reason, 'Não foi possível carregar seu perfil.'))).finally(() => setIsLoading(false));
  }, []);

  async function saveProfile(event: FormEvent) {
    event.preventDefault(); setIsSaving(true); setMessage(null); setError(null);
    try {
      const updated = await apiFetch<Profile>('/api/auth/me', { method: 'PATCH', body: JSON.stringify({ full_name: fullName, phone: phone || null }) });
      setProfile(updated); setFullName(updated.full_name); setPhone(updated.phone ?? ''); setMessage('Perfil atualizado com sucesso.');
    } catch (reason: unknown) { setError(messageFor(reason, 'Não foi possível salvar seu perfil.')); } finally { setIsSaving(false); }
  }

  async function requestEmailChange(event: FormEvent) {
    event.preventDefault(); setMessage(null); setError(null);
    try {
      await apiFetch('/api/auth/email-change/request', { method: 'POST', body: JSON.stringify({ current_password: currentPassword, new_email: newEmail }) });
      setNewEmail(''); setCurrentPassword(''); setMessage('Enviamos uma confirmação para o novo e-mail. O endereço atual só muda após essa confirmação.');
    } catch (reason: unknown) { setError(messageFor(reason, 'Não foi possível solicitar a alteração do e-mail.')); }
  }

  return <main className="max-w-2xl space-y-6"><section className="rounded-2xl border border-border bg-card p-6 shadow-sm"><div className="mb-6 flex gap-3"><User className="h-5 w-5 text-primary" aria-hidden="true" /><div><h1 className="font-semibold">Dados do perfil</h1><p className="mt-1 text-sm text-muted-foreground">Estas informações identificam você dentro da organização.</p></div></div>{error && <StatusMessage tone="error" className="mb-5">{error}</StatusMessage>}{message && <StatusMessage tone="success" className="mb-5">{message}</StatusMessage>}{isLoading ? <p className="text-sm text-muted-foreground">Carregando perfil…</p> : <form onSubmit={saveProfile} className="space-y-5"><label className="block text-sm font-medium" htmlFor="full-name">Nome completo<Input id="full-name" required minLength={2} value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-1.5" /></label><div className="text-sm font-medium">E-mail de acesso<div className="mt-1.5 flex h-10 items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 text-sm font-normal text-muted-foreground"><Mail className="h-4 w-4" />{profile?.email}</div></div><label className="block text-sm font-medium" htmlFor="phone">Telefone <span className="font-normal text-muted-foreground">(opcional)</span><div className="relative mt-1.5"><Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" /><Input id="phone" type="tel" maxLength={32} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+55 11 99999-9999" className="pl-10" /></div></label><button type="submit" disabled={isSaving} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">{isSaving ? 'Salvando…' : 'Salvar alterações'}</button></form>}</section><section className="rounded-2xl border border-border bg-card p-6 shadow-sm"><div className="mb-6 flex gap-3"><Mail className="h-5 w-5 text-primary" aria-hidden="true" /><div><h2 className="font-semibold">Alterar e-mail</h2><p className="mt-1 text-sm text-muted-foreground">Confirme sua senha atual para solicitar a alteração.</p></div></div><form onSubmit={requestEmailChange} className="space-y-4"><label className="block text-sm font-medium" htmlFor="new-email">Novo e-mail<Input id="new-email" required type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} className="mt-1.5" /></label><label className="block text-sm font-medium" htmlFor="email-password">Senha atual<div className="relative mt-1.5"><KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" /><Input id="email-password" required type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="pl-10" /></div></label><button type="submit" className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent">Enviar confirmação</button></form></section></main>;
}
