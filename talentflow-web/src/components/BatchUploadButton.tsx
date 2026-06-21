'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';
import { getAuthHeaders } from '@/lib/auth';

interface BatchUploadButtonProps {
  onSuccess?: () => void;
}

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export default function BatchUploadButton({ onSuccess }: BatchUploadButtonProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [batchErrors, setBatchErrors] = useState<any[]>([]);

  async function pollBatchStatus(batchId: string) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/batches/${batchId}`, {
          headers: getAuthHeaders(),
        });
        
        if (!res.ok) {
          clearInterval(interval);
          setStatus('error');
          setTimeout(() => setStatus('idle'), 4000);
          return;
        }
        
        const data = await res.json();
        setProgress({ done: data.processed, total: data.total });
        
        if (data.status === 'completed') {
          clearInterval(interval);
          setBatchErrors(data.errors || []);
          setStatus('success');
          
          // Dispara evento para sinalizar recarga de lista/vagas
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('candidates-processing-started', {
                detail: { count: data.total - (data.errors ? data.errors.length : 0) },
              })
            );
          }
          router.refresh();
          onSuccess?.();
          
          // Se não houver erros, reseta para idle
          if (!data.errors || data.errors.length === 0) {
            setTimeout(() => setStatus('idle'), 3000);
          }
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setStatus('error');
          setTimeout(() => setStatus('idle'), 4000);
        }
      } catch (err) {
        console.error('Erro ao consultar status do lote:', err);
      }
    }, 1500);
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setStatus('uploading');
    setBatchErrors([]);
    setProgress({ done: 0, total: files.length });

    try {
      const form = new FormData();
      files.forEach((file) => {
        form.append('files', file);
      });

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/batches/upload`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: form,
      });
      
      if (!res.ok) {
        throw new Error('Falha no upload');
      }

      const data = await res.json();
      setStatus('processing');
      pollBatchStatus(data.batch_id);

    } catch (err) {
      console.error('Erro ao fazer upload de lote:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }

    // Reset o input
    if (inputRef.current) inputRef.current.value = '';
  }

  const label: Record<UploadStatus, string> = {
    idle: 'Upload em Lote',
    uploading: `Enviando ${progress.done}/${progress.total}...`,
    processing: `Processando ${progress.done}/${progress.total}...`,
    success: batchErrors.length > 0 ? 'Concluído com avisos' : 'Enviado com sucesso!',
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
    processing: (
      <svg className="animate-spin w-4 h-4 text-indigo-300" fill="none" viewBox="0 0 24 24">
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
    processing: 'bg-indigo-800 text-indigo-200 cursor-wait',
    success: batchErrors.length > 0 ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white',
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
        disabled={status === 'uploading' || status === 'processing'}
        aria-label="Fazer upload de currículos em lote"
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${btnClass[status]}`}
      >
        {icon[status]}
        {label[status]}
      </button>

      {/* Batch Upload Summary Modal */}
      {status === 'success' && batchErrors.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border border-border/80 rounded-2xl p-8 shadow-2xl flex flex-col relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
              <AlertCircle className="w-5.5 h-5.5 text-amber-500" />
              Resumo do Upload em Lote
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              O processamento em lote foi concluído. **{progress.total - batchErrors.length} de {progress.total}** currículos foram importados com sucesso. Os seguintes arquivos foram ignorados por duplicidade ou erro:
            </p>
            <div className="max-h-60 overflow-y-auto border border-border rounded-xl p-4 bg-background/50 flex flex-col gap-3 mb-6 select-text font-sans">
              {batchErrors.map((err, idx) => (
                <div key={idx} className="flex justify-between items-start gap-3 text-xs border-b border-border/40 pb-2.5 last:border-0 last:pb-0">
                  <span className="font-semibold text-foreground truncate max-w-[200px]" title={err.filename}>
                    {err.filename}
                  </span>
                  <span className="text-destructive-foreground bg-destructive/10 px-2 py-0.5 rounded text-right text-[10px] font-medium leading-normal border border-destructive/10">
                    {err.error}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStatus('idle')}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:bg-primary/95 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
            >
              Fechar Resumo
            </button>
          </div>
        </div>
      )}
    </>
  );
}
