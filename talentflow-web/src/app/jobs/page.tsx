import { Suspense } from 'react';
import { Plus, Briefcase } from 'lucide-react';
import Link from 'next/link';
import JobMatchViewer from '@/components/JobMatchViewer';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Job {
  id: string;
  title: string;
  description: string;
  required_skills: string;
}

async function getJobs(): Promise<Job[]> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const res = await fetch(`${API_URL}/api/jobs`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function JobCardSkeleton() {
  return (
    <div className="animate-pulse p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 space-y-3">
      <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-3/4" />
      <div className="h-3 bg-slate-100 dark:bg-white/5 rounded w-full" />
      <div className="h-3 bg-slate-100 dark:bg-white/5 rounded w-5/6" />
    </div>
  );
}

function MatchPanelFallback() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-24">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4" />
      <p className="text-sm">Carregando painel de match...</p>
    </div>
  );
}

export default async function JobsPage() {
  const jobs = await getJobs();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-300 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Navbar */}
      <header className="border-b border-border bg-background/60 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground shadow-lg shadow-primary/20">
              TF
            </div>
            <h1 className="text-xl font-semibold tracking-tight">TalentFlow</h1>
          </div>
          <nav className="flex gap-6 text-sm font-medium">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Candidatos
            </Link>
            <Link href="/jobs" className="text-primary">
              Vagas (Smart Match)
            </Link>
            <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
              Categorias
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-all shadow-md shadow-primary/20">
              <Plus className="w-4 h-4" />
              Nova Vaga
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Smart Match de Vagas</h2>
            <p className="text-muted-foreground">
              Cruze automaticamente os requisitos da vaga com as habilidades dos candidatos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna esquerda: lista de vagas (Server-rendered) */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Vagas Abertas
            </h3>

            {jobs.length === 0 ? (
              <>
                <JobCardSkeleton />
                <p className="text-sm text-muted-foreground text-center pt-2">Nenhuma vaga cadastrada.</p>
              </>
            ) : (
              jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs?jobId=${job.id}`}
                  replace
                  scroll={false}
                  className="block p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {job.title}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{job.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {job.required_skills
                      .split(',')
                      .slice(0, 3)
                      .map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] uppercase font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-white/5 text-muted-foreground border border-slate-200 dark:border-white/10"
                        >
                          {s.trim()}
                        </span>
                      ))}
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Coluna direita: painel de match (Client Component em Suspense) */}
          <div className="lg:col-span-2">
            <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-6 min-h-[500px]">
              <Suspense fallback={<MatchPanelFallback />}>
                <JobMatchViewer />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
