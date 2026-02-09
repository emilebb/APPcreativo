"use client";

import { useState } from "react";
import { Search, Sparkles, TrendingUp, Clock } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  trending?: boolean;
  recent?: boolean;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "Todos", icon: Sparkles },
    { id: "técnicas", name: "Técnicas", icon: Search },
    { id: "bloqueo", name: "Bloqueo", icon: TrendingUp },
    { id: "diseño", name: "Diseño", icon: Sparkles },
    { id: "escritura", name: "Escritura", icon: Search }
  ];

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    setIsSearching(true);

    if (!searchQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`);
      const data = await response.json();
      
      if (response.ok) {
        setResults(data.results || []);
      } else {
        console.error('Search error:', data.error);
        setResults([]);
      }
    } catch (error) {
      console.error('Search fetch error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : Sparkles;
  };

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          Buscar Inspiración
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Encuentra técnicas, ideas y recursos para desbloquear tu creatividad
        </p>
      </div>

      {/* Barra de herramientas */}
      <div className="flex flex-col gap-4 items-start sm:items-center sm:flex-row sm:justify-between">
        {/* Búsqueda */}
        <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-md">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar técnicas, ideas, soluciones..."
            className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400"
            autoFocus
          />
        </div>

        {/* Filtros de categoría */}
        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  handleSearch(query); // Re-aplicar búsqueda con nueva categoría
                }}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition whitespace-nowrap ${
                  selectedCategory === category.id
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resultados */}
      <div className="space-y-3 sm:space-y-4">
        {query && !isSearching && (
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {results.length === 0 
              ? "No se encontraron resultados para tu búsqueda."
              : `Se encontraron ${results.length} resultado${results.length === 1 ? '' : 's'}`
            }
          </div>
        )}

        {results.map((result) => {
          const Icon = getCategoryIcon(result.category);
          return (
            <div
              key={result.id}
              className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg group-hover:bg-neutral-200 dark:group-hover:bg-neutral-600 transition">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600 dark:text-neutral-400" />
                </div>
                
                <div className="flex-1 space-y-2 sm:space-y-3">
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition">
                      {result.title}
                    </h3>
                    <div className="flex gap-2 flex-shrink-0">
                      {result.trending && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs rounded-full">
                          <TrendingUp className="w-3 h-3" />
                          <span className="hidden sm:inline">Trending</span>
                        </span>
                      )}
                      {result.recent && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                          <Clock className="w-3 h-3" />
                          <span className="hidden sm:inline">Nuevo</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                    {result.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {result.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estado inicial */}
      {!query && results.length === 0 && (
        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-8 h-8 text-neutral-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
              Comienza tu búsqueda
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Escribe lo que buscas y descubre recursos para inspirar tu creatividad
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
