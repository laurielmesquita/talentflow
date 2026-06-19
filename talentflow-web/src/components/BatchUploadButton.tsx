'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';
import ConflictModal from './ConflictModal';
import { getAuthHeaders } from '@/lib/auth';

interface BatchUploadButtonProps {
  onSuccess?: () => void;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function BatchUploadButton({ onSuccess }: BatchUploadButtonProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [conflictQueue, setConflictQueue] = useState<any[]>([]);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setStatus('uploading');
    setProgress({ done: 0, total: files.length });

    let successCount = 0;
    const conflicts: any[] = [];

    for (const file of files) {
      try {
        const form = new FormData();
        form.append('file', file);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: form,
        });
        
        if (res.ok) {
          successCount++;
        } else if (res.status === 409) {
          const errData = await res.json();
          if (errData && errData.detail) {
            conflicts.push(errData.detail);
          }
        }
      } catch (err) {
        console.error('Erro ao fazer upload de arquivo:', err);
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }

    if (conflicts.length > 0) {
      setConflictQueue(conflicts);
    }

    // Reset o input para permitir re-upload do mesmo arquivo
    if (inputRef.current) inputRef.current.value = '';

    if (successCount > 0) {
      setStatus('success');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('candidates-processing-started', {
            detail: { count: successCount },
          })
        );
      }
      router.refresh();
      onSuccess?.();
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      if (conflicts.length > 0) {
        setStatus('idle');
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 4000);
      }
    }
  }

  async function handleConflictResolve(action: 'replace' | 'keep_both') {
    const currentConflict = conflictQueue[0];
    if (!currentConflict) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/candidates/${currentConflict.existing_candidate.id}/replace`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          action,
          extracted_data: currentConflict.extracted_data,
          photo_url: currentConflict.photo_url,
          original_pdf_url: currentConflict.original_pdf_url,
          pdf_hash: currentConflict.pdf_hash,
          quality_score: currentConflict.quality_score,
          quality_alerts: currentConflict.quality_alerts,
        }),
      });

      if (res.ok) {
        router.refresh();
        onSuccess?.();
      } else {
        console.error('Erro ao resolver conflito:', res.statusText);
      }
    } catch (error) {
      console.error('Erro na chamada de resolucao de conflito:', error);
    } finally {
      // Remove o primeiro conflito da fila e continua para os proximos (se houver)
      setConflictQueue((prev) => prev.slice(1));
    }
  }

  const label: Record<UploadStatus, string> = {
    idle: 'Upload em Lote',
    uploading: `Enviando ${progress.done}/${progress.total}...`,
    success: 'Enviado com sucesso!',
    error: 'Erro no upload. Tente novamente.',
  };

  const icon: Record<UploadStatus, React.ReactNode> = {
    idle: <UploadCloud className="w-4 h-4" />,
    uploading: (
      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    ),
    success: <CheckCircle className="w-4 h-4" />,
    error: <AlertCircle className="w-4 h-4" />,
  };

  const btnClass: Record<UploadStatus, string> = {
    idle: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/20',
    uploading: 'bg-indigo-700 text-indigo-300 cursor-not-allowed',
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600/80 text-white',
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        multiple
        hidden
        onChange={handleFiles}
        id="batch-upload-input"
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={status === 'uploading'}
        aria-label="Fazer upload de currículos em lote"
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${btnClass[status]}`}
      >
        {icon[status]}
        {label[status]}
      </button>

      <ConflictModal
        isOpen={conflictQueue.length > 0}
        onClose={() => setConflictQueue((prev) => prev.slice(1))}
        conflictData={conflictQueue[0] || null}
        onResolve={handleConflictResolve}
      />
    </>
  );
}
