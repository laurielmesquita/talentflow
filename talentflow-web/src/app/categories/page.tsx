import { Plus, Tag } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

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
            <Link href="/jobs" className="text-muted-foreground hover:text-foreground transition-colors">
              Vagas (Smart Match)
            </Link>
            <Link href="/categories" className="text-primary">
              Categorias
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-all shadow-md shadow-primary/20">
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
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Gestão de Categorias</h2>
            <p className="text-muted-foreground">Estruture o seu banco de talentos por áreas de atuação.</p>
          </div>
        </div>

        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma categoria cadastrada.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/?category=${encodeURIComponent(cat.name)}`}
                className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/5 transition-all group cursor-pointer block shadow-sm hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                    <Tag className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-1 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors mt-2">
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
