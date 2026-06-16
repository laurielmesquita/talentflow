'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ArrowLeft, 
  Check, 
  Copy, 
  RefreshCw, 
  Plus, 
  AlertOctagon, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Briefcase,
  FileCheck
} from 'lucide-react';

interface ExperienceDiffItem {
  company_name: string;
  job_title: string;
  description: string | null;
  is_current: boolean;
}

interface CandidateConflictPayload {
  status?: 'conflict' | 'identical';
  existing_candidate: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    version: number;
    added_at: string;
    skills: string[];
    experiences: ExperienceDiffItem[];
  };
  extracted_data?: {
    full_name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    skills: string[];
    experiences: ExperienceDiffItem[];
  };
  photo_url?: string | null;
  original_pdf_url?: string | null;
  pdf_hash?: string | null;
  quality_score?: number | null;
  quality_alerts?: string[] | null;
}

interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflictData: CandidateConflictPayload | null;
  onResolve: (action: 'replace' | 'keep_both') => Promise<void>;
}

export default function ConflictModal({
  isOpen,
  onClose,
  conflictData,
  onResolve,
}: ConflictModalProps) {
  const [phase, setPhase] = useState<'decision' | 'diff'>('decision');
  const [showIdentical, setShowIdentical] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !conflictData) return null;
  if (!mounted) return null;

  const oldCand = conflictData.existing_candidate;
  const newCand = conflictData.extracted_data || null;

  const formattedDate = oldCand.added_at
    ? new Date(oldCand.added_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'data desconhecida';

  async function handleAction(action: 'replace' | 'keep_both') {
    setIsSubmitting(true);
    try {
      await onResolve(action);
      handleClose();
    } catch (error) {
      console.error(`Erro ao executar acao ${action}:`, error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (isSubmitting) return;
    setPhase('decision');
    onClose();
  }

  // ── RENDERIZAÇÃO CASO DE DUPLICATA EXATA (INTEGRIDADE DO ARQUIVO) ───────
  if (conflictData.status === 'identical') {
    return createPortal(
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Overlay */}
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" onClick={handleClose} />
        
        {/* Modal Box */}
        <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 text-indigo-400 mb-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">Arquivo já Cadastrado</h3>
          </div>

          <div className="space-y-4 text-sm text-slate-400">
            <p>
              O currículo em PDF enviado é **exatamente idêntico** ao documento de{' '}
              <strong className="text-slate-200">"{oldCand.full_name}"</strong> cadastrado em{' '}
              <strong className="text-slate-350">{formattedDate}</strong>.
            </p>
            <p className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 text-xs text-indigo-300 leading-relaxed">
              ℹ️ **Análise de Integridade (Hash SHA-256):** O TalentFlow verificou a assinatura digital do arquivo e confirmou que os bytes são 100% idênticos. O upload foi bloqueado para evitar duplicidade redundante.
            </p>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 font-bold transition-all text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Se for o fluxo normal de conflito por nome, mas sem dados novos, não renderiza
  if (!newCand) return null;

  // Helper de comparação simples de strings/valores
  function getFieldDiffStatus(field: 'full_name' | 'email' | 'phone' | 'address') {
    const oldVal = (oldCand[field] || '').trim();
    const newVal = (newCand[field] || '').trim();

    if (oldVal === newVal) return { label: 'Igual', code: 'equal', color: 'text-slate-500 bg-slate-500/10 border-slate-800' };
    if (!oldVal && newVal) return { label: 'Adicionado', code: 'added', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (oldVal && !newVal) return { label: 'Removido', code: 'removed', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
    return { label: 'Alterado', code: 'changed', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
  }

  // Comparação de Skills sem sensibilidade a case (Case-Insensitive)
  const oldSkills = oldCand.skills || [];
  const newSkills = newCand.skills || [];
  const oldSkillsNormalized = oldSkills.map(s => s.trim().toLowerCase());
  const newSkillsNormalized = newSkills.map(s => s.trim().toLowerCase());

  // Habilidades removidas do atual vs adicionadas no novo
  const hasSkillsDiff = 
    oldSkills.some(s => !newSkillsNormalized.includes(s.trim().toLowerCase())) ||
    newSkills.some(s => !oldSkillsNormalized.includes(s.trim().toLowerCase()));

  // Comparação de experiências
  const maxExperiences = Math.max(oldCand.experiences.length, newCand.experiences.length);
  const experiencesComparison = Array.from({ length: maxExperiences }).map((_, idx) => {
    const oldExp = oldCand.experiences[idx] || null;
    const newExp = newCand.experiences[idx] || null;

    if (oldExp && newExp) {
      const isIdentical = 
        oldExp.company_name === newExp.company_name &&
        oldExp.job_title === newExp.job_title &&
        oldExp.description === newExp.description &&
        oldExp.is_current === newExp.is_current;
      return { oldExp, newExp, status: isIdentical ? 'equal' : 'changed' };
    }
    if (!oldExp && newExp) {
      return { oldExp: null, newExp, status: 'added' };
    }
    return { oldExp, newExp: null, status: 'removed' };
  });
  const hasExpDiff = experiencesComparison.some(e => e.status !== 'equal');

  return createPortal(
    <>
      {/* ── FASE 1: DECISÃO COMPACTA ──────────────────────────────────────── */}
      {phase === 'decision' && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={handleClose} />
          
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-amber-500 mb-4">
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Candidato já cadastrado</h3>
            </div>

            <div className="space-y-3 text-sm text-slate-400">
              <p>
                O candidato <strong className="text-slate-200">"{newCand.full_name}"</strong> já possui um perfil ativo no sistema desde <span className="text-slate-300 font-semibold">{formattedDate}</span> (Versão {oldCand.version}).
              </p>
              <p>O que você deseja fazer com este novo currículo?</p>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => handleAction('replace')}
                disabled={isSubmitting}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-850 hover:bg-slate-800/80 border border-slate-800 text-slate-200 text-sm font-medium transition-all group"
              >
                <div className="flex items-center gap-3 text-left">
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="block font-semibold">Substituir Perfil</span>
                    <span className="block text-xs text-slate-500 font-normal">Arquiva o perfil atual permanentemente e cria uma nova versão limpa (v1).</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => setPhase('diff')}
                disabled={isSubmitting}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/15 border border-indigo-500/20 text-indigo-300 text-sm font-medium transition-all group"
              >
                <div className="flex items-center gap-3 text-left">
                  <Copy className="w-4 h-4 text-indigo-400" />
                  <div>
                    <span className="block font-semibold">Manter Ambas (Versionar)</span>
                    <span className="block text-xs text-indigo-400/60 font-normal">Arquiva o perfil atual como histórico (v{oldCand.version}) e ativa o novo currículo como versão atualizada (v{oldCand.version + 1}).</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="w-full text-center py-2 text-xs font-semibold text-slate-500 hover:text-slate-400 border border-transparent rounded-lg hover:bg-slate-800/30 transition-colors mt-2"
              >
                Descartar Envio (Cancelar)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FASE 2: FOCUS MODE DIFF VIEW (95VH DRAWER) ────────────────────────── */}
      {phase === 'diff' && (
        <div className="fixed inset-0 z-[130] flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setPhase('decision')} />

          <div className="relative w-full h-[95vh] bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl flex flex-col text-slate-100 overflow-hidden animate-in slide-in-from-bottom duration-300">
            
            {/* Header Sticky */}
            <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPhase('decision')}
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
                <div className="h-4 w-px bg-slate-800" />
                <div>
                  <h3 className="font-bold text-base text-slate-200">Comparação Detalhada de Dados</h3>
                  <p className="text-xs text-slate-500">Analise as diferenças antes de confirmar o versionamento</p>
                </div>
              </div>

              {/* Botões do Topo */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowIdentical(!showIdentical)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-850 text-xs font-semibold text-slate-400 transition-all"
                >
                  {showIdentical ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showIdentical ? 'Ocultar Iguais' : 'Mostrar Iguais'}
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('keep_both')}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-850 text-white text-sm font-bold shadow-lg shadow-indigo-950/20 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Confirmar Novo Perfil (v{oldCand.version + 1})
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Legenda de Diferenças */}
            <div className="bg-slate-900 border-b border-slate-800/80 px-6 py-2.5 flex items-center gap-5 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              <span>Legenda:</span>
              <div className="flex items-center gap-1.5 text-slate-500 lowercase normal-case"><span className="w-2.5 h-2.5 rounded-full bg-slate-650" /> ✅ igual</div>
              <div className="flex items-center gap-1.5 text-amber-400 lowercase normal-case"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 🔄 alterado</div>
              <div className="flex items-center gap-1.5 text-emerald-400 lowercase normal-case"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> ➕ adicionado</div>
              <div className="flex items-center gap-1.5 text-rose-400 lowercase normal-case"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> ➖ removido</div>
            </div>

            {/* Conteúdo Principal — Grid Duas Colunas */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              
              {/* Cabeçalho das colunas */}
              <div className="sticky top-0 bg-slate-900 py-3 border-b border-slate-800/80 z-[5] text-xs font-bold tracking-wider text-slate-500 uppercase" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                <div>Perfil Atual <span className="ml-1 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold border border-slate-700">v{oldCand.version}</span></div>
                <div>Novo Currículo <span className="ml-1 text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/25">v{oldCand.version + 1}</span></div>
              </div>

              {/* Campos simples */}
              {([
                { key: 'full_name', label: 'Nome Completo' },
                { key: 'email', label: 'E-mail' },
                { key: 'phone', label: 'Telefone' },
                { key: 'address', label: 'Localização' },
              ] as const).map(({ key, label }) => {
                const diff = getFieldDiffStatus(key);
                if (diff.code === 'equal' && !showIdentical) return null;

                return (
                  <div key={key} className="py-4 border-b border-slate-800/40 hover:bg-slate-850/5 rounded-lg transition-colors px-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</div>
                      <div className="text-slate-300 text-sm font-medium">{oldCand[key] || <span className="text-slate-700 italic">Não informado</span>}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${diff.color}`}>
                          {diff.label}
                        </span>
                      </div>
                      <div className={`text-sm font-bold ${diff.code !== 'equal' ? 'text-slate-100' : 'text-slate-350'}`}>
                        {newCand[key] || <span className="text-slate-700 italic font-normal">Não informado</span>}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Skills Section */}
              {(!hasSkillsDiff && !showIdentical) ? null : (
                <div className="py-5 border-b border-slate-800/40 hover:bg-slate-850/5 rounded-lg transition-colors px-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                  <div className="space-y-2">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Habilidades (Skills)</div>
                    <div className="flex flex-wrap gap-1.5">
                      {oldSkills.length === 0 ? (
                        <span className="text-slate-750 italic text-xs">Nenhuma skill identificada</span>
                      ) : (
                        oldSkills.map((skill, i) => {
                          const isRemoved = !newSkillsNormalized.includes(skill.trim().toLowerCase());
                          return (
                            <span 
                              key={i} 
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                isRemoved 
                                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 line-through' 
                                  : 'bg-slate-800 border-slate-700 text-slate-400'
                              }`}
                            >
                              {skill}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Habilidades (Skills)</div>
                      {hasSkillsDiff && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase bg-amber-500/10 text-amber-400 border-amber-500/25">
                          Alterado
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {newSkills.map((skill, i) => {
                        const isAdded = !oldSkillsNormalized.includes(skill.trim().toLowerCase());
                        return (
                          <span 
                            key={i} 
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                              isAdded 
                                ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400 font-bold' 
                                : 'bg-slate-800 border-slate-800 text-slate-350'
                            }`}
                          >
                            {isAdded && <Plus className="w-2.5 h-2.5 inline mr-1 shrink-0 text-emerald-400" />}
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Experiências Section */}
              {(!hasExpDiff && !showIdentical) ? null : (
                <div className="space-y-4">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider border-b border-slate-800 pb-2">
                    Experiências Profissionais
                  </div>

                  <div className="space-y-5">
                    {experiencesComparison.map((item, idx) => {
                      if (item.status === 'equal' && !showIdentical) return null;

                      const diffColors = {
                        equal: 'border-slate-800/80 bg-slate-850/5 text-slate-500',
                        changed: 'border-amber-550/25 bg-amber-550/5 text-amber-400',
                        added: 'border-emerald-550/25 bg-emerald-550/5 text-emerald-400',
                        removed: 'border-rose-550/25 bg-rose-550/5 text-rose-400',
                      };

                      return (
                        <div key={idx} className="border-b border-slate-850 pb-5" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                          
                          {/* Coluna Antiga */}
                          <div>
                            {item.oldExp ? (
                              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-850/20 space-y-2.5">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="font-bold text-slate-200 text-sm leading-snug">{item.oldExp.job_title}</div>
                                  {item.oldExp.is_current && (
                                    <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 font-bold uppercase shrink-0">Atual</span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-450 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {item.oldExp.company_name}</div>
                                {item.oldExp.description && (
                                  <p className="text-xs text-slate-500 leading-relaxed font-normal whitespace-pre-line border-t border-slate-800/40 pt-2">{item.oldExp.description}</p>
                                )}
                              </div>
                            ) : (
                              <div className="h-full border border-dashed border-slate-800/60 rounded-2xl bg-slate-950/25 flex items-center justify-center text-xs text-slate-700 italic py-8">
                                Sem registro nesta versão
                              </div>
                            )}
                          </div>

                          {/* Coluna Nova */}
                          <div>
                            {item.newExp ? (
                              <div className={`p-5 rounded-2xl border space-y-2.5 relative ${
                                item.status === 'added' ? 'border-emerald-500/20 bg-emerald-500/5' :
                                item.status === 'changed' ? 'border-amber-500/20 bg-amber-500/5' :
                                'border-slate-800 bg-slate-850/20'
                              }`}>
                                <span className={`absolute top-4 right-4 text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${diffColors[item.status]}`}>
                                  {item.status === 'equal' ? 'Igual' : 
                                   item.status === 'added' ? 'Adicionado' : 'Alterado'}
                                </span>

                                <div className="flex items-start justify-between pr-20 gap-3">
                                  <div className="font-bold text-slate-100 text-sm leading-snug">{item.newExp.job_title}</div>
                                </div>
                                <div className="text-xs text-slate-350 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> {item.newExp.company_name}</div>
                                {item.newExp.description && (
                                  <p className={`text-xs leading-relaxed font-normal whitespace-pre-line border-t border-slate-800/45 pt-2 ${
                                    item.status === 'equal' ? 'text-slate-550' : 'text-slate-300'
                                  }`}>{item.newExp.description}</p>
                                )}
                              </div>
                            ) : (
                              <div className="h-full border border-rose-500/10 border-dashed rounded-2xl bg-rose-500/5 flex items-center justify-center p-6 text-center py-8">
                                <div>
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase border-rose-500/20 bg-rose-500/10 text-rose-400">
                                    Removido
                                  </span>
                                  <p className="text-xs text-slate-500 mt-2 font-normal italic">
                                    Esta experiência existia na versão anterior mas não está no novo currículo.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
