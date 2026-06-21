'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';
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
  const [batchErrors, setBatchErrors] = useState<any[]>([]);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  async function pollBatchStatus(batchId: string) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/batches/${batchId}`, {
          headers: getAuthHeaders(),
        });
        
        if (!res.ok) {
          clearInterval(interval);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('candidates-processing-finished'));
          }
          return;
        }
        
        const data = await res.json();
        setProgress({ done: data.processed, total: data.total });
        
        // Dispara evento de progresso para a tela principal
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('candidates-processing-progress', {
              detail: { done: data.processed, total: data.total },
            })
          );
        }
        
        if (data.status === 'completed') {
          clearInterval(interval);
          setBatchErrors(data.errors || []);
          
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('candidates-processing-finished'));
          }
          
          router.refresh();
          onSuccess?.();
          
          if (data.errors && data.errors.length > 0) {
            setShowSummaryModal(true);
          }
        } else if (data.status === 'failed') {
          clearInterval(interval);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('candidates-processing-finished'));
          }
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
    setShowSummaryModal(false);
    setProgress({ done: 0, total: files.length });

    // Dispara progresso inicial
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('candidates-processing-progress', {
          detail: { done: 0, total: files.length },
        })
      );
    }

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
      
      // Imediatamente reseta o botão para IDLE e inicia o polling do progresso
      setStatus('idle');
      pollBatchStatus(data.batch_id);

    } catch (err) {
      console.error('Erro ao fazer upload de lote:', err);
      setStatus('error');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('candidates-processing-finished'));
      }
      setTimeout(() => setStatus('idle'), 4000);
    }

    // Reseta o input
    if (inputRef.current) inputRef.current.value = '';
  }

  const label: Record<UploadStatus, string> = {
    idle: 'Upload em Lote',
    uploading: `Enviando ${progress.total} PDFs...`,
    success: 'Enviado com sucesso!',
    error: 'Erro no upload. Tente novamente.',
  };

  const icon: Record<UploadStatus, React.ReactNode> = {
    idle: <UploadCloud className="w-4 h-4" />,
    uploading: (
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

      {/* Modal de resumo do processamento de lote (aberto se houver erros) */}
      {showSummaryModal && batchErrors.length > 0 && (
        <div className="fixed top-0 left-0 w-screen h-screen z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
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
              onClick={() => setShowSummaryModal(false)}
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
