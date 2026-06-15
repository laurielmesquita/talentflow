import { Suspense } from 'react';
import { Plus, Briefcase } from 'lucide-react';
import Link from 'next/link';
import JobMatchViewer from '@/components/JobMatchViewer';

interface Job {
  id: string;
  title: string;
  description: string;
  required_skills: string;
}

async function getJobs(): Promise<Job[]> {
  try {
    const res = await fetch('http://localhost:8000/api/jobs', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function JobCardSkeleton() {
  return (
    <div className="animate-pulse p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
      <div className="h-4 bg-slate-700 rounded w-3/4" />
      <div className="h-3 bg-slate-800 rounded w-full" />
      <div className="h-3 bg-slate-800 rounded w-5/6" />
    </div>
  );
}

function MatchPanelFallback() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-slate-500 py-24">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4" />
      <p className="text-sm">Carregando painel de match...</p>
    </div>
  );
}

export default async function JobsPage() {
  const jobs = await getJobs();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              TF
            </div>
            <h1 className="text-xl font-semibold tracking-tight">TalentFlow</h1>
          </div>
          <nav className="flex gap-6 text-sm font-medium text-slate-400">
            <Link href="/" className="hover:text-slate-200 transition-colors">
              Candidatos
            </Link>
            <Link href="/jobs" className="text-indigo-400">
              Vagas (Smart Match)
            </Link>
            <Link href="/categories" className="hover:text-slate-200 transition-colors">
              Categorias
            </Link>
          </nav>
          <div>
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-md shadow-indigo-900/20">
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
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Smart Match de Vagas</h2>
            <p className="text-slate-400">
              Cruze automaticamente os requisitos da vaga com as habilidades dos candidatos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna esquerda: lista de vagas (Server-rendered) */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              Vagas Abertas
            </h3>

            {jobs.length === 0 ? (
              <>
                <JobCardSkeleton />
                <p className="text-sm text-slate-500 text-center pt-2">Nenhuma vaga cadastrada.</p>
              </>
            ) : (
              jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs?jobId=${job.id}`}
                  replace
                  scroll={false}
                  className="block p-5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/50 hover:border-slate-700 transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                      {job.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">{job.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {job.required_skills
                      .split(',')
                      .slice(0, 3)
                      .map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] uppercase font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700"
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
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 min-h-[500px]">
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
