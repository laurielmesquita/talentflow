'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Users, 
  Target,
  Layers, 
  AlertTriangle, 
  TrendingUp, 
  UserCheck, 
  FileText, 
  Sparkles, 
  Clock, 
  ArrowRight,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getSession } from '@/lib/auth';
import { apiFetch } from '@/lib/api';

interface CandidateStats {
  total: number;
  added_today: number;
  average_quality: number;
  flagged_count: number;
}

interface JobStats {
  total: number;
  active: number;
  upcoming_deadlines: number;
}

interface CategoryStats {
  total: number;
  uncategorized: number;
  top_category: {
    name: string;
    count: number;
  };
}

interface RecentCandidate {
  id: string;
  full_name: string;
  current_job: string;
  quality_score: number | null;
  photo_url: string | null;
  created_at: string | null;
}

interface DashboardStats {
  candidates: CandidateStats;
  jobs: JobStats;
  categories: CategoryStats;
  recent_candidates: RecentCandidate[];
}

interface Job {
  id: string;
  title: string;
  deadline: string;
  is_active: boolean;
}

interface Match {
  candidate_id: string;
  full_name: string;
  current_job: string;
  photo_url: string | null;
  match_score: number;
  matched_skills: string[];
  total_skills_cand: number;
}

interface DashboardClientProps {
  initialStats: DashboardStats;
  initialJobs: Job[];
}

// ── Componente de Animação Numérica de KPIs (NumberTicker) ────────────────────
function NumberTicker({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }
    const duration = 1000;
    const startTime = performance.now();

    const animateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(eased * end);
      setDisplayValue(current);
      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      }
    };

    requestAnimationFrame(animateNumber);
  }, [value]);

  return (
    <span className="tabular-nums font-mono font-extrabold tracking-tight">
      {displayValue}{suffix}
    </span>
  );
}

