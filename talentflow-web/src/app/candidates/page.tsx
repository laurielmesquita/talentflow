import type { Metadata } from 'next';
import { Users, UserCheck, Sparkles, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import CandidateTable from '@/components/CandidateTable';

export const metadata: Metadata = {
  title: 'Candidatos',
};
import BatchUploadButton from '@/components/BatchUploadButton';
import SearchAndFilters from '@/components/SearchAndFilters';
import AppShell from '@/components/AppShell';
import { cookies } from 'next/headers';

import { getCandidates } from '@/lib/data/candidates';
import { getCategories } from '@/lib/data/categories';

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
    <AppShell
        title="Banco de Talentos"
        subtitle="Triagem inteligente e Ingestão otimista de currículos."
        actions={
          <>
            {category && (
              <div className="hidden sm:flex items-center gap-3 mr-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                  <Users className="w-3.5 h-3.5" />
                  {category}
                  <Link href="/candidates" className="ml-1 text-primary hover:text-foreground transition-colors" aria-label="Remover filtro">
                    ×
                  </Link>
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {candidates.length} candidato{candidates.length !== 1 ? 's' : ''} encontrado{candidates.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            <BatchUploadButton />
          </>
        }
      >

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10">

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Card 1: Total de Talentos */}
          <div className="glass-panel glass-panel-interactive relative overflow-hidden border-l-2 border-l-primary p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-info/10 text-info">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total de Talentos</p>
               <h4 className="text-2xl font-bold text-foreground mt-1">{stats.total}</h4>
            </div>
          </div>

          {/* Card 2: Perfis Ativos */}
          <div className="glass-panel glass-panel-interactive relative overflow-hidden border-l-2 border-l-success p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10 text-success">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Perfis Ativos</p>
               <h4 className="text-2xl font-bold text-foreground mt-1">{stats.active}</h4>
            </div>
          </div>

          {/* Card 3: Quality Score Médio */}
          <div className="glass-panel glass-panel-interactive relative overflow-hidden border-l-2 border-l-primary p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quality Score Médio</p>
               <h4 className="text-2xl font-bold text-foreground mt-1">
                {stats.average_quality !== null ? stats.average_quality : "—"}
              </h4>
            </div>
          </div>

          {/* Card 4: Sinalizados */}
          <div className="glass-panel glass-panel-interactive relative overflow-hidden border-l-2 border-l-destructive p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sinalizados</p>
               <h4 className="text-2xl font-bold text-foreground mt-1">{stats.flagged}</h4>
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
    </AppShell>
  );
}
