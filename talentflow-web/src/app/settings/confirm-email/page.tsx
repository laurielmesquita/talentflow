'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { clearSession } from '@/lib/auth';

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      return;
    }
    void apiFetch('/api/auth/email-change/confirm', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }).then(() => {
      clearSession();
      setStatus('success');
    }).catch(() => setStatus('error'));
  }, [searchParams]);

  return <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground"><section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
    {status === 'loading' && <><Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" /><h1 className="text-xl font-semibold">Confirmando e-mail...</h1></>}
    {status === 'success' && <><CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-emerald-500" /><h1 className="text-xl font-semibold">E-mail confirmado</h1><p className="mt-2 text-sm text-muted-foreground">Sua sessão foi encerrada por segurança. Entre novamente com o novo endereço.</p><Link href="/login" className="mt-6 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Ir para o login</Link></>}
    {status === 'error' && <><XCircle className="mx-auto mb-4 h-10 w-10 text-destructive" /><h1 className="text-xl font-semibold">Link inválido ou expirado</h1><p className="mt-2 text-sm text-muted-foreground">Solicite uma nova alteração de e-mail nas Configurações.</p><Link href="/settings" className="mt-6 inline-block rounded-xl border border-border px-4 py-2 text-sm font-semibold">Voltar às configurações</Link></>}
  </section></main>;
}
