import { Users, UserCheck, Sparkles, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import CandidateTable from '@/components/CandidateTable';
import BatchUploadButton from '@/components/BatchUploadButton';
import SearchAndFilters from '@/components/SearchAndFilters';
import Navbar from '@/components/Navbar';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface Candidate {
  id: string;
  full_name: string;
  current_job: string;
  categories: string[];
  added_at: string | null;
  skills: string[];
  photo_url: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface CandidatesResponse {
  candidates: Candidate[];
  total: number;
  page: number;
  limit: number;
  stats: {
    total: number;
    active: number;
    flagged: number;
    average_quality: number | null;
  };
}

async function getCandidates(
  category?: string, 
  q?: string, 
  page: number = 1, 
  limit: number = 10, 
  token?: string
): Promise<CandidatesResponse> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (q) params.set('q', q);
    params.set('page', String(page));
    params.set('limit', String(limit));
    
    const url = `${API_URL}/api/candidates?${params.toString()}`;
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, { 
      headers,
      cache: 'no-store' 
    });
    if (res.status === 401) {
      redirect('/login');
    }
    if (!res.ok) {
      return { 
        candidates: [], 
        total: 0, 
        page, 
        limit, 
        stats: { total: 0, active: 0, flagged: 0, average_quality: null } 
      };
    }
    return res.json();
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    return { 
      candidates: [], 
      total: 0, 
      page, 
      limit, 
      stats: { total: 0, active: 0, flagged: 0, average_quality: null } 
    };
  }
}

async function getCategories(token?: string): Promise<Category[]> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_URL}/api/categories`, { 
      headers,
      cache: 'no-store' 
    });
    if (res.status === 401) {
      redirect('/login');
    }
    if (!res.ok) return [];
    return res.json();
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    return [];
  }
}

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; candidateId?: string; q?: string; page?: string; limit?: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const { category, candidateId, q, page, limit } = await searchParams;
  const pageNum = page ? parseInt(page, 10) : 1;
  const limitNum = limit ? parseInt(limit, 10) : 10;

  const [data, categories] = await Promise.all([
    getCandidates(category, q, pageNum, limitNum, token),
    getCategories(token),
  ]);

  const candidates = data.candidates || [];
  const stats = data.stats || { total: 0, active: 0, flagged: 0, average_quality: null };

  return (
    <div className="flex-1 flex flex-col bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-300 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Navbar */}
      <Navbar>
        {/* BatchUploadButton gerencia router.refresh() internamente após upload */}
        <BatchUploadButton />
      </Navbar>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Banco de Talentos</h2>
            <p className="text-muted-foreground">Triagem inteligente e Ingestão otimista de currículos.</p>
          </div>
          {/* Filtro ativo: badge de categoria com botão de limpar */}
          {category && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <Users className="w-3.5 h-3.5" />
                {category}
                <Link href="/candidates" className="ml-1 text-primary hover:text-foreground transition-colors" aria-label="Remover filtro">
                  ×
                </Link>
              </div>
              <span className="text-sm text-muted-foreground">
                {candidates.length} candidato{candidates.length !== 1 ? 's' : ''} encontrado{candidates.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Card 1: Total de Talentos */}
          <div className="relative overflow-hidden p-6 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-4 transition-all duration-300 hover:border-slate-300 dark:hover:border-white/20">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total de Talentos</p>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.total}</h4>
            </div>
          </div>

          {/* Card 2: Perfis Ativos */}
          <div className="relative overflow-hidden p-6 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-4 transition-all duration-300 hover:border-slate-300 dark:hover:border-white/20">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Perfis Ativos</p>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.active}</h4>
            </div>
          </div>

          {/* Card 3: Quality Score Médio */}
          <div className="relative overflow-hidden p-6 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-4 transition-all duration-300 hover:border-slate-300 dark:hover:border-white/20">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 dark:text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quality Score Médio</p>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {stats.average_quality !== null ? stats.average_quality : "—"}
              </h4>
            </div>
          </div>

          {/* Card 4: Sinalizados */}
          <div className="relative overflow-hidden p-6 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-4 transition-all duration-300 hover:border-slate-300 dark:hover:border-white/20">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sinalizados</p>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.flagged}</h4>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-8">
          <SearchAndFilters categories={categories} activeCategory={category} activeQuery={q} />
        </div>

        {/* Candidate List (Client Component) */}
        <CandidateTable 
          candidates={candidates} 
          initialCandidateId={candidateId}
          currentPage={pageNum}
          totalItems={data.total}
          pageSize={limitNum}
        />
      </main>
    </div>
  );
}