export default function DashboardClient({ initialStats, initialJobs }: DashboardClientProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobs[0]?.id || '');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  
  const [, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const session = getSession();
    setUserRole(session.role);
    setUserName(session.name);
  }, []);

  const matchesCache = useRef<Map<string, any[]>>(new Map());
  const activeJobs = initialJobs.filter(j => j.is_active);

  useEffect(() => {
    if (!selectedJobId) return;

    async function fetchMatches() {
      const cached = matchesCache.current.get(selectedJobId);
      if (cached) {
        setMatches(cached);
        return;
      }

      setLoadingMatches(true);
      try {
        const data = await apiFetch(`/api/jobs/${selectedJobId}/match`);
        const matchList = data.matches || [];
        matchesCache.current.set(selectedJobId, matchList);
        setMatches(matchList);
      } catch (err) {
        console.error("Erro ao buscar matches no Dashboard:", err);
      } finally {
        setLoadingMatches(false);
      }
    }

    fetchMatches();
  }, [selectedJobId]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formatTimeAgo = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Agora mesmo";
      if (diffMins < 60) return `Há ${diffMins} min`;
      if (diffHours < 24) return `Há ${diffHours} h`;
      return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    } catch {
      return "Recém adicionado";
    }
  };

  const getQualityTier = (score: number | null) => {
    if (score === null) return { name: "N/A", color: "text-muted-foreground bg-muted border-border/40" };
    if (score >= 80) return { name: "Excelente", color: "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    if (score >= 60) return { name: "Bom", color: "text-blue-500 dark:text-blue-400 bg-blue-500/10 border-blue-500/20" };
    return { name: "Regular", color: "text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/20" };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-300 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[25%] right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div>
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Welcome Room Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1.5 text-xs font-medium uppercase tracking-wider text-primary">
              <Sparkles className="w-4 h-4" />
              Painel Tático Operacional
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
              Olá, {userName || 'Recrutador'}
            </h2>
            <p className="text-muted-foreground max-w-2xl text-xs sm:text-sm leading-relaxed">
              Sua sala de controle tático. Acompanhe prioridades operacionais, inteligência de banco de talentos e o status dos processos seletivos ativos.
            </p>
          </div>

          {/* Bento Grid Layout Minimalista */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {/* Bloco 1: Ativos - Candidatos */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="bg-card border border-border/60 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-border hover:bg-accent/30 transition-all duration-200"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ativo Principal</span>
                  <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">Banco de Talentos</h3>
                <div className="flex items-baseline gap-2 mb-4 text-3xl font-bold text-foreground">
                  <NumberTicker value={initialStats.candidates.total} />
                  <span className="text-xs font-normal text-muted-foreground">candidatos</span>
                </div>
                
                <div className="space-y-2 border-t border-border/40 pt-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" /> Ingeridos nas últimas 24h:
                    </span>
                    <span className="font-semibold text-foreground font-mono tabular-nums">{initialStats.candidates.added_today}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Qualidade média:
                    </span>
                    <span className="font-semibold text-foreground font-mono tabular-nums">{initialStats.candidates.average_quality}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-destructive" /> Em restrição:
                    </span>
                    <span className={`font-semibold font-mono tabular-nums ${initialStats.candidates.flagged_count > 0 ? 'text-destructive font-bold' : 'text-foreground'}`}>
                      {initialStats.candidates.flagged_count}
                    </span>
                  </div>
                </div>
              </div>

              <Link href="/candidates" className="mt-5 flex items-center justify-between text-xs font-medium text-primary hover:text-primary-foreground group bg-primary/10 hover:bg-primary px-3.5 py-2 rounded-lg border border-primary/20 transition-all duration-200">
                Acessar Banco de Talentos
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Bloco 2: Pipelines - Vagas */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="bg-card border border-border/60 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-border hover:bg-accent/30 transition-all duration-200"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Demandas</span>
                  <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <Target className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">Vagas & Processos</h3>
                <div className="flex items-baseline gap-2 mb-4 text-3xl font-bold text-primary">
                  <NumberTicker value={initialStats.jobs.active} />
                  <span className="text-xs font-normal text-muted-foreground">vagas ativas</span>
                </div>

                <div className="space-y-2 border-t border-border/40 pt-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Registradas Totais:</span>
                    <span className="font-semibold text-foreground font-mono tabular-nums">{initialStats.jobs.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Prazos críticos (7 dias):
                    </span>
                    <span className={`font-semibold px-2 py-0.5 rounded-md text-[11px] font-mono tabular-nums ${
                      initialStats.jobs.upcoming_deadlines > 0 
                        ? 'bg-destructive/10 text-destructive font-bold border border-destructive/20' 
                        : 'text-foreground'
                    }`}>
                      {initialStats.jobs.upcoming_deadlines} vaga{initialStats.jobs.upcoming_deadlines !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              <Link href="/jobs" className="mt-5 flex items-center justify-between text-xs font-medium text-primary hover:text-primary-foreground group bg-primary/10 hover:bg-primary px-3.5 py-2 rounded-lg border border-primary/20 transition-all duration-200">
                Gerenciar Vagas
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Bloco 3: Organização - Categorias */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="bg-card border border-border/60 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-border hover:bg-accent/30 transition-all duration-200"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Taxonomia</span>
                  <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">Tags & Categorias</h3>
                <div className="flex items-baseline gap-2 mb-4 text-3xl font-bold text-foreground">
                  <NumberTicker value={initialStats.categories.total} />
                  <span className="text-xs font-normal text-muted-foreground">categorias</span>
                </div>

                <div className="space-y-2 border-t border-border/40 pt-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Sem tag (ponto cego):
                    </span>
                    <span className={`font-semibold px-2 py-0.5 rounded-md text-[11px] font-mono tabular-nums ${
                      initialStats.categories.uncategorized > 0 
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                        : 'text-foreground'
                    }`}>
                      {initialStats.categories.uncategorized} talentos
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Maior concentração:</span>
                    <span className="font-semibold text-foreground text-xs truncate max-w-[130px]" title={initialStats.categories.top_category.name}>
                      {initialStats.categories.top_category.name}
                    </span>
                  </div>
                </div>
              </div>

              <Link href="/categories" className="mt-5 flex items-center justify-between text-xs font-medium text-primary hover:text-primary-foreground group bg-primary/10 hover:bg-primary px-3.5 py-2 rounded-lg border border-primary/20 transition-all duration-200">
                Configurar Categorias
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Bloco 4 (Spans 2 columns on lg): Candidate Matching Scores */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 bg-card border border-border/60 rounded-xl p-5 shadow-xs flex flex-col justify-between min-h-[360px]"
            >
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-primary" />
                      Candidate Matching Scores
                    </h3>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      Selecione uma vaga para consultar a pontuação de compatibilidade em tempo real.
                    </p>
                  </div>
                  
                  {/* Styled Selector */}
                  <div className="relative">
                    {activeJobs.length > 0 ? (
                      <select
                        value={selectedJobId}
                        onChange={(e) => setSelectedJobId(e.target.value)}
                        className="w-full sm:w-[200px] bg-background border border-border text-foreground px-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring shadow-xs cursor-pointer"
                      >
                        {activeJobs.map((job) => (
                          <option key={job.id} value={job.id}>
                            {job.title}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-1.5 rounded-lg font-medium">
                        Nenhuma vaga ativa
                      </div>
                    )}
                  </div>
                </div>

                {/* Loading State */}
                {loadingMatches ? (
                  <div className="h-44 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : matches.length > 0 ? (
                  <div className="space-y-2.5">
                    {matches.slice(0, 3).map((match, idx) => (
                      <div 
                        key={match.candidate_id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-accent/40 border border-border/40 transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-mono font-bold text-muted-foreground w-4">
                            #{idx + 1}
                          </span>
                          
                          {match.photo_url ? (
                            <img 
                              src={match.photo_url} 
                              alt={match.full_name} 
                              className="w-9 h-9 rounded-full object-cover border border-border/50"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs border border-border/50">
                              {getInitials(match.full_name)}
                            </div>
                          )}
                          
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-foreground truncate">{match.full_name}</h4>
                            <p className="text-muted-foreground text-[11px] truncate max-w-[180px] sm:max-w-[280px]">
                              {match.current_job || "Não informado"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-md text-xs font-bold font-mono tabular-nums border ${
                            match.match_score >= 80 
                              ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20' 
                              : match.match_score >= 50 
                                ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20' 
                                : 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20'
                          }`}>
                            {match.match_score}% Match
                          </span>

                          <Link 
                            href={`/candidates?candidateId=${match.candidate_id}`}
                            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Ver Perfil Completo"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                    {matches.length > 3 && (
                      <div className="text-right pt-1">
                        <Link 
                          href="/smart-match" 
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          Ver todos os {matches.length} matches no Smart Match
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-44 border border-dashed border-border/60 rounded-lg flex flex-col items-center justify-center text-center p-6 bg-muted/10">
                    <AlertTriangle className="w-6 h-6 text-muted-foreground mb-1.5 opacity-60" />
                    <h5 className="text-xs font-semibold text-foreground mb-0.5">Nenhum match calculado</h5>
                    <p className="text-muted-foreground text-[11px] max-w-sm">
                      Não há candidatos com habilidades compatíveis com esta vaga.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Bloco 5: Últimas Ingestões IA */}
            <motion.div
              variants={itemVariants}
              className="bg-card border border-border/60 rounded-xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <h3 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-primary" />
                  Últimas Ingestões IA
                </h3>
                <p className="text-muted-foreground text-xs mb-4">
                  Currículos indexados recentemente pelo motor cognitivo.
                </p>

                <div className="space-y-3">
                  {initialStats.recent_candidates.length > 0 ? (
                    initialStats.recent_candidates.map((cand) => {
                      const tier = getQualityTier(cand.quality_score);
                      return (
                        <div key={cand.id} className="flex justify-between items-start border-b border-border/40 pb-2.5 last:border-b-0 last:pb-0">
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-foreground truncate max-w-[150px]">{cand.full_name}</h4>
                            <p className="text-[11px] text-muted-foreground truncate max-w-[150px]">{cand.current_job || "Não informado"}</p>
                            <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1 mt-0.5 font-mono">
                              <Clock className="w-2.5 h-2.5" /> {mounted ? formatTimeAgo(cand.created_at) : "Aguardando..."}
                            </span>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold font-mono tabular-nums border ${tier.color}`}>
                              {tier.name} ({cand.quality_score ?? 0}%)
                            </span>
                            <Link 
                              href={`/candidates?candidateId=${cand.id}`} 
                              className="text-[10px] font-medium text-primary hover:underline flex items-center"
                            >
                              Ver perfil
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-36 flex flex-col items-center justify-center text-center p-4">
                      <FileText className="w-6 h-6 text-muted-foreground mb-1 opacity-50" />
                      <span className="text-xs font-medium text-muted-foreground">Nenhum currículo importado</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

