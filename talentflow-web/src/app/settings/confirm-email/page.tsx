'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { clearSession } from '@/lib/auth';

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error');

  useEffect(() => {
    if (!token) return;
    void apiFetch('/api/auth/email-change/confirm', { method: 'POST', body: JSON.stringify({ token }) }).then(() => { clearSession(); setStatus('success'); }).catch(() => setStatus('error'));
  }, [token]);

  return <main className="mx-auto flex min-h-[420px] max-w-md items-center"><section className="w-full rounded-2xl border border-border bg-card p-8 text-center shadow-sm">{status === 'loading' && <><Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" /><h1 className="text-xl font-semibold">Confirmando e-mail…</h1><p className="mt-2 text-sm text-muted-foreground">Estamos validando seu novo endereço.</p></>}{status === 'success' && <><CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-success" /><h1 className="text-xl font-semibold">E-mail confirmado</h1><p className="mt-2 text-sm text-muted-foreground">Sua sessão foi encerrada por segurança. Entre novamente com o novo endereço.</p><Link href="/login" className="mt-6 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Ir para o login</Link></>}{status === 'error' && <><XCircle className="mx-auto mb-4 h-10 w-10 text-destructive" /><h1 className="text-xl font-semibold">Link inválido ou expirado</h1><p className="mt-2 text-sm text-muted-foreground">Solicite uma nova alteração de e-mail nas configurações.</p><Link href="/settings/profile" className="mt-6 inline-block rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-accent">Voltar às configurações</Link></>}</section></main>;
}
