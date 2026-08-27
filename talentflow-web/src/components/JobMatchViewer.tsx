'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Target, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface Match {
  candidate_id: string;
  full_name: string;
  match_score: number;
  matched_skills: string[];
  match_justification?: string;
}

interface MatchResponse {
  job_title: string;
  matches: Match[];
}

function SkeletonRow() {
  return (
    <div className="flex flex-col p-4 rounded-xl border border-border/40 bg-muted/20 animate-pulse gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted" />
          <div className="space-y-1.5">
            <div className="h-4 w-40 bg-muted rounded" />
            <div className="h-3 w-24 bg-muted/60 rounded" />
          </div>
        </div>
        <div className="h-6 w-16 bg-muted rounded" />
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full" />
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
    let cancelled = false;
    queueMicrotask(() => {
      if (!jobId) {
        setData(null);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      apiFetch<MatchResponse>(`/api/jobs/${jobId}/match`)
        .then((json) => {
          if (!cancelled) { setData(json); setLoading(false); }
        })
        .catch(() => {
          if (!cancelled) {
            setError('Erro ao carregar compatibilidade. Verifique se a API está rodando.');
            setLoading(false);
          }
        });
    });

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  // Estado vazio
  if (!jobId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-20">
        <div className="w-14 h-14 bg-accent/50 border border-primary/20 flex items-center justify-center mb-4 text-primary">
          <Target className="w-7 h-7 animate-pulse" />
        </div>
        <p className="text-base font-semibold text-foreground">Selecione uma vaga ao lado</p>
        <p className="text-xs text-muted-foreground mt-1 text-center max-w-xs">
          O motor de inteligência IA cruzará automaticamente as competências exigidas com o banco de talentos.
        </p>
      </div>
    );
  }

  // Skeleton loader
  if (loading) {
    return (
      <div className="space-y-3 pt-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-5 w-48 bg-muted rounded animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  // Erro
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-destructive py-16">
        <p className="text-xs font-medium bg-destructive/10 border border-destructive/20 px-4 py-2 rounded-lg">{error}</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
  } as const;

  // Resultado High-Tech Linear Style
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground tracking-tight">Ranking de Compatibilidade IA</h3>
        </div>
        <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
          {data?.matches?.length ?? 0} candidato(s) encontrados
        </span>
      </div>

      <AnimatePresence mode="wait">
        {!data?.matches?.length ? (
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-xs text-muted-foreground py-8 text-center"
          >
            Nenhum candidato atinge a régua mínima de compatibilidade para esta vaga.
          </motion.p>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {data.matches.map((cand, idx) => (
              <motion.div
                key={cand.candidate_id}
                variants={itemVariants}
                whileHover={{ y: -1 }}
                className="group relative flex flex-col p-4 rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:bg-accent/40 transition-all duration-200 shadow-xs hover:shadow-[0_0_20px_rgba(var(--primary),0.08)]"
              >
                {/* Header do Card de Match */}
                <div className="flex items-center justify-between gap-4">
                  {/* Informações Rápidas */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                      #{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{cand.full_name}</p>
                      {/* Skills Correspondentes */}
                      <div className="flex gap-1 flex-wrap mt-1">
                        {cand.matched_skills.map((s, i) => (
                          <span
                            key={i}
                            className="text-[10px] uppercase font-semibold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Score Numérico Tabular & Ação */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-xl font-bold font-mono tabular-nums text-primary tracking-tight">
                        {cand.match_score}%
                      </div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono">
                        Afinidade
                      </div>
                    </div>
                    <Link
                      href={`/candidates?candidateId=${cand.candidate_id}`}
                      className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20"
                      title="Ver Perfil"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Barra de Progresso de Match Animada */}
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-3">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${cand.match_score}%` }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.15 * idx }}
                    className="h-full bg-primary"
                  />
                </div>

                {/* Justificativa de IA */}
                {cand.match_justification && (
                  <motion.div 
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + 0.1 * idx }}
                    className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/15 text-xs text-foreground leading-relaxed flex items-start gap-2.5 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-semibold text-primary mr-1">Análise de IA:</span>
                      <span className="text-muted-foreground">{cand.match_justification}</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
