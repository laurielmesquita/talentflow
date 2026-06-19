"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Mail, Phone, ShieldCheck, ShieldAlert, ShieldX, AlertTriangle } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth";

// ── CV Quality Section (interna ao modal) ──────────────────────────────
function QualitySection({
  score,
  tier,
  alerts,
}: {
  score: number | null;
  tier: string | null;
  alerts: string[];
}) {
  if (score === null) return null;

  const tierConfig = {
    high:   { Icon: ShieldCheck, color: "text-emerald-400", bar: "bg-emerald-500",  label: "Alto",  border: "border-emerald-500/20", bg: "bg-emerald-500/8"  },
    medium: { Icon: ShieldAlert, color: "text-amber-400",   bar: "bg-amber-500",    label: "Médio", border: "border-amber-500/20",   bg: "bg-amber-500/8"    },
    low:    { Icon: ShieldX,     color: "text-rose-400",    bar: "bg-rose-500",     label: "Baixo", border: "border-rose-500/20",    bg: "bg-rose-500/8"     },
  };

  const cfg = tierConfig[(tier ?? "low") as keyof typeof tierConfig];
  const { Icon } = cfg;

  return (
    <div className={`mb-8 p-4 rounded-xl border ${cfg.border} ${cfg.bg}`}>
      <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Qualidade do Currículo
      </h4>

      {/* Score + tier */}
      <div className="flex items-center justify-between mb-2">
        <div className={`flex items-center gap-2 font-bold text-lg ${cfg.color}`}>
          <Icon className="w-5 h-5" />
          <span>{score}<span className="text-sm font-normal text-slate-500">/100</span></span>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.border} ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      {/* Barra de progresso */}
      <div className="w-full bg-slate-800 rounded-full h-1.5 mb-4">
        <div
          className={`h-1.5 rounded-full transition-all duration-700 ${cfg.bar}`}
          style={{ width: `${Math.max(score, 2)}%` }}
        />
      </div>

      {/* Alertas de campos ausentes */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Campos que merecem atenção</p>
          {alerts.map((alert, i) => {
            // Extrai o nome do campo do alerta para exibir de forma limpa
            const match = alert.match(/Campo '([^']+)'/);
            const fieldName = match ? match[1] : alert;
            return (
              <div key={i} className="flex items-start gap-2 text-xs text-amber-300/80">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
                <span>{fieldName} está sem informação no currículo.</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


export default function CandidateModal({ candidateId, onClose }: { candidateId: string, onClose: () => void }) {
  const router = useRouter();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [flagging, setFlagging] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [submittingFlag, setSubmittingFlag] = useState(false);

  useEffect(() => {
    async function fetchCandidate() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_URL}/api/candidates/${candidateId}`, {
          headers: getAuthHeaders()
        });
        if (res.ok) {
          setCandidate(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchCandidate();
  }, [candidateId]);

  async function handleFlag() {
    if (!flagReason.trim()) return;
    setSubmittingFlag(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/candidates/${candidateId}/flag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ reason: flagReason }),
      });
      if (res.ok) {
        const updatedCandidate = await res.json();
        setCandidate((prev: any) => ({
          ...prev,
          is_flagged: updatedCandidate.is_flagged,
          flagged_reason: updatedCandidate.flagged_reason,
          flagged_at: updatedCandidate.flagged_at
        }));
        setFlagging(false);
        setFlagReason("");
        router.refresh();
      }
    } catch (e) {
      console.error("Erro ao sinalizar candidato:", e);
    } finally {
      setSubmittingFlag(false);
    }
  }

  async function handleUnflag() {
    if (!window.confirm("Deseja realmente remover a sinalização deste candidato?")) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/candidates/${candidateId}/unflag`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const updatedCandidate = await res.json();
        setCandidate((prev: any) => ({
          ...prev,
          is_flagged: updatedCandidate.is_flagged,
          flagged_reason: null,
          flagged_at: null
        }));
        router.refresh();
      }
    } catch (e) {
      console.error("Erro ao remover sinalização do candidato:", e);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="sticky top-0 bg-slate-900/80 backdrop-blur border-b border-slate-800 p-6 flex justify-between items-center z-10">
          <h3 className="font-semibold text-lg text-slate-200">Perfil do Candidato</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-20 text-indigo-400">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-400"></div>
            </div>
          ) : candidate ? (
            <>
              {candidate.is_flagged && (
                <div className="mb-6 p-4 rounded-xl border border-red-500/25 bg-red-500/10 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0 text-red-400" />
                  <div>
                    <h4 className="text-sm font-bold text-red-200">Candidato Sinalizado (Blacklist)</h4>
                    <p className="text-xs text-red-300/80 mt-1 leading-relaxed">{candidate.flagged_reason}</p>
                    {candidate.flagged_at && (
                      <p className="text-[10px] text-red-400/60 mt-1.5 font-medium uppercase">
                        Sinalizado em: {new Date(candidate.flagged_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mb-8">
                {candidate.photo_url ? (
                  <img
                    src={candidate.photo_url}
                    alt={candidate.full_name}
                    className="w-16 h-16 rounded-full object-cover border border-indigo-500/30 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xl font-bold text-indigo-400 uppercase shrink-0">
                    {candidate.full_name.substring(0, 2)}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-slate-100">{candidate.full_name}</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {candidate.categories.map((c: string) => (
                       <span key={c} className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded-md">{c}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {candidate.email && (
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <Mail className="w-4 h-4 text-slate-500" /> {candidate.email}
                  </div>
                )}
                {candidate.phone && (
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <Phone className="w-4 h-4 text-slate-500" /> {candidate.phone}
                  </div>
                )}
              </div>

              {/* Blacklist Control Section */}
              <div className="mb-6 p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Sinalização / Blacklist
                  </span>
                  {!candidate.is_flagged ? (
                    !flagging && (
                      <button
                        onClick={() => setFlagging(true)}
                        className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors uppercase"
                      >
                        Sinalizar Perfil
                      </button>
                    )
                  ) : (
                    <button
                      onClick={handleUnflag}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors uppercase"
                    >
                      Remover Blacklist
                    </button>
                  )}
                </div>

                {flagging && (
                  <div className="mt-3 space-y-3">
                    <textarea
                      placeholder="Motivo da sinalização..."
                      value={flagReason}
                      onChange={(e) => setFlagReason(e.target.value)}
                      className="w-full h-20 p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500/50 resize-none transition-all"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setFlagging(false);
                          setFlagReason("");
                        }}
                        disabled={submittingFlag}
                        className="px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleFlag}
                        disabled={submittingFlag || !flagReason.trim()}
                        className="px-2.5 py-1.5 rounded-md text-xs font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-55 disabled:cursor-not-allowed transition-all"
                      >
                        {submittingFlag ? "Sinalizando..." : "Confirmar"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <QualitySection
                score={candidate.quality_score ?? null}
                tier={candidate.quality_tier ?? null}
                alerts={candidate.quality_alerts ?? []}
              />

              <div className="mb-8">
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill: string) => (
                    <span key={skill} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Experiência</h4>
                <div className="space-y-4">
                  {candidate.experiences.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">Nenhuma experiência extraída.</p>
                  ) : (
                    candidate.experiences.map((exp: any, i: number) => (
                      <div key={i} className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
                        <div className="font-semibold text-slate-200 mb-1">{exp.title}</div>
                        <div className="text-sm text-indigo-400 font-medium mb-2">{exp.company}</div>
                        {exp.desc && <p className="text-sm text-slate-400 leading-relaxed">{exp.desc}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-red-400">Erro ao carregar perfil.</div>
          )}
        </div>
      </div>
    </div>
  );
}
