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
  Minus, 
  AlertOctagon, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Briefcase
} from 'lucide-react';

interface ExperienceDiffItem {
  company_name: string;
  job_title: string;
  description: string | null;
  is_current: boolean;
}

interface CandidateConflictPayload {
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
  extracted_data: {
    full_name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    skills: string[];
    experiences: ExperienceDiffItem[];
  };
  photo_url: string | null;
  original_pdf_url: string | null;
  quality_score: number | null;
  quality_alerts: string[] | null;
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

  const { existing_candidate: oldCand, extracted_data: newCand } = conflictData;

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

  // Helper de comparação simples de strings/valores
  function getFieldDiffStatus(field: 'full_name' | 'email' | 'phone' | 'address') {
    const oldVal = (oldCand[field] || '').trim();
    const newVal = (newCand[field] || '').trim();

    if (oldVal === newVal) return { label: 'Igual', code: 'equal', color: 'text-slate-500 bg-slate-500/10 border-slate-800' };
    if (!oldVal && newVal) return { label: 'Adicionado', code: 'added', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (oldVal && !newVal) return { label: 'Removido', code: 'removed', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
    return { label: 'Alterado', code: 'changed', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
  }

  // Diff de arrays de skills
  const oldSkills = oldCand.skills || [];
  const newSkills = newCand.skills || [];
  const allSkills = Array.from(new Set([...oldSkills, ...newSkills]));
  const skillsDiff = allSkills.map(skill => {
    const inOld = oldSkills.includes(skill);
    const inNew = newSkills.includes(skill);
    if (inOld && inNew) return { name: skill, status: 'equal', color: 'bg-indigo-500/5 text-slate-400 border-slate-800/60' };
    if (!inOld && inNew) return { name: skill, status: 'added', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    return { name: skill, status: 'removed', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20 line-through' };
  });
  const hasSkillsDiff = skillsDiff.some(s => s.status !== 'equal');

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

  // Verifica se há alguma alteração total
  const hasDetailsChange = 
    getFieldDiffStatus('full_name').code !== 'equal' ||
    getFieldDiffStatus('email').code !== 'equal' ||
    getFieldDiffStatus('phone').code !== 'equal' ||
    getFieldDiffStatus('address').code !== 'equal' ||
    hasSkillsDiff ||
    hasExpDiff;

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

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleAction('replace')}
                disabled={isSubmitting}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-850 border border-slate-750 text-slate-200 text-sm font-medium transition-all group"
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
            <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPhase('decision')}
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-450 hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
                <div className="h-4 w-px bg-slate-800" />
                <div>
                  <h3 className="font-bold text-base text-slate-200">Comparação Detalhada de Dados</h3>
                  <p className="text-xs text-slate-550">Analise as diferenças antes de confirmar o versionamento</p>
                </div>
              </div>

              {/* Botão toggle + Confirmar */}
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
                  className="flex items-center gap-1.5 px-5 py-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-550 disabled:bg-indigo-800/40 text-white text-sm font-bold shadow-lg shadow-indigo-950/20 transition-all"
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

            {/* Sub-header / Legenda */}
            <div className="bg-slate-900 border-b border-slate-800 px-6 py-2 flex items-center gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <span>Legenda:</span>
              <div className="flex items-center gap-1 text-slate-500 lowercase normal-case"><span className="w-2 h-2 rounded-full bg-slate-600" /> ✅ igual</div>
              <div className="flex items-center gap-1 text-amber-400 lowercase normal-case"><span className="w-2 h-2 rounded-full bg-amber-500" /> 🔄 alterado</div>
              <div className="flex items-center gap-1 text-emerald-400 lowercase normal-case"><span className="w-2 h-2 rounded-full bg-emerald-500" /> ➕ adicionado</div>
              <div className="flex items-center gap-1 text-rose-400 lowercase normal-case"><span className="w-2 h-2 rounded-full bg-rose-500" /> ➖ removido</div>
            </div>

            {/* Conteúdo Principal — Grid Duas Colunas */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Cabeçalho das colunas */}
              <div className="sticky top-0 bg-slate-900 py-2 border-b border-slate-800/40 z-[5] text-sm font-bold tracking-wider text-slate-400 uppercase" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>Perfil Atual <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">v{oldCand.version}</span></div>
                <div>Novo Currículo <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/25">v{oldCand.version + 1}</span></div>
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
                  <div key={key} className="py-4 border-b border-slate-800/40 hover:bg-slate-850/5 rounded-lg transition-colors px-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</div>
                      <div className="text-slate-350 text-sm font-medium">{oldCand[key] || <span className="text-slate-700 italic">Não informado</span>}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border uppercase ${diff.color}`}>
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
                <div className="py-4 border-b border-slate-800/40 hover:bg-slate-850/5 rounded-lg transition-colors px-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div className="space-y-2">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Habilidades (Skills)</div>
                    <div className="flex flex-wrap gap-1.5">
                      {oldSkills.length === 0 ? (
                        <span className="text-slate-700 italic text-sm">Nenhuma skill identificada</span>
                      ) : (
                        oldSkills.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-xs font-semibold border border-slate-700/60">
                            {s}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Habilidades (Skills)</div>
                      {hasSkillsDiff && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded border uppercase bg-amber-500/10 text-amber-400 border-amber-500/25">
                          Alterado
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {skillsDiff.map((s, i) => (
                        <span key={i} className={`px-2 py-0.5 rounded text-xs font-semibold border ${s.color}`}>
                          {s.status === 'added' && <Plus className="w-2.5 h-2.5 inline mr-0.5 shrink-0" />}
                          {s.status === 'removed' && <Minus className="w-2.5 h-2.5 inline mr-0.5 shrink-0" />}
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Experiências Section */}
              {(!hasExpDiff && !showIdentical) ? null : (
                <div className="space-y-3">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider border-b border-slate-800 pb-2">
                    Experiências Profissionais
                  </div>

                  <div className="space-y-4">
                    {experiencesComparison.map((item, idx) => {
                      if (item.status === 'equal' && !showIdentical) return null;

                      const diffColors = {
                        equal: 'border-slate-800/60 bg-slate-850/5 text-slate-500',
                        changed: 'border-amber-500/25 bg-amber-500/5 text-amber-400',
                        added: 'border-emerald-500/25 bg-emerald-500/5 text-emerald-400',
                        removed: 'border-rose-500/25 bg-rose-500/5 text-rose-400',
                      };

                      return (
                        <div key={idx} className="border-b border-slate-800/30 pb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                          
                          {/* Coluna Antiga */}
                          <div>
                            {item.oldExp ? (
                              <div className="p-4 rounded-xl border border-slate-800 bg-slate-850/30 space-y-2">
                                <div className="flex items-start justify-between">
                                  <div className="font-semibold text-slate-200 text-sm">{item.oldExp.job_title}</div>
                                  {item.oldExp.is_current && (
                                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 font-bold uppercase">Atual</span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-450 flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {item.oldExp.company_name}</div>
                                {item.oldExp.description && (
                                  <p className="text-xs text-slate-500 leading-relaxed font-normal whitespace-pre-line">{item.oldExp.description}</p>
                                )}
                              </div>
                            ) : (
                              <div className="h-full border border-dashed border-slate-800/60 rounded-xl bg-slate-950/20 flex items-center justify-center text-xs text-slate-700 italic">
                                Sem registro nesta versão
                              </div>
                            )}
                          </div>

                          {/* Coluna Nova */}
                          <div>
                            {item.newExp ? (
                              <div className={`p-4 rounded-xl border space-y-2 relative ${
                                item.status === 'added' ? 'border-emerald-500/20 bg-emerald-500/5' :
                                item.status === 'changed' ? 'border-amber-500/20 bg-amber-500/5' :
                                'border-slate-800 bg-slate-850/30'
                              }`}>
                                <span className={`absolute top-4 right-4 text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${diffColors[item.status]}`}>
                                  {item.status === 'equal' ? 'Igual' : 
                                   item.status === 'added' ? 'Adicionado' : 'Alterado'}
                                </span>

                                <div className="flex items-start justify-between pr-14">
                                  <div className="font-semibold text-slate-100 text-sm">{item.newExp.job_title}</div>
                                </div>
                                <div className="text-xs text-slate-350 flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {item.newExp.company_name}</div>
                                {item.newExp.description && (
                                  <p className={`text-xs leading-relaxed font-normal whitespace-pre-line ${
                                    item.status === 'equal' ? 'text-slate-500' : 'text-slate-350'
                                  }`}>{item.newExp.description}</p>
                                )}
                              </div>
                            ) : (
                              <div className="h-full border border-rose-500/10 border-dashed rounded-xl bg-rose-500/5 flex items-center justify-center p-6 text-center">
                                <div>
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded border uppercase border-rose-500/20 bg-rose-500/10 text-rose-400">
                                    Removido
                                  </span>
                                  <p className="text-xs text-slate-600 mt-2 font-normal italic">
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
    </>,
    document.body
  );
}
