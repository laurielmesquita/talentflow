import { Users } from 'lucide-react';
import Link from 'next/link';
import CandidateTable from '@/components/CandidateTable';
import BatchUploadButton from '@/components/BatchUploadButton';
import SearchAndFilters from '@/components/SearchAndFilters';
import Navbar from '@/components/Navbar';
import { cookies } from 'next/headers';


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

async function getCandidates(category?: string, q?: string, token?: string): Promise<{ candidates: Candidate[]; total: number }> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (q) params.set('q', q);
    
    const url = `${API_URL}/api/candidates?${params.toString()}`;
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, { 
      headers,
      cache: 'no-store' 
    });
    if (!res.ok) return { candidates: [], total: 0 };
    return res.json();
  } catch {
    return { candidates: [], total: 0 };
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
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; candidateId?: string; q?: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const userRole = cookieStore.get('user_role')?.value;

  const { category, candidateId, q } = await searchParams;
  const [data, categories] = await Promise.all([
    getCandidates(category, q, token),
    getCategories(token),
  ]);

  const candidates = data.candidates || [];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-300 relative overflow-hidden">
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

        {/* Search & Filters */}
        <div className="mb-8">
          <SearchAndFilters categories={categories} activeCategory={category} activeQuery={q} />
        </div>

        {/* Candidate List (Client Component) */}
        <CandidateTable candidates={candidates} initialCandidateId={candidateId} />
      </main>
    </div>
  );
}
