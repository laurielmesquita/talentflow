'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AlertTriangle, Building2, CheckCircle2, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import { ApiError, apiFetch } from '@/lib/api';
import { getSession } from '@/lib/auth';

type ClosureStatus = 'active' | 'pending' | 'completed';

interface ClosureState {
  status: ClosureStatus;
  is_owner: boolean;
  requested_at?: string | null;
  scheduled_for?: string | null;
}

interface ManagedUser {
  id: string;
  email: string;
  full_name: string;
  role: 'Manager' | 'Recruiter' | 'SuperAdmin';
  is_active: boolean;
}

const CONFIRMATION = 'ENCERRAR ORGANIZAÇÃO';

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value));
}

export default function OrganizationPage() {
  const [closure, setClosure] = useState<ClosureState | null>(null);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [managers, setManagers] = useState<ManagedUser[]>([]);
  const [targetUserId, setTargetUserId] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');

  const loadClosure = async () => {
    setLoading(true);
    try {
      const state = await apiFetch<ClosureState>('/api/tenant/closure');
      setClosure(state);
      if (state.is_owner) {
        const users = await apiFetch<ManagedUser[]>('/api/users');
        const currentEmail = getSession().email;
        setManagers(users.filter((user) => user.is_active && user.role !== 'Recruiter' && user.email !== currentEmail));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível carregar a organização.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadClosure(); }, []);

  const handleTransfer = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const result = await apiFetch<{ owner_name: string }>('/api/tenant/owner', {
        method: 'POST',
        body: JSON.stringify({ target_user_id: targetUserId, current_password: ownerPassword }),
      });
      setOwnerPassword('');
      setTargetUserId('');
      setSuccess(`Titularidade transferida para ${result.owner_name}.`);
      await loadClosure();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível transferir a titularidade.');
    } finally {
      setSaving(false);
    }
  };

  const handleRequest = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const result = await apiFetch<ClosureState>('/api/tenant/closure', {
        method: 'POST',
        body: JSON.stringify({ current_password: password, confirmation }),
      });
      setClosure(result);
      setPassword('');
      setConfirmation('');
      setSuccess('Encerramento agendado. A organização permanecerá disponível durante 30 dias.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível agendar o encerramento.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      setClosure(await apiFetch<ClosureState>('/api/tenant/closure', { method: 'DELETE' }));
      setSuccess('Encerramento cancelado. Os dados da organização foram preservados.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível cancelar o encerramento.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="min-h-screen p-8 text-muted-foreground">Carregando organização...</main>;

  if (!closure?.is_owner) {
    return <main className="min-h-screen bg-background px-6 py-10 text-foreground"><div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card/40 p-8"><ShieldCheck className="mb-4 h-8 w-8 text-primary" /><h1 className="text-2xl font-bold">Organização</h1><p className="mt-2 text-muted-foreground">O acompanhamento e encerramento da organização estão disponíveis somente para o Owner.</p></div></main>;
  }

  const pending = closure.status === 'pending';
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3"><Building2 className="h-7 w-7 text-primary" /><div><h1 className="text-3xl font-bold tracking-tight">Organização</h1><p className="text-muted-foreground">Gerencie o ciclo de vida e os dados da sua organização.</p></div></div>
        {error && <div role="alert" className="mb-5 flex gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"><AlertTriangle className="h-5 w-5 shrink-0" />{error}</div>}
        {success && <div role="status" className="mb-5 flex gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-600"><CheckCircle2 className="h-5 w-5 shrink-0" />{success}</div>}
        <section className="mb-6 rounded-2xl border border-border/80 bg-card/40 p-6 shadow-sm"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 text-primary" /><div><h2 className="text-lg font-semibold">Titularidade</h2><p className="mt-1 text-sm text-muted-foreground">Transfira o controle da organização para outro Manager ou Super Admin ativo.</p></div></div><form onSubmit={handleTransfer} className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]"><select required value={targetUserId} onChange={(event) => setTargetUserId(event.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm"><option value="">Selecione o novo Owner</option>{managers.map((user) => <option key={user.id} value={user.id}>{user.full_name} · {user.role === 'Manager' ? 'Gerente' : 'Super Admin'}</option>)}</select><input required type="password" value={ownerPassword} onChange={(event) => setOwnerPassword(event.target.value)} placeholder="Sua senha atual" className="rounded-xl border border-border bg-background px-3 py-2 text-sm" /><button disabled={saving || !managers.length} type="submit" className="rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary/30 disabled:opacity-60">Transferir</button></form>{!managers.length && <p className="mt-3 text-xs text-muted-foreground">Crie um Manager ou Super Admin ativo antes de transferir.</p>}</section>
        <section className="rounded-2xl border border-border/80 bg-card/40 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold">Encerramento da organização</h2><p className="mt-1 text-sm text-muted-foreground">A exclusão é permanente e só ocorre após uma carência de 30 dias.</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${pending ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>{pending ? 'Pendente' : 'Ativa'}</span></div>
          {pending ? <div className="mt-6 space-y-4"><div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm"><p className="font-semibold text-amber-700">Encerramento agendado</p><p className="mt-1 text-amber-700/80">Solicitado em {formatDate(closure.requested_at)}. A purga está prevista para {formatDate(closure.scheduled_for)}.</p></div><button type="button" onClick={() => void handleCancel()} disabled={saving} className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary/30 disabled:opacity-60"><XCircle className="h-4 w-4" />{saving ? 'Cancelando...' : 'Cancelar encerramento'}</button></div> : <form onSubmit={handleRequest} className="mt-6 space-y-4"><div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground"><p className="font-semibold text-destructive">Atenção: ação irreversível</p><p className="mt-1">Ao final da carência, usuários, candidatos, vagas, candidaturas, auditorias e arquivos associados serão removidos.</p></div><label className="block text-sm font-medium">Senha atual<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2" /></label><label className="block text-sm font-medium">Digite <code>{CONFIRMATION}</code> para confirmar<input required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2" /></label><button disabled={saving || confirmation !== CONFIRMATION} type="submit" className="flex items-center gap-2 rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground disabled:opacity-60"><AlertTriangle className="h-4 w-4" />{saving ? <><Loader2 className="h-4 w-4 animate-spin" />Agendando...</> : 'Agendar encerramento'}</button></form>}
        </section>
      </div>
    </main>
  );
}
