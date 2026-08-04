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
  Clock,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getSession } from '@/lib/auth';
import { apiFetch } from '@/lib/api';

// ── Types ────────────────────────────────────────────────────────────────────

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
  top_category: { name: string; count: number };
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

import type { Job } from "@/types";

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

// ── Animated Number ──────────────────────────────────────────────────────────
function NumberTicker({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const duration = 900;
    const startTime = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span className="tabular-nums font-mono font-bold tracking-tight">
      {display}{suffix}
    </span>
  );
}

// ── Stagger Variants ─────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
} as const;
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
} as const;

// ── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name: string) =>
  name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();

const formatTimeAgo = (dateStr: string | null) => {
  if (!dateStr) return 'N/A';
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Agora';
    if (mins < 60) return `${mins}min atrás`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atrás`;
    return `${Math.floor(hours / 24)}d atrás`;
  } catch { return 'Recente'; }
};

const scoreColor = (score: number | null) => {
  if (score === null) return 'text-muted-foreground';
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-blue-600 dark:text-blue-400';
  return 'text-amber-600 dark:text-amber-400';
};

const matchBadge = (score: number) => {
  if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
  if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
  return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
};

// ── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  title: string;
  value: number;
  valueSuffix?: string;
  icon: React.ReactNode;
  href: string;
  linkLabel: string;
  children?: React.ReactNode;
}

function KpiCard({ label, title, value, valueSuffix = '', icon, href, linkLabel, children }: KpiCardProps) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="bg-card border border-border/60 rounded-lg p-5 flex flex-col justify-between gap-5 shadow-xs hover:border-primary/25 hover:shadow-sm transition-all duration-200"
    >
      <div className="flex-1">
        {/* Label + Icon */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">
            {label}
          </span>
          <div className="p-1.5 rounded-md bg-primary/8 text-primary border border-primary/15">
            {icon}
          </div>
        </div>

        {/* Title */}
        <p className="text-[13px] font-medium text-muted-foreground mb-1">{title}</p>

        {/* Big Number */}
        <div className="text-[2rem] leading-none font-bold text-foreground mb-4">
          <NumberTicker value={value} suffix={valueSuffix} />
        </div>

        {/* Sub-rows */}
        {children && (
          <div className="border-t border-border/50 pt-3 space-y-2">
            {children}
          </div>
        )}
      </div>

      {/* CTA */}
      <Link
        href={href}
        className="flex items-center justify-between text-[12px] font-medium text-primary bg-primary/6 hover:bg-primary hover:text-primary-foreground px-3 py-2 rounded-md border border-primary/15 hover:border-primary transition-all duration-150 group"
      >
        {linkLabel}
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
      </Link>
    </motion.div>
  );
}

// ── SubRow helper ─────────────────────────────────────────────────────────────
function SubRow({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span className="text-muted-foreground flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className={`font-semibold font-mono tabular-nums ${highlight ? 'text-destructive' : 'text-foreground'}`}>
        {value}
      </span>
    </div>
  );
}

// ── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ photo_url, full_name }: { photo_url: string | null; full_name: string }) {
  if (photo_url) {
    return (
      <img
        src={photo_url}
        alt={full_name}
        className="w-8 h-8 rounded-full object-cover border border-border/60 flex-shrink-0"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
      {getInitials(full_name)}
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardClient({ initialStats, initialJobs }: DashboardClientProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobs[0]?.id || '');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);
  const matchesCache = useRef<Map<string, Match[]>>(new Map());
  const activeJobs = initialJobs.filter(j => j.is_active);

  useEffect(() => {
    setMounted(true);
    const session = getSession();
    setUserName(session.name);
  }, []);

  useEffect(() => {
    if (!selectedJobId) return;
    async function fetchMatches() {
      const cached = matchesCache.current.get(selectedJobId);
      if (cached) { setMatches(cached); return; }
      setLoadingMatches(true);
      try {
        const data = await apiFetch(`/api/jobs/${selectedJobId}/match`);
        const list = data.matches || [];
        matchesCache.current.set(selectedJobId, list);
        setMatches(list);
      } catch (err) {
        console.error('Erro ao buscar matches:', err);
      } finally {
        setLoadingMatches(false);
      }
    }
    fetchMatches();
  }, [selectedJobId]);

  return (
    <div className="flex-1 flex flex-col bg-background text-foreground selection:bg-primary/20">

      {/* Dot-grid background — sutil, não invasivo */}
      <div className="fixed inset-0 bg-dot-grid pointer-events-none opacity-60 -z-10" />

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="mb-8"
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-primary/70 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            Workspace
          </p>
          <h1 className="text-[1.65rem] font-semibold tracking-tight text-foreground mb-1.5">
            Olá, {userName || 'Recrutador'}
          </h1>
          <p className="text-[13px] text-muted-foreground leading-relaxed max-w-lg">
            Visão consolidada do seu banco de talentos, vagas ativas e scores de compatibilidade.
          </p>
        </motion.div>

        {/* ── Bento Grid ── */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >

          {/* KPI 1 — Candidatos */}
          <KpiCard
            label="Banco de Talentos"
            title="Candidatos indexados"
            value={initialStats.candidates.total}
            icon={<Users className="w-4 h-4" />}
            href="/candidates"
            linkLabel="Acessar banco"
          >
            <SubRow
              icon={<Clock className="w-3 h-3 text-primary/70" />}
              label="Ingeridos em 24h"
              value={initialStats.candidates.added_today}
            />
            <SubRow
              icon={<TrendingUp className="w-3 h-3 text-emerald-500" />}
              label="Qualidade média"
              value={`${initialStats.candidates.average_quality}%`}
            />
            <SubRow
              icon={<ShieldAlert className="w-3 h-3 text-destructive" />}
              label="Em restrição"
              value={initialStats.candidates.flagged_count}
              highlight={initialStats.candidates.flagged_count > 0}
            />
          </KpiCard>

          {/* KPI 2 — Vagas */}
          <KpiCard
            label="Demandas Ativas"
            title="Vagas em aberto"
            value={initialStats.jobs.active}
            icon={<Target className="w-4 h-4" />}
            href="/jobs"
            linkLabel="Gerenciar vagas"
          >
            <SubRow
              label="Total registradas"
              icon={<span className="w-3 h-3" />}
              value={initialStats.jobs.total}
            />
            <SubRow
              icon={<AlertTriangle className="w-3 h-3 text-amber-500" />}
              label="Prazos críticos (7d)"
              value={
                initialStats.jobs.upcoming_deadlines > 0
                  ? <span className="px-1.5 py-0.5 bg-destructive/10 text-destructive border border-destructive/20 rounded text-[11px]">
                      {initialStats.jobs.upcoming_deadlines}
                    </span>
                  : <span>0</span>
              }
            />
          </KpiCard>

          {/* KPI 3 — Categorias */}
          <KpiCard
            label="Taxonomia"
            title="Tags & Categorias"
            value={initialStats.categories.total}
            icon={<Layers className="w-4 h-4" />}
            href="/categories"
            linkLabel="Configurar categorias"
          >
            <SubRow
              icon={<AlertTriangle className="w-3 h-3 text-amber-500" />}
              label="Sem tag (ponto cego)"
              value={
                initialStats.categories.uncategorized > 0
                  ? <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 rounded text-[11px]">
                      {initialStats.categories.uncategorized}
                    </span>
                  : <span>0</span>
              }
            />
            <SubRow
              icon={<span className="w-3 h-3" />}
              label="Maior concentração"
              value={
                <span className="truncate max-w-[120px] block text-right" title={initialStats.categories.top_category.name}>
                  {initialStats.categories.top_category.name}
                </span>
              }
            />
          </KpiCard>

          {/* Bloco 4 — Candidate Matching (2 colunas) */}
          <motion.div
            variants={item}
            className="lg:col-span-2 bg-card border border-border/60 rounded-lg p-5 shadow-xs flex flex-col gap-4 hover:border-primary/20 transition-colors duration-200"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 mb-1 flex items-center gap-1.5">
                  <UserCheck className="w-3 h-3" />
                  Candidate Matching
                </p>
                <h2 className="text-[15px] font-semibold text-foreground tracking-tight">
                  Scores de Compatibilidade
                </h2>
              </div>
              {/* Selector */}
              {activeJobs.length > 0 ? (
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full sm:w-[200px] bg-background border border-border text-foreground px-3 py-1.5 rounded-md text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                >
                  {activeJobs.map((job) => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              ) : (
                <span className="text-[12px] text-destructive bg-destructive/8 border border-destructive/20 px-3 py-1.5 rounded-md font-medium">
                  Nenhuma vaga ativa
                </span>
              )}
            </div>

            {/* Matches */}
            {loadingMatches ? (
              <div className="h-40 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : matches.length > 0 ? (
              <div className="divide-y divide-border/40">
                {matches.slice(0, 4).map((match, idx) => (
                  <div key={match.candidate_id} className="flex items-center justify-between py-2.5 gap-3 group hover:bg-accent/30 -mx-1 px-1 rounded-md transition-colors duration-150">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[11px] font-mono text-muted-foreground/50 w-4 shrink-0 tabular-nums">
                        {idx + 1}
                      </span>
                      <Avatar photo_url={match.photo_url} full_name={match.full_name} />
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-foreground truncate leading-tight">{match.full_name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{match.current_job || 'Não informado'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded border text-[11px] font-bold font-mono tabular-nums ${matchBadge(match.match_score)}`}>
                        {match.match_score}%
                      </span>
                      <Link
                        href={`/candidates?candidateId=${match.candidate_id}`}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground transition-all"
                        title="Ver perfil"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
                {matches.length > 4 && (
                  <div className="pt-3">
                    <Link href="/smart-match" className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline">
                      Ver todos os {matches.length} matches
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-center border border-dashed border-border/50 rounded-lg bg-muted/10">
                <AlertTriangle className="w-5 h-5 text-muted-foreground/40 mb-2" />
                <p className="text-[12px] font-medium text-muted-foreground">Nenhum match calculado</p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">Sem candidatos compatíveis com esta vaga.</p>
              </div>
            )}
          </motion.div>

          {/* Bloco 5 — Últimas Ingestões */}
          <motion.div
            variants={item}
            className="bg-card border border-border/60 rounded-lg p-5 shadow-xs flex flex-col gap-4 hover:border-primary/20 transition-colors duration-200"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 mb-1 flex items-center gap-1.5">
                <FileText className="w-3 h-3" />
                Atividade Recente
              </p>
              <h2 className="text-[15px] font-semibold text-foreground tracking-tight">
                Últimas Ingestões
              </h2>
            </div>

            <div className="flex-1 divide-y divide-border/40">
              {initialStats.recent_candidates.length > 0 ? (
                initialStats.recent_candidates.map((cand) => (
                  <div key={cand.id} className="py-2.5 flex items-start justify-between gap-3 group">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-foreground truncate leading-tight">{cand.full_name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{cand.current_job || 'Não informado'}</p>
                      <span className="text-[10px] text-muted-foreground/60 font-mono flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {mounted ? formatTimeAgo(cand.created_at) : '—'}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {cand.quality_score !== null && (
                        <span className={`text-[11px] font-bold font-mono tabular-nums ${scoreColor(cand.quality_score)}`}>
                          {cand.quality_score}%
                        </span>
                      )}
                      <Link
                        href={`/candidates?candidateId=${cand.id}`}
                        className="text-[10px] font-medium text-primary hover:underline flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Ver perfil <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-36 flex flex-col items-center justify-center text-center">
                  <FileText className="w-5 h-5 text-muted-foreground/30 mb-2" />
                  <span className="text-[12px] text-muted-foreground">Nenhum currículo importado</span>
                </div>
              )}
            </div>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
