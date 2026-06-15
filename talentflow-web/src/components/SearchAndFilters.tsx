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

  // Debounce para a busca textual
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set('q', query.trim());
      } else {
        params.delete('q');
      }
      router.push(`${pathname}?${params.toString()}`);
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome, cargo ou skill..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition-colors"
              aria-label="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
              showAdvanced || activeCategory
                ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros Avançados
            {activeCategory && (
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-sm font-medium text-rose-400 hover:text-rose-300 transition-colors"
            >
              Limpar Tudo
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Advanced Filters Panel */}
      {showAdvanced && (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
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
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isActive
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-900/30'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
              {categories.length === 0 && (
                <p className="text-xs text-slate-500 italic">Nenhuma categoria ativa cadastrada no banco.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
