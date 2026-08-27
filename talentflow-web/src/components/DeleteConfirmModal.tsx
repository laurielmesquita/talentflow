'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  candidateName: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  candidateName,
}: DeleteConfirmModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  async function handleDelete() {
    if (confirmText !== 'EXCLUIR') return;
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Erro ao excluir candidato:', error);
    } finally {
      setIsDeleting(false);
      setConfirmText('');
      setStep(1);
    }
  }

  const handleClose = () => {
    if (isDeleting) return;
    setConfirmText('');
    setStep(1);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} ariaLabel="Confirmar exclusão de candidato" className="overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Excluir Perfil de Candidato</h3>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                Você está prestes a excluir permanentemente o perfil de{' '}
                <strong className="text-foreground font-semibold">{candidateName}</strong>.
              </p>
              <p className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-3 text-rose-500 dark:text-rose-400">
                ⚠️ <strong>Esta ação é irreversível.</strong> O perfil, o currículo PDF original, as fotos e todas as informações associadas serão excluídos do sistema e dos serviços de armazenamento.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20 transition-all"
              >
                Continuar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Confirmação de Segurança</h3>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Para confirmar a exclusão definitiva de{' '}
                <strong className="text-foreground">{candidateName}</strong>, digite{' '}
                <span className="font-mono text-rose-500 dark:text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/25">
                  EXCLUIR
                </span>{' '}
                no campo abaixo:
              </p>

              <Input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Digite EXCLUIR"
                disabled={isDeleting}
                className="border-destructive/30 focus-visible:border-destructive focus-visible:ring-destructive/20"
              />
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-foreground disabled:opacity-50"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={confirmText !== 'EXCLUIR' || isDeleting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-rose-600 hover:bg-rose-500 disabled:bg-rose-600/30 disabled:text-rose-400/50 disabled:cursor-not-allowed text-white shadow-lg shadow-rose-500/20 transition-all"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Excluindo...
                  </>
                ) : (
                  'Excluir Permanentemente'
                )}
              </button>
            </div>
          </div>
        )}
    </Dialog>
  );
}
