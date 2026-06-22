'use client';

import { Search, Filter, Tag, X } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
}

interface SearchAndFiltersProps {
  categories: Category[];
  activeCategory?: string;
  activeQuery?: string;
}

export default function SearchAndFilters({
  categories,
  activeCategory,
  activeQuery,
}: SearchAndFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(activeQuery || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounce para a busca textual com reset de página
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const currentQ = searchParams.get('q') || '';
      const normalizedQuery = query.trim();

      if (normalizedQuery !== currentQ) {
        if (normalizedQuery) {
          params.set('q', normalizedQuery);
        } else {
          params.delete('q');
        }
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query, pathname, searchParams, router]);

  // Sincroniza o estado da busca se mudar externamente
  useEffect(() => {
    setQuery(activeQuery || '');
  }, [activeQuery]);

  const handleCategorySelect = (categoryName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeCategory === categoryName) {
      params.delete('category'); // Toggle off
    } else {
      params.set('category', categoryName);
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setQuery('');
    router.push(pathname);
  };

  const hasActiveFilters = !!query || !!activeCategory;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Search Input and Toggle Button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome, cargo ou skill..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200 ${
              showAdvanced || activeCategory
                ? 'bg-primary/10 border-primary/40 text-primary'
                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-foreground'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros Avançados
            {activeCategory && (
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-medium text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              Limpar Tudo
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Advanced Filters Panel */}
      {showAdvanced && (
        <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-5 backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Filtrar por Área / Categoria
            </h4>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.name;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.name)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                      isActive
                        ? 'bg-primary border-primary/50 text-primary-foreground shadow-md'
                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-muted-foreground hover:border-slate-300 dark:hover:border-white/20 hover:text-foreground'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
              {categories.length === 0 && (
                <p className="text-xs text-muted-foreground italic">Nenhuma categoria ativa cadastrada no banco.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
