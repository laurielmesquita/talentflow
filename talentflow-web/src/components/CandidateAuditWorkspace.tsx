"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, XCircle, 
  Sparkles, Mail, Phone, MapPin, ShieldCheck, ShieldAlert, ShieldX, 
  AlertTriangle, Briefcase, Award, FileCheck2, UserCheck 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";
import PDFViewer from "@/components/PDFViewer";
import type { Candidate } from "@/types";

interface CandidateAuditWorkspaceProps {
  candidateId: string;
}

export default function CandidateAuditWorkspace({ candidateId }: CandidateAuditWorkspaceProps) {
  const router = useRouter();
  const [currentId, setCurrentId] = useState<string>(candidateId);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [candidateList, setCandidateList] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "warn"; text: string } | null>(null);

  // Estados para sinalização / blacklist
  const [flagging, setFlagging] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [submittingFlag, setSubmittingFlag] = useState(false);

  // Sincroniza estado com a prop se a URL mudar externamente
  useEffect(() => {
    setCurrentId(candidateId);
  }, [candidateId]);

  // Carrega lista de candidatos para permitir navegação Anterior / Próximo contínua
  useEffect(() => {
    async function fetchList() {
      try {
        const data = await apiFetch("/api/candidates?limit=100");
        if (data && Array.isArray(data.candidates)) {
          setCandidateList(data.candidates);
        }
      } catch (e) {
        console.error("Erro ao carregar lista para navegação na auditoria:", e);
      }
    }
    fetchList();
  }, []);

  // Carrega dados detalhados do candidato ativo
  useEffect(() => {
    let isMounted = true;
    async function fetchCandidate() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch(`/api/candidates/${currentId}`);
        if (isMounted) {
          setCandidate(data);
          setLoading(false);
        }
      } catch (e: any) {
        if (isMounted) {
          setError(e?.message || "Erro ao carregar os dados de auditoria do candidato.");
          setLoading(false);
        }
      }
    }
    if (currentId) {
      fetchCandidate();
    }
    return () => {
      isMounted = false;
    };
  }, [currentId]);

  // Limpa notificações toast após 4 segundos
  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => setActionMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);

  // Índices para navegação Anterior/Próximo
  const currentIndex = useMemo(() => {
    return candidateList.findIndex((c) => String(c.id) === String(currentId));
  }, [candidateList, currentId]);

  const prevCandidate = currentIndex > 0 ? candidateList[currentIndex - 1] : null;
  const nextCandidate = currentIndex >= 0 && currentIndex < candidateList.length - 1 ? candidateList[currentIndex + 1] : null;

  const navigateTo = (newId: string) => {
    setCurrentId(newId);
    router.push(`/dashboard/candidates/${newId}/audit`);
  };

  async function handleFlag() {
    if (!flagReason.trim() || !candidate) return;
    setSubmittingFlag(true);
    try {
      const updated = await apiFetch(`/api/candidates/${currentId}/flag`, {
        method: "POST",
        body: JSON.stringify({ reason: flagReason }),
      });
      setCandidate((prev) => prev ? { ...prev, is_flagged: updated.is_flagged, flagged_reason: updated.flagged_reason, flagged_at: updated.flagged_at } : null);
      setFlagging(false);
      setFlagReason("");
      setActionMessage({ type: "warn", text: "Candidato sinalizado na Blacklist com sucesso." });
    } catch (e) {
      console.error("Erro ao sinalizar candidato:", e);
    } finally {
      setSubmittingFlag(false);
    }
  }

  async function handleUnflag() {
    if (!window.confirm("Deseja realmente remover a sinalização deste candidato?") || !candidate) return;
    try {
      const updated = await apiFetch(`/api/candidates/${currentId}/unflag`, {
        method: "POST",
      });
      setCandidate((prev) => prev ? { ...prev, is_flagged: updated.is_flagged, flagged_reason: null, flagged_at: null } : null);
      setActionMessage({ type: "success", text: "Sinalização de Blacklist removida com sucesso." });
    } catch (e) {
      console.error("Erro ao remover sinalização:", e);
    }
  }

  function handleApproveAndNext() {
    setActionMessage({ type: "success", text: `Candidato ${candidate?.full_name} validado em auditoria!` });
    if (nextCandidate) {
      navigateTo(String(nextCandidate.id));
    }
  }

  // Configurações visuais de qualidade do CV
  const qualityTier = candidate?.quality_tier || "low";
  const tierConfigs = {
    high:   { Icon: ShieldCheck, color: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500", label: "Alta Compatibilidade & Organização", border: "border-emerald-500/30", bg: "bg-emerald-500/10" },
    medium: { Icon: ShieldAlert, color: "text-amber-600 dark:text-amber-400",   bar: "bg-amber-500",   label: "Atenção Moderada", border: "border-amber-500/30",   bg: "bg-amber-500/10" },
    low:    { Icon: ShieldX,     color: "text-rose-600 dark:text-rose-400",    bar: "bg-rose-500",    label: "Baixa Organização / Informações Ausentes", border: "border-rose-500/30",    bg: "bg-rose-500/10" },
  };
  const currentTier = tierConfigs[qualityTier as keyof typeof tierConfigs] || tierConfigs.low;

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden font-sans selection:bg-primary/20 transition-colors duration-300">
      {/* ── TOAST DE NOTIFICAÇÃO SUPERIOR ────────────────────────────────────── */}
      <AnimatePresence>
        {actionMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full border border-border shadow-2xl bg-card/95 backdrop-blur text-xs font-semibold tracking-wide"
          >
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            )}
            <span className="text-foreground">{actionMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CABEÇALHO DO WORKSPACE (HEADER) ────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-3 bg-card/80 border-b border-border/80 backdrop-blur-md z-20 shadow-sm flex-shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all text-xs font-medium border border-border/60"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar à Tabela</span>
          </button>
          <div className="h-5 w-px bg-border/60" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-primary" />
                Workspace de Auditoria Side-by-Side
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                IA vs. PDF Original
              </span>
            </div>
          </div>
        </div>

        {/* CONTROLES DE NAVEGAÇÃO EM LOTE */}
        <div className="flex items-center space-x-2 bg-muted/40 p-1 rounded-xl border border-border/60 shadow-inner">
          <button
            onClick={() => prevCandidate && navigateTo(String(prevCandidate.id))}
            disabled={!prevCandidate || loading}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent text-muted-foreground hover:text-foreground disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 text-primary" />
            <span>Anterior</span>
          </button>
          <span className="text-xs text-muted-foreground font-mono font-medium px-2 border-x border-border/60">
            {currentIndex >= 0 ? `${currentIndex + 1} de ${candidateList.length}` : "—"}
          </span>
          <button
            onClick={() => nextCandidate && navigateTo(String(nextCandidate.id))}
            disabled={!nextCandidate || loading}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent text-muted-foreground hover:text-foreground disabled:cursor-not-allowed"
          >
            <span>Próximo</span>
            <ChevronRight className="w-4 h-4 text-primary" />
          </button>
        </div>

        {/* AÇÕES RÁPIDAS DE DECISÃO DE TRIAGEM */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (candidate?.is_flagged) {
                handleUnflag();
              } else {
                setFlagging(!flagging);
              }
            }}
            disabled={loading || !candidate}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-all text-xs font-semibold shadow-sm"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>{candidate?.is_flagged ? "Remover Blacklist" : "Sinalizar / Rejeitar"}</span>
          </button>
          <button
            onClick={handleApproveAndNext}
            disabled={loading || !candidate}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-xs font-semibold shadow-md"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Aprovar & Próximo</span>
          </button>
        </div>
      </header>

      {/* ── ÁREA PRINCIPAL SPLIT VIEW (50% PDF | 50% INTELIGÊNCIA IA) ──────── */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-hidden bg-background/50">
        {loading ? (
          <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center h-full text-primary">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4" />
            <span className="text-sm font-semibold tracking-wide animate-pulse text-muted-foreground">
              Carregando inteligência e documento de auditoria...
            </span>
          </div>
        ) : error || !candidate ? (
          <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 border border-rose-500/20">
              <ShieldX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Erro na Auditoria</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">{error || "Candidato não encontrado no sistema."}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-6 px-5 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 text-sm font-medium transition-all border border-border/60"
            >
              Voltar ao Painel
            </button>
          </div>
        ) : (
          <>
            {/* ── PAINEL ESQUERDO: VISUALIZADOR DO PDF ORIGINAL (50%) ──────── */}
            <div className="flex flex-col h-full w-full overflow-hidden rounded-xl border border-border/80 bg-card shadow-xl">
              <PDFViewer
                candidateId={candidate.id}
                pdfUrl={candidate.original_pdf_url || candidate.pdf_url}
                candidateName={candidate.full_name}
                className="h-full border-0 rounded-none"
              />
            </div>

            {/* ── PAINEL DIREITO: ANÁLISE COMPLETA E INTELIGÊNCIA DA IA (50%) ─ */}
            <div className="flex flex-col h-full w-full overflow-y-auto pr-1 rounded-xl border border-border/80 bg-card/90 shadow-xl p-6 custom-scrollbar">
              {/* Alerta de Blacklist Ativo */}
              {candidate.is_flagged && (
                <div className="mb-6 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-start gap-3 shadow-inner">
                  <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0 text-rose-500" />
                  <div>
                    <h4 className="text-sm font-bold text-rose-700 dark:text-rose-200">Perfil Sinalizado (Blacklist)</h4>
                    <p className="text-xs text-rose-600 dark:text-rose-300/80 mt-1 leading-relaxed">{candidate.flagged_reason}</p>
                    {candidate.flagged_at && (
                      <p className="text-[10px] text-rose-500/80 mt-2 font-mono uppercase">
                        Data de sinalização: {new Date(candidate.flagged_at).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Caixa de Ação para Sinalização Rápida */}
              {flagging && !candidate.is_flagged && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }} 
                  className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-foreground space-y-3"
                >
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300 font-semibold text-xs uppercase tracking-wide">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Justificar Sinalização (Blacklist)</span>
                  </div>
                  <textarea
                    placeholder="Informe o motivo para rechaçar/sinalizar este perfil (ex: inconsistência de datas, fraude de currículo)..."
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    className="w-full h-24 p-3 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-rose-500/50 resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setFlagging(false); setFlagReason(""); }}
                      disabled={submittingFlag}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground bg-muted hover:bg-muted/80 transition-all border border-border/50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleFlag}
                      disabled={submittingFlag || !flagReason.trim()}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition-all shadow"
                    >
                      {submittingFlag ? "Gravando..." : "Confirmar Blacklist"}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* PERFIL E DADOS PRINCIPAIS DO CANDIDATO */}
              <div className="flex items-start gap-4 pb-6 border-b border-border/60">
                {candidate.photo_url ? (
                  <img
                    src={candidate.photo_url}
                    alt={candidate.full_name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/40 shrink-0 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary/40 flex items-center justify-center text-xl font-bold text-primary uppercase shrink-0 shadow-md">
                    {candidate.full_name.substring(0, 2)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-foreground truncate">{candidate.full_name}</h1>
                    {candidate.added_at && (
                      <span className="text-[10px] text-muted-foreground font-mono bg-muted/60 px-2 py-1 rounded-md border border-border/40">
                        Injeção: {new Date(candidate.added_at).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-primary font-medium mt-1">
                    {candidate.current_job || (candidate.experiences?.[0]?.job_title ?? "Cargo não identificado pela IA")}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {candidate.categories?.map((c) => (
                      <span key={c} className="text-[11px] font-semibold text-muted-foreground bg-muted/80 px-2.5 py-0.5 rounded-md border border-border/50">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* CONTATOS EXTRAÍDOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-4 border-b border-border/60 text-xs">
                {candidate.email && (
                  <div className="flex items-center gap-2.5 text-foreground bg-muted/30 p-2.5 rounded-xl border border-border/50 truncate">
                    <Mail className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate font-mono text-[11px]">{candidate.email}</span>
                  </div>
                )}
                {candidate.phone && (
                  <div className="flex items-center gap-2.5 text-foreground bg-muted/30 p-2.5 rounded-xl border border-border/50 truncate">
                    <Phone className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate font-mono text-[11px]">{candidate.phone}</span>
                  </div>
                )}
                {candidate.address && (
                  <div className="col-span-1 md:col-span-2 flex items-center gap-2.5 text-foreground bg-muted/30 p-2.5 rounded-xl border border-border/50 truncate">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate text-[11px]">{candidate.address}</span>
                  </div>
                )}
              </div>

              {/* SEÇÃO DE QUALIDADE E LEGIBILIDADE DO CURRÍCULO (AI SCORE) */}
              <div className={`mt-6 p-5 rounded-2xl border ${currentTier.border} ${currentTier.bg} backdrop-blur shadow-sm`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <h3 className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
                      Índice de Qualidade Estrutural (IA)
                    </h3>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${currentTier.border} ${currentTier.color}`}>
                    {currentTier.label}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className={`flex items-baseline gap-1 font-extrabold text-2xl ${currentTier.color} font-mono`}>
                    <span>{candidate.quality_score ?? 0}</span>
                    <span className="text-xs font-medium text-muted-foreground">/ 100 PTS</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground italic">
                    Avaliado por Llama 3.3 70B & OCR Engine
                  </span>
                </div>

                {/* Barra de Progresso do Score */}
                <div className="w-full bg-muted rounded-full h-2 mb-4 border border-border/60 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${currentTier.bar} shadow-sm`}
                    style={{ width: `${Math.max(candidate.quality_score ?? 0, 5)}%` }}
                  />
                </div>

                {/* Alertas sobre omissões do documento */}
                {candidate.quality_alerts && candidate.quality_alerts.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/60 space-y-2">
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Omissões detectadas na análise do documento:
                    </p>
                    {candidate.quality_alerts.map((alert, i) => {
                      const match = alert.match(/Campo '([^']+)'/);
                      const fieldName = match ? match[1] : alert;
                      return (
                        <div key={i} className="flex items-start gap-2 text-xs text-foreground bg-background/50 p-2 rounded-lg border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span>O campo <strong>{fieldName}</strong> ausente ou não estruturado com clareza no PDF.</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SKILLS EXTRAÍDAS */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
                    Competências & Skills Mapeadas ({candidate.skills?.length || 0})
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills && candidate.skills.length > 0 ? (
                    candidate.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-xl text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm hover:bg-primary/20 transition-colors"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Nenhuma skill técnica listada explicitamente no documento.</p>
                  )}
                </div>
              </div>

              {/* LINHA DO TEMPO DE EXPERIências */}
              <div className="mt-8 pb-12">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
                    Linha do Tempo Profissional
                  </h3>
                </div>
                <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-3.5 before:w-0.5 before:bg-border">
                  {candidate.experiences && candidate.experiences.length > 0 ? (
                    candidate.experiences.map((exp, i) => (
                      <div key={i} className="relative pl-9 group">
                        <span className="absolute left-2 top-2.5 w-3.5 h-3.5 rounded-full bg-background border-2 border-primary group-hover:scale-110 transition-transform" />
                        <div className="p-4 rounded-xl border border-border/80 bg-muted/30 hover:bg-muted/60 transition-all shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                            <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                              {exp.job_title}
                            </h4>
                            {exp.is_current && (
                              <span className="w-max text-[9px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                Atual
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-primary font-semibold mb-2.5">{exp.company_name}</div>
                          {exp.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed font-normal bg-background/60 p-2.5 rounded-lg border border-border/40">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="pl-9 text-xs text-muted-foreground italic py-2">
                      Nenhum histórico profissional pôde ser estruturado pelo analisador LLM.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
