import { Search, Filter, Users } from 'lucide-react';
import Link from 'next/link';
import CandidateTable from '@/components/CandidateTable';
import BatchUploadButton from '@/components/BatchUploadButton';

interface Candidate {
  id: string;
  full_name: string;
  current_job: string;
  categories: string[];
  match_score: number;
  added_at: string | null;
  skills: string[];
  photo_url: string | null;
}

async function getCandidates(category?: string): Promise<{ candidates: Candidate[]; total: number }> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const url = category
      ? `${API_URL}/api/candidates?category=${encodeURIComponent(category)}`
      : `${API_URL}/api/candidates`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return { candidates: [], total: 0 };
    return res.json();
  } catch {
    return { candidates: [], total: 0 };
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; candidateId?: string }>;
}) {
  const { category, candidateId } = await searchParams;
  const data = await getCandidates(category);
  const candidates = data.candidates || [];

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
            <Link href="/" className="text-indigo-400">
              Candidatos
            </Link>
            <Link href="/jobs" className="hover:text-slate-200 transition-colors">
              Vagas (Smart Match)
            </Link>
            <Link href="/categories" className="hover:text-slate-200 transition-colors">
              Categorias
            </Link>
          </nav>
          <div>
            {/* BatchUploadButton gerencia router.refresh() internamente após upload */}
            <BatchUploadButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Banco de Talentos</h2>
            <p className="text-slate-400">Triagem inteligente e Ingestão otimista de currículos.</p>
          </div>
          {/* Filtro ativo: badge de categoria com botão de limpar */}
          {category && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-sm font-medium">
                <Users className="w-3.5 h-3.5" />
                {category}
                <Link href="/" className="ml-1 text-indigo-400 hover:text-white transition-colors" aria-label="Remover filtro">
                  ×
                </Link>
              </div>
              <span className="text-sm text-slate-500">
                {candidates.length} candidato{candidates.length !== 1 ? 's' : ''} encontrado{candidates.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nome, cargo ou skill..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-sm font-medium text-slate-300 transition-colors">
            <Filter className="w-4 h-4" />
            Filtros Avançados
          </button>
        </div>

        {/* Candidate List (Client Component) */}
        <CandidateTable candidates={candidates} initialCandidateId={candidateId} />
      </main>
    </div>
  );
}
