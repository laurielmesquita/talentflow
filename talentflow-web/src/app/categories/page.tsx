import { Plus, Tag } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

async function getCategories(): Promise<Category[]> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const res = await fetch(`${API_URL}/api/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

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
            <Link href="/jobs" className="hover:text-slate-200 transition-colors">
              Vagas (Smart Match)
            </Link>
            <Link href="/categories" className="text-indigo-400">
              Categorias
            </Link>
          </nav>
          <div>
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-md shadow-indigo-900/20">
              <Plus className="w-4 h-4" />
              Nova Categoria
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Gestão de Categorias</h2>
            <p className="text-slate-400">Estruture o seu banco de talentos por áreas de atuação.</p>
          </div>
        </div>

        {categories.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhuma categoria cadastrada.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/?category=${encodeURIComponent(cat.name)}`}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group cursor-pointer block"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-300 transition-colors">
                    <Tag className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-200 mb-1 group-hover:text-white transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 group-hover:text-indigo-400 transition-colors mt-2">
                  Ver candidatos →
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
