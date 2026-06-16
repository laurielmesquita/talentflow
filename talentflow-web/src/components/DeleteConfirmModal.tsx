'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity" 
        onClick={handleClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
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

            <div className="space-y-2 text-sm text-slate-400">
              <p>
                Você está prestes a excluir permanentemente o perfil de{' '}
                <strong className="text-slate-200 font-semibold">{candidateName}</strong>.
              </p>
              <p className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-3 text-rose-400">
                ⚠️ <strong>Esta ação é irreversível.</strong> O perfil, o currículo PDF original, as fotos e todas as informações associadas serão excluídos do sistema e dos serviços de armazenamento.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 hover:bg-slate-800 transition-all text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20 transition-all"
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
              <p className="text-sm text-slate-400">
                Para confirmar a exclusão definitiva de{' '}
                <strong className="text-slate-200">{candidateName}</strong>, digite{' '}
                <span className="font-mono text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/25">
                  EXCLUIR
                </span>{' '}
                no campo abaixo:
              </p>

              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Digite EXCLUIR"
                disabled={isDeleting}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-colors focus:ring-1 focus:ring-rose-500 disabled:opacity-50"
              />
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 hover:bg-slate-800 transition-all text-slate-300 disabled:opacity-50"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={confirmText !== 'EXCLUIR' || isDeleting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800/40 disabled:text-slate-500 disabled:cursor-not-allowed text-white shadow-lg shadow-rose-950/20 transition-all"
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
      </div>
    </div>
  );
}
