"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, ShieldAlert, Trash2, ChevronDown, ChevronLeft, ChevronRight, Mail, Phone, MapPin, Briefcase, AlertTriangle, FileCheck2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { apiFetch } from "@/lib/api";
import type { Candidate } from "@/types";

// ── Score Ring Animado ────────────────────────────────────────────────────────
function ScoreRing({ score, tier }: { score?: number | null; tier?: string | null }) {
  if (score === null || score === undefined || !tier) return <span className="text-xs text-muted-foreground italic">—</span>;
  
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
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="24" cy="24" r="18" className="stroke-border/40" strokeWidth="4" fill="none" />
        <motion.circle 
          cx="24" cy="24" r="18" 
          className={colorClass} 
          strokeWidth="4" fill="none" 
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, type: "spring", bounce: 0.2 }}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xs font-bold font-mono tabular-nums text-foreground">{score}</span>
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
  candidates: Candidate[];
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
  const [loadedCandidates, setLoadedCandidates] = useState<Record<string, Candidate>>({});
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
      return pages;
    }

    const left = currentPage - 1;
    const right = currentPage + 1;

    pages.push(1);

    if (left > 3) {
      pages.push("...");
      pages.push(left);
      pages.push(currentPage);
    } else {
      for (let i = 2; i <= currentPage; i++) {
        pages.push(i);
      }
    }

    if (right < totalPages - 2) {
      pages.push(right);
      pages.push("...");
    } else {
      for (let i = right; i < totalPages; i++) {
        if (pages[pages.length - 1] !== i) {
          pages.push(i);
        }
      }
    }

    if (pages[pages.length - 1] !== totalPages) {
      pages.push(totalPages);
    }

    return pages;
  };

  const fetchDetails = async (candId: string) => {
    if (loadedCandidates[candId] || loadingDetails[candId]) return;
    setLoadingDetails(prev => ({ ...prev, [candId]: true }));
    try {
      const detail = await apiFetch(`/api/candidates/${candId}`);
      setLoadedCandidates(prev => ({ ...prev, [candId]: detail }));
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
      const updatedCandidate = await apiFetch(`/api/candidates/${candId}/flag`, {
        method: 'POST',
        body: JSON.stringify({ reason: flagReason }),
      });
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
    } catch (e) {
      console.error("Erro ao sinalizar candidato:", e);
    } finally {
      setSubmittingFlag(false);
    }
  }

  async function handleUnflag(candId: string) {
    if (!window.confirm("Deseja realmente remover a sinalização deste candidato?")) return;
    try {
      await apiFetch(`/api/candidates/${candId}/unflag`, { method: 'POST' });
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
      await apiFetch(`/api/candidates/${deleteCandidateId}`, { method: 'DELETE' });
      router.refresh();
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
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring" as const, stiffness: 350, damping: 25 }
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
            className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-primary/10 border border-primary/20 text-primary backdrop-blur-md shadow-xs"
          >
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="font-semibold text-xs tracking-wide">
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
        className="flex flex-col gap-3"
      >
        {candidates.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground font-medium text-sm">Nenhum candidato no radar.</div>
        ) : (
          candidates.map((cand) => {
            const isExpanded = expandedId === cand.id;
            const fullCand = loadedCandidates[cand.id] || cand;

            return (
              <motion.div
                layout
                variants={itemVariants}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                key={cand.id}
                 className="group relative flex flex-col glass-panel-strong rounded-2xl shadow-xs hover:border-primary/25 transition-colors overflow-hidden"
              >
                {/* Iluminação interna sutil no hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/[0.03] to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div 
                  className="relative flex items-center p-4 cursor-pointer z-10"
                  onClick={() => handleToggleExpand(cand.id)}
                >
                  {/* Avatar & Nome */}
                  <div className="flex items-center gap-3 w-1/3">
                    {cand.photo_url ? (
                      <img src={cand.photo_url} alt={cand.full_name} className="w-10 h-10 rounded-full object-cover border border-border/60 ring-1 ring-border/50 shadow-xs" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground border border-border/60 ring-1 ring-border/50 shadow-xs shrink-0">
                        {cand.full_name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                        {cand.full_name}
                        {fullCand.is_flagged && <ShieldAlert className="w-4 h-4 text-destructive shrink-0" />}
                      </h3>
                      <p className="text-xs font-normal text-muted-foreground mt-0.5">{cand.current_job || cand.categories[0] || 'Sem cargo'}</p>
                    </div>
                  </div>

                  {/* Skills (Staggered Interno) */}
                  <div className="flex flex-wrap gap-1.5 w-1/3 px-4">
                    {cand.skills?.slice(0, 3).map((s: string, idx: number) => (
                      <motion.span 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px] font-medium border border-border/40"
                      >
                        {s}
                      </motion.span>
                    ))}
                    {cand.skills?.length > 3 && (
                      <span className="px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground text-[11px] font-medium">
                        +{cand.skills.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Score & Ações */}
                  <div className="flex items-center justify-end gap-3 w-1/3 ml-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/candidates/${cand.id}/audit`);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white dark:text-indigo-300 text-xs font-bold tracking-tight transition-all duration-200 border border-indigo-500/30 shadow-sm"
                      title="Auditar & Comparar PDF Original vs. IA"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden lg:inline">Auditar CV</span>
                    </button>

                    <ScoreRing score={cand.quality_score} tier={cand.quality_tier} />
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteCandidateId(cand.id);
                        setDeleteCandidateName(cand.full_name);
                      }}
                      className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Excluir Candidato"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-1 rounded-md text-muted-foreground"
                    >
                      <ChevronDown className="w-4 h-4" />
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
                      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                        className="border-t border-border/40 bg-background/45"
                    >
                      {loadingDetails[cand.id] ? (
                        <div className="p-6 flex justify-center text-muted-foreground">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          <span className="ml-2 text-xs font-medium">Carregando perfil...</span>
                        </div>
                      ) : (
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                          {/* Coluna Esquerda: Informações Gerais, Contato e Blacklist */}
                          <div className="space-y-6">
                            {/* Resumo */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Resumo do Candidato</h4>
                              <p className="text-sm text-foreground leading-relaxed">
                                {fullCand.summary || "Nenhum resumo de perfil extraído."}
                              </p>
                            </div>

                            {/* Banner de Acesso Rápido ao Workspace de Auditoria */}
                            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/15 via-indigo-500/10 to-transparent border border-indigo-500/30 flex items-center justify-between shadow-sm">
                              <div className="space-y-0.5">
                                <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                  <FileCheck2 className="w-4 h-4 text-indigo-400" />
                                  Auditoria de Currículo Side-by-Side
                                </h5>
                                <p className="text-[11px] text-muted-foreground">
                                  Compare o PDF original com a extração da IA em tela cheia sem modais.
                                </p>
                              </div>
                              <button
                                onClick={() => router.push(`/dashboard/candidates/${fullCand.id}/audit`)}
                                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shrink-0 ml-3"
                              >
                                Abrir Workspace
                              </button>
                            </div>

                            {/* Informações de Contato */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contato</h4>
                              <div className="space-y-2">
                                {fullCand.email && (
                                  <div className="flex items-center gap-3 text-sm text-foreground">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <a href={`mailto:${fullCand.email}`} className="hover:underline">{fullCand.email}</a>
                                  </div>
                                )}
                                {fullCand.phone && (
                                  <div className="flex items-center gap-3 text-sm text-foreground">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <span>{fullCand.phone}</span>
                                  </div>
                                )}
                                {fullCand.address && (
                                  <div className="flex items-center gap-3 text-sm text-foreground">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span>{fullCand.address}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Alertas de Qualidade */}
                            {fullCand.quality_alerts && fullCand.quality_alerts.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Alertas de Qualidade</h4>
                                <div className="space-y-1.5">
                                  {fullCand.quality_alerts.map((alert: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-2 text-xs text-amber-500 dark:text-amber-400">
                                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
                                      <span>{alert.replace(/Campo '([^']+)'/, "$1")} não informado.</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Seção de Flag / Blacklist */}
                               <div className="p-4 rounded-xl glass-panel-strong border-border/50">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Blacklist / Triagem</span>
                                {!fullCand.is_flagged ? (
                                  flaggingId !== cand.id && (
                                    <button 
                                      onClick={() => setFlaggingId(cand.id)}
                                      className="text-xs font-bold text-destructive hover:underline uppercase"
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
                                <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                                  <p className="font-medium">{fullCand.flagged_reason}</p>
                                </div>
                              )}

                              {flaggingId === cand.id && (
                                <div className="mt-3 space-y-3">
                                  <textarea 
                                    className="w-full h-20 p-2.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none transition-all"
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
                                      className="px-2.5 py-1.5 rounded-md text-xs font-medium text-secondary-foreground bg-secondary hover:bg-secondary/80 transition-all"
                                    >
                                      Cancelar
                                    </button>
                                    <button 
                                      onClick={() => handleFlag(cand.id)}
                                      disabled={submittingFlag || !flagReason.trim()}
                                      className="px-2.5 py-1.5 rounded-md text-xs font-bold text-destructive-foreground bg-destructive hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-primary" /> Experiência Profissional
                              </h4>
                              {fullCand.experiences && fullCand.experiences.length > 0 ? (
                                <div className="space-y-3">
                                  {fullCand.experiences.map((exp: any, idx: number) => (
                                     <div key={idx} className="p-4 rounded-xl border border-border/50 bg-background/55 shadow-none">
                                      <div className="font-semibold text-sm text-foreground">{exp.job_title}</div>
                                      <div className="text-xs text-primary font-medium mt-0.5">{exp.company_name}</div>
                                      {exp.description && (
                                        <div className="text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-2 mt-2 whitespace-pre-line">
                                          {exp.description}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground italic">Nenhuma experiência registrada no currículo.</p>
                              )}
                            </div>

                            {/* Competências */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" /> Todas as Skills
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {fullCand.skills?.map((s: string, idx: number) => (
                                  <span key={idx} className="px-2.5 py-1 rounded-md bg-muted border border-border/40 text-muted-foreground text-xs font-medium">
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
         <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 glass-panel-strong border-border/50 rounded-2xl shadow-none mt-4 select-none">
          
          {/* Seletor de Page Size & Texto Informativo */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Mostrando <strong className="font-semibold text-foreground">{startItem}</strong> a{" "}
              <strong className="font-semibold text-foreground">{endItem}</strong> de{" "}
              <strong className="font-semibold text-foreground">{totalItems}</strong> candidatos
            </span>
            <div className="flex items-center gap-2 border-l border-border/50 pl-4">
              <span className="text-xs">Exibir:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="bg-background border border-border rounded-lg px-2.5 py-1 text-xs font-medium text-foreground outline-none focus:border-primary/50 transition-colors"
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
                className="p-2 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:hover:bg-transparent text-muted-foreground transition-all cursor-pointer disabled:cursor-not-allowed"
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPageNumbers().map((pageNum, idx) => {
                if (pageNum === "...") {
                  return (
                    <span key={idx} className="px-1 text-muted-foreground">
                      ...
                    </span>
                  );
                }
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(Number(pageNum))}
                    className={`min-w-8 h-8 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-primary border-primary text-primary-foreground shadow-xs"
                        : "border-border text-foreground hover:bg-accent"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:hover:bg-transparent text-muted-foreground transition-all cursor-pointer disabled:cursor-not-allowed"
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
