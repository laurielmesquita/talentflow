'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Users, 
  Briefcase, 
  Layers, 
  AlertTriangle, 
  CheckCircle, 
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
import { getSession, getAuthHeaders } from '@/lib/auth';

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

export default function DashboardClient({ initialStats, initialJobs }: DashboardClientProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobs[0]?.id || '');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const session = getSession();
    setUserRole(session.role);
    setUserName(session.name);
  }, []);

  // Filtra apenas as vagas ativas para exibição no dropdown
  const activeJobs = initialJobs.filter(j => j.is_active);

  useEffect(() => {
    if (!selectedJobId) return;

    async function fetchMatches() {
      setLoadingMatches(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_URL}/api/jobs/${selectedJobId}/match`, {
          headers: getAuthHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          setMatches(data.matches || []);
        }
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
    if (score === null) return { name: "N/A", color: "text-muted-foreground bg-muted/10 border-muted/20" };
    if (score >= 80) return { name: "Excelente", color: "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    if (score >= 60) return { name: "Bom", color: "text-blue-500 dark:text-blue-400 bg-blue-500/10 border-blue-500/20" };
    return { name: "Regular", color: "text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/20" };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-300 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[25%] right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div>
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Welcome Room Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="w-4 h-4" />
              Painel Tático Operacional
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-3 animate-fade-in">
              Olá, {userName || 'Recrutador'}
            </h2>
            <p className="text-muted-foreground max-w-3xl leading-relaxed text-sm">
              Esta é sua sala de boas-vindas. Decida suas prioridades operacionais a partir das métricas 
              atualizadas do banco de talentos, das urgências de vagas e dos índices organizacionais.
            </p>
          </div>

          {/* Bento Grid Layout */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Bloco 1: Ativos - Candidatos */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-card/40 backdrop-blur-md border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-primary/40 hover:shadow-[0_0_30px_-10px_rgba(var(--color-primary),0.1)] transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ativo Principal</span>
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-1">Banco de Talentos</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-extrabold tracking-tight">{initialStats.candidates.total}</span>
                  <span className="text-xs text-muted-foreground">candidatos ativos</span>
                </div>
                
                <div className="space-y-2 border-t border-border/50 pt-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" /> Ingeridos nas últimas 24h:
                    </span>
                    <span className="font-semibold text-foreground">{initialStats.candidates.added_today}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Qualidade média de currículo:
                    </span>
                    <span className="font-semibold text-foreground">{initialStats.candidates.average_quality}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Candidatos em restrição:
                    </span>
                    <span className={`font-semibold ${initialStats.candidates.flagged_count > 0 ? 'text-rose-500 font-bold' : 'text-foreground'}`}>
                      {initialStats.candidates.flagged_count}
                    </span>
                  </div>
                </div>
              </div>

              <Link href="/candidates" className="mt-6 flex items-center justify-between text-xs font-semibold text-primary hover:text-primary-foreground group bg-primary/5 hover:bg-primary px-4 py-2.5 rounded-xl border border-primary/10 hover:border-primary transition-all">
                Acessar Banco de Talentos
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Bloco 2: Pipelines - Vagas */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-card/40 backdrop-blur-md border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-cyan-500/40 hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.1)] transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Metas e Demandas</span>
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
                    <Briefcase className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-1">Vagas & Processos</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-extrabold tracking-tight text-cyan-600 dark:text-cyan-400">{initialStats.jobs.active}</span>
                  <span className="text-xs text-muted-foreground">vagas ativas</span>
                </div>

                <div className="space-y-2 border-t border-border/50 pt-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Vagas Registradas Totais:</span>
                    <span className="font-semibold text-foreground">{initialStats.jobs.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Prazos críticos (7 dias):
                    </span>
                    <span className={`font-semibold px-2 py-0.5 rounded text-xs ${
                      initialStats.jobs.upcoming_deadlines > 0 
                        ? 'bg-rose-500/10 text-rose-500 font-bold border border-rose-500/20' 
                        : 'text-foreground'
                    }`}>
                      {initialStats.jobs.upcoming_deadlines} vaga{initialStats.jobs.upcoming_deadlines !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              <Link href="/jobs" className="mt-6 flex items-center justify-between text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-white group bg-cyan-500/5 hover:bg-cyan-500 px-4 py-2.5 rounded-xl border border-cyan-500/10 hover:border-cyan-500 transition-all">
                Gerenciar Vagas Comerciais
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Bloco 3: Organização - Categorias */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-card/40 backdrop-blur-md border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-indigo-500/40 hover:shadow-[0_0_30px_-10px_rgba(99,102,241,0.1)] transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estruturação</span>
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-1">Tags & Categorias</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">{initialStats.categories.total}</span>
                  <span className="text-xs text-muted-foreground">categorias</span>
                </div>

                <div className="space-y-2 border-t border-border/50 pt-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Candidatos sem tag (ponto cego):
                    </span>
                    <span className={`font-semibold px-2 py-0.5 rounded text-xs ${
                      initialStats.categories.uncategorized > 0 
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20' 
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

              <Link href="/categories" className="mt-6 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-white group bg-indigo-500/5 hover:bg-indigo-500 px-4 py-2.5 rounded-xl border border-indigo-500/10 hover:border-indigo-500 transition-all">
                Configurar Categorias
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Bloco 4 (Spans 2 columns on lg): Candidate Matching Scores */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 bg-card/40 backdrop-blur-md border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[380px]"
            >
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-primary" />
                      Candidate Matching Scores
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      Selecione uma vaga para listar em tempo real os candidatos mais compatíveis.
                    </p>
                  </div>
                  
                  {/* Styled Selector */}
                  <div className="relative">
                    {activeJobs.length > 0 ? (
                      <select
                        value={selectedJobId}
                        onChange={(e) => setSelectedJobId(e.target.value)}
                        className="w-full sm:w-[220px] bg-background/80 dark:bg-card border border-border text-foreground px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary shadow-sm appearance-none cursor-pointer pr-8"
                      >
                        {activeJobs.map((job) => (
                          <option key={job.id} value={job.id}>
                            {job.title}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl font-medium">
                        Nenhuma vaga ativa cadastrada
                      </div>
                    )}
                    {activeJobs.length > 0 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-[10px]">
                        ▼
                      </div>
                    )}
                  </div>
                </div>

                {/* Loading State */}
                {loadingMatches ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : matches.length > 0 ? (
                  <div className="space-y-3">
                    {matches.slice(0, 3).map((match, idx) => (
                      <div 
                        key={match.candidate_id} 
                        className="flex items-center justify-between p-3.5 rounded-xl bg-background/50 hover:bg-primary/5 border border-border/40 hover:border-primary/20 transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Rank number */}
                          <span className="text-xs font-bold text-muted-foreground w-4">
                            {idx + 1}
                          </span>
                          
                          {/* Photo / Avatar fallback */}
                          {match.photo_url ? (
                            <img 
                              src={match.photo_url} 
                              alt={match.full_name} 
                              className="w-10 h-10 rounded-full object-cover border border-border/50"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
                              {getInitials(match.full_name)}
                            </div>
                          )}
                          
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-foreground truncate">{match.full_name}</h4>
                            <p className="text-muted-foreground text-xs truncate max-w-[180px] sm:max-w-[300px]">
                              {match.current_job || "Não informado"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Match Score pill */}
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
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
                            className="p-1 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                            title="Ver Perfil Completo"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                    {matches.length > 3 && (
                      <div className="text-right">
                        <Link 
                          href="/jobs" 
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          Ver todos os {matches.length} matches no painel de vagas
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-48 border border-dashed border-border/60 rounded-xl flex flex-col items-center justify-center text-center p-6 bg-background/25">
                    <AlertTriangle className="w-8 h-8 text-muted-foreground mb-2" />
                    <h5 className="text-sm font-semibold text-foreground mb-1">Nenhum match calculado</h5>
                    <p className="text-muted-foreground text-xs max-w-sm">
                      Não há candidatos com correspondências de competências para esta vaga. Certifique-se de que a vaga possua requisitos de habilidades válidos.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Bloco 5: Últimas Ingestões IA */}
            <motion.div
              variants={itemVariants}
              className="bg-card/40 backdrop-blur-md border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  Últimas Ingestões IA
                </h3>
                <p className="text-muted-foreground text-xs mb-5">
                  Resumos de currículos recentemente indexados pelo motor cognitivo do TalentFlow.
                </p>

                <div className="space-y-4">
                  {initialStats.recent_candidates.length > 0 ? (
                    initialStats.recent_candidates.map((cand) => {
                      const tier = getQualityTier(cand.quality_score);
                      return (
                        <div key={cand.id} className="flex justify-between items-start border-b border-border/30 pb-3 last:border-b-0 last:pb-0">
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-foreground truncate max-w-[160px]">{cand.full_name}</h4>
                            <p className="text-[10px] text-muted-foreground truncate max-w-[160px]">{cand.current_job || "Não informado"}</p>
                            <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1 mt-1">
                              <Clock className="w-2.5 h-2.5" /> {mounted ? formatTimeAgo(cand.created_at) : "Aguardando..."}
                            </span>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${tier.color}`}>
                              {tier.name} ({cand.quality_score ?? 0}%)
                            </span>
                            <Link 
                              href={`/candidates?candidateId=${cand.id}`} 
                              className="text-[10px] font-bold text-primary hover:underline flex items-center"
                            >
                              Ver perfil
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-40 flex flex-col items-center justify-center text-center p-4">
                      <FileText className="w-7 h-7 text-muted-foreground mb-1" />
                      <span className="text-xs font-medium text-muted-foreground">Nenhum currículo importado</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>

      {/* Footer is already rendered globally by layout.tsx */}
    </div>
  );
}
