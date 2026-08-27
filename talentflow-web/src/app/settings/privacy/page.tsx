'use client';

import { useState } from 'react';
import { Download, ShieldCheck } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import StatusMessage from '@/components/StatusMessage';

export default function SettingsPrivacyPage() {
  const [isExporting, setIsExporting] = useState(false); const [error, setError] = useState<string | null>(null); const [message, setMessage] = useState<string | null>(null);
  async function exportData() { setIsExporting(true); setError(null); setMessage(null); try { const data = await apiFetch<Record<string, unknown>>('/api/auth/me/export'); const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = 'talentflow-meus-dados.json'; link.click(); URL.revokeObjectURL(url); setMessage('Seu arquivo foi preparado para download.'); } catch (reason: unknown) { setError(reason instanceof Error ? reason.message : 'Não foi possível exportar seus dados.'); } finally { setIsExporting(false); } }
  return <main className="max-w-2xl"><section className="rounded-2xl border border-border bg-card p-6 shadow-sm"><div className="mb-6 flex gap-3"><ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" /><div><h1 className="font-semibold">Privacidade e dados</h1><p className="mt-1 text-sm text-muted-foreground">Acesse uma cópia dos dados pessoais associados à sua conta.</p></div></div>{error && <StatusMessage tone="error" className="mb-5">{error}</StatusMessage>}{message && <StatusMessage tone="success" className="mb-5">{message}</StatusMessage>}<div className="rounded-xl border border-border bg-muted/30 p-4"><h2 className="font-medium">Exportar meus dados</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">O arquivo inclui os dados do seu perfil, as preferências da conta e a identificação da organização à qual você pertence.</p><button type="button" onClick={() => void exportData()} disabled={isExporting} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent disabled:opacity-60"><Download className="h-4 w-4" />{isExporting ? 'Preparando exportação…' : 'Exportar meus dados'}</button></div></section></main>;
}
