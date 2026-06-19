'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Target, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getAuthHeaders } from '@/lib/auth';

interface Match {
  candidate_id: string;
  full_name: string;
  match_score: number;
  matched_skills: string[];
}

interface MatchResponse {
  job_title: string;
  matches: Match[];
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-white/5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-2">
          <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-3 w-24 bg-slate-200/60 dark:bg-slate-900 rounded" />
        </div>
      </div>
      <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
    </div>
  );
}

export default function JobMatchViewer() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');

  const [data, setData] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setData(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    fetch(`${API_URL}/api/jobs/${jobId}/match`, { headers: getAuthHeaders() })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError('Erro ao carregar compatibilidade. Verifique se a API está rodando.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  // Estado vazio
  if (!jobId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-24">
        <Target className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-lg font-medium text-muted-foreground">Selecione uma vaga ao lado</p>
        <p className="text-sm mt-1">O motor de inteligência irá cruzar os perfis automaticamente.</p>
      </div>
    );
  }

  // Skeleton loader
  if (loading) {
    return (
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-5 w-32 bg-slate-200/60 dark:bg-slate-900 rounded animate-pulse" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  // Erro
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-400 py-24">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  // Resultado
  return (
    <>
      <div className="flex items-center justify-between border-b border-border dark:border-white/5 pb-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground">{data?.job_title}</h3>
          <p className="text-sm text-primary font-medium mt-1">Ranking de Compatibilidade</p>
        </div>
      </div>

      <div className="space-y-3">
        {!data?.matches?.length ? (
          <p className="text-sm text-muted-foreground">Nenhum candidato possui as skills exigidas por esta vaga.</p>
        ) : (
          data.matches.map((cand, idx) => (
            <div
              key={cand.candidate_id}
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-muted-foreground flex items-center justify-center text-xs font-bold border border-slate-200 dark:border-white/5">
                  #{idx + 1}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{cand.full_name}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {cand.matched_skills.map((s, i) => (
                      <span
                        key={i}
                        className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{cand.match_score}%</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Match Score
                  </div>
                </div>
                <Link
                  href={`/?candidateId=${cand.candidate_id}`}
                  className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all border border-primary/20"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
