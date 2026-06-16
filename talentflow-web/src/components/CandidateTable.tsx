"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, ShieldCheck, ShieldAlert, ShieldX, Trash2 } from "lucide-react";
import CandidateModal from "./CandidateModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

// ── CV Quality Badge ──────────────────────────────────────────────────────────
function QualityBadge({ score, tier }: { score: number | null; tier: string | null }) {
  if (score === null || tier === null) {
    return <span className="text-xs text-slate-600 italic">—</span>;
  }

  const configs = {
    high:   { label: `${score}`, icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/25" },
    medium: { label: `${score}`, icon: ShieldAlert, color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/25" },
    low:    { label: `${score}`, icon: ShieldX,     color: "text-rose-400",    bg: "bg-rose-500/10 border-rose-500/25" },
  };

  const cfg = configs[tier as keyof typeof configs] ?? configs.low;
  const Icon = cfg.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}<span className="font-normal opacity-60">/100</span>
    </span>
  );
}

export default function CandidateTable({
  candidates,
  initialCandidateId,
}: {
  candidates: any[];
  initialCandidateId?: string;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(initialCandidateId ?? null);
  const [processingCount, setProcessingCount] = useState<number>(0);
  const [newCandidateIds, setNewCandidateIds] = useState<Set<string>>(new Set());
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [deleteCandidateName, setDeleteCandidateName] = useState<string>("");

  async function handleDeleteConfirm() {
    if (!deleteCandidateId) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/candidates/${deleteCandidateId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      } else {
        console.error('Falha ao deletar candidato');
      }
    } catch (e) {
      console.error('Erro ao chamar endpoint de deleção:', e);
    }
  }

  // Rastreia IDs dos candidatos da renderização anterior
  const prevCandidateIdsRef = useRef<Set<string>>(new Set(candidates.map(c => c.id)));
  // Timeout de segurança do polling
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Escuta evento global de novos uploads
  useEffect(() => {
    const handleProcessingStarted = (e: Event) => {
      const customEvent = e as CustomEvent<{ count: number }>;
      const count = customEvent.detail?.count || 1;
      
      setProcessingCount(prev => prev + count);

      // Inicia ou reinicia o timeout de segurança para parar após 60 segundos
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = setTimeout(() => {
        setProcessingCount(0);
      }, 60000);
    };

    window.addEventListener("candidates-processing-started", handleProcessingStarted);
    return () => {
      window.removeEventListener("candidates-processing-started", handleProcessingStarted);
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
    };
  }, []);

  // Loop de polling enquanto houver itens pendentes no back-end
  useEffect(() => {
    if (processingCount <= 0) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 2500);

    return () => clearInterval(interval);
  }, [processingCount, router]);

  // Compara candidatos para identificar novos registros e atualizar progresso
  useEffect(() => {
    const currentIds = new Set(candidates.map(c => c.id));
    const prevIds = prevCandidateIdsRef.current;

    // Filtra IDs que estão presentes agora mas não estavam antes
    const newlyAddedIds = candidates
      .map(c => c.id)
      .filter(id => !prevIds.has(id));

    if (newlyAddedIds.length > 0) {
      // Adiciona novos candidatos no estado de destaque visual (Glow)
      setNewCandidateIds(prev => {
        const updated = new Set(prev);
        newlyAddedIds.forEach(id => updated.add(id));
        return updated;
      });

      // Remove destaque após a animação de 5 segundos
      setTimeout(() => {
        setNewCandidateIds(prev => {
          const updated = new Set(prev);
          newlyAddedIds.forEach(id => updated.delete(id));
          return updated;
        });
      }, 5000);

      // Decrementa o contador de processamentos pendentes
      setProcessingCount(prev => Math.max(0, prev - newlyAddedIds.length));

      // Limpa o timeout de segurança se finalizou
      if (processingCount - newlyAddedIds.length <= 0 && pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    }

    // Atualiza a referência para a próxima re-renderização
    prevCandidateIdsRef.current = currentIds;
  }, [candidates, processingCount]);

  return (
    <>
      {processingCount > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium animate-pulse">
          <div className="flex items-center gap-2.5">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Processando {processingCount} currículo{processingCount !== 1 ? 's' : ''} no motor de triagem...</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Extraindo skills via IA</span>
          </div>
        </div>
      )}

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/80 text-xs uppercase text-slate-500 border-b border-slate-800 font-semibold tracking-wider">
            <tr>
              <th className="px-6 py-4">Candidato</th>
              <th className="px-6 py-4">Cargo Atual / Último</th>
              <th className="px-6 py-4">Skills Identificadas</th>
              <th className="px-6 py-4">Qualidade CV</th>
              <th className="px-6 py-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {candidates.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Nenhum candidato encontrado.</td>
              </tr>
            ) : (
              candidates.map((cand: any) => (
                <tr 
                  key={cand.id} 
                  className={`hover:bg-slate-800/30 transition-all duration-300 group ${
                    newCandidateIds.has(cand.id) ? 'animate-new-glow border-l-2 border-indigo-500' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {cand.photo_url ? (
                        <img 
                          src={cand.photo_url} 
                          alt={cand.full_name} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-700" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 border border-slate-700">
                          {cand.full_name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-slate-200">{cand.full_name}</div>
                        <div className="text-xs text-slate-500">{cand.categories[0] || 'Geral'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-300">{cand.current_job || 'Não informado'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {cand.skills.slice(0, 3).map((s: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <QualityBadge score={cand.quality_score} tier={cand.quality_tier} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <button 
                        onClick={() => setSelectedId(cand.id)} 
                        className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                      >
                        Ver Perfil
                      </button>
                      <button
                        onClick={() => {
                          setDeleteCandidateId(cand.id);
                          setDeleteCandidateName(cand.full_name);
                        }}
                        className="text-slate-500 hover:text-rose-450 transition-colors p-1"
                        title="Excluir Candidato"
                        aria-label={`Excluir candidato ${cand.full_name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedId && (
        <CandidateModal candidateId={selectedId} onClose={() => setSelectedId(null)} />
      )}

      <DeleteConfirmModal
        isOpen={deleteCandidateId !== null}
        onClose={() => setDeleteCandidateId(null)}
        onConfirm={handleDeleteConfirm}
        candidateName={deleteCandidateName}
      />
    </>
  );
}
