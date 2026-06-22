"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, ShieldCheck, ShieldAlert, ShieldX, Trash2, ChevronDown, ChevronLeft, ChevronRight, Mail, Phone, MapPin, Briefcase, GraduationCap, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { getAuthHeaders } from "@/lib/auth";

// ── Score Ring Animado ────────────────────────────────────────────────────────
function ScoreRing({ score, tier }: { score: number | null; tier: string | null }) {
  if (score === null || tier === null) return <span className="text-xs text-slate-500 italic">—</span>;
  
  const colors = {
    high: "stroke-emerald-500",
    medium: "stroke-amber-500",
    low: "stroke-rose-500"
  };
  const colorClass = colors[tier as keyof typeof colors] ?? colors.low;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <svg className="w-full h-full transform -rotate-90 drop-shadow-md">
        <circle cx="24" cy="24" r="18" className="stroke-slate-200 dark:stroke-white/5" strokeWidth="4" fill="none" />
        <motion.circle 
          cx="24" cy="24" r="18" 
          className={colorClass} 
          strokeWidth="4" fill="none" 
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, type: "spring", bounce: 0.2 }}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xs font-bold text-slate-800 dark:text-slate-200">{score}</span>
    </div>
  );
}

export default function CandidateTable({
  candidates,
  initialCandidateId,
  currentPage,
  totalItems,
  pageSize,
}: {
  candidates: any[];
  initialCandidateId?: string;
  currentPage: number;
  totalItems: number;
  pageSize: number;
}) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(initialCandidateId ?? null);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [deleteCandidateName, setDeleteCandidateName] = useState<string>("");
  const [processingStatus, setProcessingStatus] = useState<{ done: number; total: number } | null>(null);

  // Detalhes dinâmicos de candidatos carregados sob demanda
  const [loadedCandidates, setLoadedCandidates] = useState<Record<string, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});
  const [flaggingId, setFlaggingId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState("");
  const [submittingFlag, setSubmittingFlag] = useState(false);

  // Lógica de Paginação
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  const handlePageSizeChange = (size: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("limit", String(size));
    params.set("page", "1");
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const fetchDetails = async (candId: string) => {
    if (loadedCandidates[candId] || loadingDetails[candId]) return;
    setLoadingDetails(prev => ({ ...prev, [candId]: true }));
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/candidates/${candId}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const detail = await res.json();
        setLoadedCandidates(prev => ({ ...prev, [candId]: detail }));
      }
    } catch (e) {
      console.error("Erro ao carregar detalhes do candidato:", e);
    } finally {
      setLoadingDetails(prev => ({ ...prev, [candId]: false }));
    }
  };

  const handleToggleExpand = (candId: string) => {
    const nextExpanded = expandedId === candId ? null : candId;
    setExpandedId(nextExpanded);
    if (nextExpanded) {
      fetchDetails(candId);
    }
  };

  async function handleFlag(candId: string) {
    if (!flagReason.trim()) return;
    setSubmittingFlag(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/candidates/${candId}/flag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ reason: flagReason }),
      });
      if (res.ok) {
        const updatedCandidate = await res.json();
        setLoadedCandidates(prev => ({
          ...prev,
          [candId]: {
            ...prev[candId],
            is_flagged: updatedCandidate.is_flagged,
            flagged_reason: updatedCandidate.flagged_reason,
            flagged_at: updatedCandidate.flagged_at
          }
        }));
        setFlaggingId(null);
        setFlagReason("");
        router.refresh();
      }
    } catch (e) {
      console.error("Erro ao sinalizar candidato:", e);
    } finally {
      setSubmittingFlag(false);
    }
  }

  async function handleUnflag(candId: string) {
    if (!window.confirm("Deseja realmente remover a sinalização deste candidato?")) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/candidates/${candId}/unflag`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setLoadedCandidates(prev => ({
          ...prev,
          [candId]: {
            ...prev[candId],
            is_flagged: false,
            flagged_reason: null,
            flagged_at: null
          }
        }));
        router.refresh();
      }
    } catch (e) {
      console.error("Erro ao remover sinalização do candidato:", e);
    }
  }

  useEffect(() => {
    if (initialCandidateId) {
      fetchDetails(initialCandidateId);
    }
  }, [initialCandidateId]);

  async function handleDeleteConfirm() {
    if (!deleteCandidateId) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/candidates/${deleteCandidateId}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) router.refresh();
    } catch (e) {
      console.error('Erro ao deletar:', e);
    }
  }

  // Configuração de escuta de eventos de progresso de upload em lote
  useEffect(() => {
    const handleProgress = (e: Event) => {
      const customEvent = e as CustomEvent<{ done: number; total: number }>;
      setProcessingStatus({
        done: customEvent.detail.done,
        total: customEvent.detail.total
      });
    };
    const handleFinished = () => {
      setProcessingStatus(null);
    };

    window.addEventListener("candidates-processing-progress", handleProgress);
    window.addEventListener("candidates-processing-finished", handleFinished);
    return () => {
      window.removeEventListener("candidates-processing-progress", handleProgress);
      window.removeEventListener("candidates-processing-finished", handleFinished);
    };
  }, []);

  useEffect(() => {
    if (!processingStatus) return;
    const interval = setInterval(() => router.refresh(), 2500);
    return () => clearInterval(interval);
  }, [processingStatus, router]);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* Indicador de Processamento */}
      <AnimatePresence>
        {processingStatus && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between px-5 py-4 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.15)]"
          >
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              <span className="font-semibold tracking-wide">
                Processando currículos com IA: {processingStatus.done} de {processingStatus.total} concluídos...
              </span>
            </div>
            <Sparkles className="w-5 h-5 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista Principal (Staggered Grid) */}
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show"
        className="flex flex-col gap-4"
      >
        {candidates.length === 0 ? (
          <div className="py-20 text-center text-slate-500 font-medium">Nenhum candidato no radar.</div>
        ) : (
          candidates.map((cand) => {
            const isExpanded = expandedId === cand.id;
            const fullCand = loadedCandidates[cand.id] || cand;

            return (
              <motion.div
                layout
                variants={itemVariants}
                key={cand.id}
                className="group relative flex flex-col bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-xl dark:shadow-none hover:border-slate-300 dark:hover:border-white/20 transition-colors overflow-hidden"
              >
                {/* Iluminação interna sutil no dark mode */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/[0.02] to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div 
                  className="relative flex items-center p-5 cursor-pointer z-10"
                  onClick={() => handleToggleExpand(cand.id)}
                >
                  {/* Avatar & Nome */}
                  <div className="flex items-center gap-4 w-1/3">
                    {cand.photo_url ? (
                      <img src={cand.photo_url} alt={cand.full_name} className="w-12 h-12 rounded-full object-cover shadow-inner ring-2 ring-white/10" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
                        {cand.full_name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        {cand.full_name}
                        {fullCand.is_flagged && <ShieldAlert className="w-4 h-4 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />}
                      </h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">{cand.current_job || cand.categories[0] || 'Sem cargo'}</p>
                    </div>
                  </div>

                  {/* Skills (Staggered Interno) */}
                  <div className="flex flex-wrap gap-2 w-1/3 px-4">
                    {cand.skills?.slice(0, 3).map((s: string, idx: number) => (
                      <motion.span 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-indigo-300 text-xs font-semibold border border-primary/20 shadow-sm"
                      >
                        {s}
                      </motion.span>
                    ))}
                    {cand.skills?.length > 3 && (
                      <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                        +{cand.skills.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Score & Ações */}
                  <div className="flex items-center justify-end gap-6 w-1/3 ml-auto">
                    <ScoreRing score={cand.quality_score} tier={cand.quality_tier} />
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteCandidateId(cand.id);
                        setDeleteCandidateName(cand.full_name);
                      }}
                      className="p-2 rounded-full text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="p-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  </div>
                </div>

                {/* Área Expandida (Accordion) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                      className="border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-black/20"
                    >
                      {loadingDetails[cand.id] ? (
                        <div className="p-8 flex justify-center text-slate-400">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          <span className="ml-2 text-sm">Carregando perfil...</span>
                        </div>
                      ) : (
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                          {/* Coluna Esquerda: Informações Gerais, Contato e Blacklist */}
                          <div className="space-y-6">
                            {/* Resumo */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Resumo do Candidato</h4>
                              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                {fullCand.summary || "Nenhum resumo de perfil extraído."}
                              </p>
                            </div>

                            {/* Informações de Contato */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Contato</h4>
                              <div className="space-y-2">
                                {fullCand.email && (
                                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <a href={`mailto:${fullCand.email}`} className="hover:underline">{fullCand.email}</a>
                                  </div>
                                )}
                                {fullCand.phone && (
                                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    <span>{fullCand.phone}</span>
                                  </div>
                                )}
                                {fullCand.address && (
                                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span>{fullCand.address}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Alertas de Qualidade */}
                            {fullCand.quality_alerts && fullCand.quality_alerts.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Alertas de Qualidade</h4>
                                <div className="space-y-1.5">
                                  {fullCand.quality_alerts.map((alert: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-300/80">
                                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
                                      <span>{alert.replace(/Campo '([^']+)'/, "$1")} não informado.</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Seção de Flag / Blacklist */}
                            <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-white/[0.01] border border-slate-200 dark:border-white/5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Blacklist / Triagem</span>
                                {!fullCand.is_flagged ? (
                                  flaggingId !== cand.id && (
                                    <button 
                                      onClick={() => setFlaggingId(cand.id)}
                                      className="text-xs font-bold text-rose-500 hover:underline uppercase"
                                    >
                                      Sinalizar Perfil
                                    </button>
                                  )
                                ) : (
                                  <button 
                                    onClick={() => handleUnflag(cand.id)}
                                    className="text-xs font-bold text-emerald-500 hover:underline uppercase"
                                  >
                                    Remover Sinalização
                                  </button>
                                )}
                              </div>

                              {fullCand.is_flagged && (
                                <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                                  <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">{fullCand.flagged_reason}</p>
                                </div>
                              )}

                              {flaggingId === cand.id && (
                                <div className="mt-3 space-y-3">
                                  <textarea 
                                    className="w-full h-20 p-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-rose-500/50 resize-none transition-all"
                                    placeholder="Motivo da sinalização..."
                                    value={flagReason}
                                    onChange={(e) => setFlagReason(e.target.value)}
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button 
                                      onClick={() => {
                                        setFlaggingId(null);
                                        setFlagReason("");
                                      }}
                                      disabled={submittingFlag}
                                      className="px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 transition-all"
                                    >
                                      Cancelar
                                    </button>
                                    <button 
                                      onClick={() => handleFlag(cand.id)}
                                      disabled={submittingFlag || !flagReason.trim()}
                                      className="px-2.5 py-1.5 rounded-md text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                      {submittingFlag ? "..." : "Sinalizar"}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Coluna Direita: Experiências e Skills */}
                          <div className="space-y-6">
                            {/* Experiências */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-primary" /> Experiência Profissional
                              </h4>
                              {fullCand.experiences && fullCand.experiences.length > 0 ? (
                                <div className="space-y-3">
                                  {fullCand.experiences.map((exp: any, idx: number) => (
                                    <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm">
                                      <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{exp.title}</div>
                                      <div className="text-xs text-primary dark:text-indigo-400 font-semibold mt-0.5">{exp.company}</div>
                                      {exp.desc && (
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2 p-2.5 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5">
                                          {exp.desc}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-500 italic">Nenhuma experiência registrada no currículo.</p>
                              )}
                            </div>

                            {/* Competências */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" /> Todas as Skills
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {fullCand.skills?.map((s: string, idx: number) => (
                                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-medium">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Controles de Paginação */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm mt-4 select-none">
          
          {/* Seletor de Page Size & Texto Informativo */}
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span>
              Mostrando <strong className="font-semibold text-slate-800 dark:text-slate-200">{startItem}</strong> a{" "}
              <strong className="font-semibold text-slate-800 dark:text-slate-200">{endItem}</strong> de{" "}
              <strong className="font-semibold text-slate-800 dark:text-slate-200">{totalItems}</strong> candidatos
            </span>
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-white/10 pl-4">
              <span className="text-xs">Exibir:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="bg-slate-50 dark:bg-black/25 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-primary/50 transition-colors"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navegação Numerada */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent text-slate-600 dark:text-slate-400 transition-all cursor-pointer disabled:cursor-not-allowed"
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPageNumbers().map((pageNum, idx) => {
                if (pageNum === "...") {
                  return (
                    <span key={idx} className="px-1 text-slate-400 dark:text-slate-500">
                      ...
                    </span>
                  );
                }
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(Number(pageNum))}
                    className={`min-w-9 h-9 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                        : "border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent text-slate-600 dark:text-slate-400 transition-all cursor-pointer disabled:cursor-not-allowed"
                aria-label="Próxima página"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteCandidateId !== null}
        onClose={() => setDeleteCandidateId(null)}
        onConfirm={handleDeleteConfirm}
        candidateName={deleteCandidateName}
      />
    </div>
  );
}
