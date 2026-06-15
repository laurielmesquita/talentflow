'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';

interface BatchUploadButtonProps {
  onSuccess?: () => void;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function BatchUploadButton({ onSuccess }: BatchUploadButtonProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setStatus('uploading');
    setProgress({ done: 0, total: files.length });

    let successCount = 0;

    for (const file of files) {
      try {
        const form = new FormData();
        form.append('file', file);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          body: form,
        });
        if (res.ok) successCount++;
      } catch {
        // Continua processando os demais arquivos mesmo em caso de erro individual
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }));
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
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
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
    </>
  );
}
