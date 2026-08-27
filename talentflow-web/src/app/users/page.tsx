'use client';

import { FormEvent, useEffect, useState } from 'react';
import { UserPlus, Pencil, UserX, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { getSession } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import StatusMessage from '@/components/StatusMessage';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type UserRole = 'Manager' | 'Recruiter' | 'SuperAdmin';

interface ManagedUser {
  id: string;
  email: string;
  phone: string | null;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string | null;
}

const emptyForm = { full_name: '', email: '', phone: '', password: '', role: 'Recruiter' as UserRole };

export default function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userToDeactivate, setUserToDeactivate] = useState<ManagedUser | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      setUsers(await apiFetch<ManagedUser[]>('/api/users'));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar os usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { queueMicrotask(() => { void loadUsers(); }); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      if (editing) {
        const body: Record<string, string> = {
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          role: form.role,
        };
        if (form.password) body.password = form.password;
        await apiFetch(`/api/users/${editing.id}`, { method: 'PATCH', body: JSON.stringify(body) });
        setSuccess('Usuário atualizado com sucesso.');
      } else {
        await apiFetch('/api/users', { method: 'POST', body: JSON.stringify(form) });
        setSuccess('Usuário criado com sucesso.');
      }
      resetForm();
      await loadUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar o usuário.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!userToDeactivate) return;
    setError(null);
    setSuccess(null);
    try {
      await apiFetch(`/api/users/${userToDeactivate.id}`, { method: 'DELETE' });
      setSuccess('Acesso do usuário desativado.');
      setUserToDeactivate(null);
      await loadUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Não foi possível desativar o usuário.');
    }
  };

  const session = getSession();
  if (session.role !== 'Manager' && session.role !== 'SuperAdmin') {
    return (
      <AppShell title="Usuários da organização" subtitle="Gerencie os acessos administrativos da sua empresa.">
        <main className="mx-auto w-full max-w-6xl px-6 py-10">
          <StatusMessage tone="info">Acesso restrito aos administradores da organização.</StatusMessage>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell title="Usuários da organização" subtitle="Gerencie quem pode acessar o TalentFlow. Desativar um usuário não remove os dados da empresa.">
      <main className="mx-auto w-full max-w-6xl px-6 py-10">

        {error && <StatusMessage tone="error" className="mb-5">{error}</StatusMessage>}
        {success && <StatusMessage tone="success" className="mb-5">{success}</StatusMessage>}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-2xl border border-border/80 bg-card/40 p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Membros</h2>
            {loading ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Carregando...</div> : (
              <div className="divide-y divide-border/60">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{user.full_name}</p>
                      <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                      {user.phone && <p className="truncate text-xs text-muted-foreground">{user.phone}</p>}
                      <span className={`mt-1 inline-block text-xs ${user.is_active ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {user.is_active ? 'Ativo' : 'Desativado'} · {user.role === 'Manager' ? 'Gerente' : user.role === 'SuperAdmin' ? 'Super Admin' : 'Recrutador'}
                      </span>
                    </div>
                    {user.is_active && <div className="flex shrink-0 gap-1">
                      <button aria-label={`Editar ${user.full_name}`} onClick={() => { setEditing(user); setForm({ full_name: user.full_name, email: user.email, phone: user.phone || '', password: '', role: user.role }); }} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"><Pencil className="w-4 h-4" /></button>
                      <button aria-label={`Desativar ${user.full_name}`} onClick={() => setUserToDeactivate(user)} className="rounded-lg p-2 text-destructive/80 hover:bg-destructive/10 hover:text-destructive"><UserX className="w-4 h-4" /></button>
                    </div>}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border/80 bg-card/40 p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">{editing ? <Pencil className="w-5 h-5 text-primary" /> : <UserPlus className="w-5 h-5 text-primary" />}{editing ? 'Editar usuário' : 'Novo usuário'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input required minLength={2} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Nome completo" />
              <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="E-mail corporativo" />
              <Input type="tel" maxLength={32} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Telefone (opcional)" />
              <Input required={!editing} minLength={8} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editing ? 'Nova senha (opcional)' : 'Senha (mínimo 8 caracteres)'} />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
                <option value="Recruiter">Recrutador</option>
                <option value="Manager">Gerente</option>
                {session.role === 'SuperAdmin' && <option value="SuperAdmin">Super Admin</option>}
              </select>
              <div className="flex gap-2">
                <button disabled={saving} type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">{saving && <Loader2 className="w-4 h-4 animate-spin" />}{editing ? 'Salvar alterações' : 'Criar usuário'}</button>
                {editing && <button type="button" onClick={resetForm} className="rounded-xl border border-border px-4 py-2 text-sm">Cancelar</button>}
              </div>
            </form>
          </section>
        </div>
        <Dialog isOpen={Boolean(userToDeactivate)} onClose={() => setUserToDeactivate(null)} ariaLabel="Confirmar desativação de usuário">
          <div className="space-y-4"><div className="flex items-center gap-3 text-destructive"><UserX className="h-6 w-6" /><h2 className="text-lg font-semibold">Desativar acesso</h2></div><p className="text-sm text-muted-foreground">Deseja desativar o acesso de <strong className="text-foreground">{userToDeactivate?.full_name}</strong>? Os dados da organização serão preservados.</p><div className="flex justify-end gap-3"><button type="button" onClick={() => setUserToDeactivate(null)} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-accent">Cancelar</button><button type="button" onClick={() => void handleDeactivate()} className="rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-primary-foreground">Desativar acesso</button></div></div>
        </Dialog>
      </main>
    </AppShell>
  );
}
