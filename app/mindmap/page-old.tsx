"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, GitGraph, Brain, Zap, Target, Trash2, Edit, Clock, Users } from "lucide-react";
import { useAuth } from "@/lib/authProvider";
import Link from "next/link";

interface MindMap {
  id: string;
  title: string;
  description?: string;
  nodes: number;
  connections: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  category: "brainstorm" | "project" | "learning" | "planning";
  is_public?: boolean;
  collaborators?: number;
  last_activity?: string;
}

export default function MindMapsPage() {
  const { session } = useAuth();
  const router = useRouter();
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    if (!session) {
      router.push("/");
      return;
    }

    loadMindMaps();
  }, [session]);

  const loadMindMaps = async () => {
    try {
      setLoading(true);
      
      // Simulación de carga - en producción vendría de una API
      const mockMindMaps: MindMap[] = [
        {
          id: "1",
          title: "Proyecto App Creativa",
          description: "Estructura y arquitectura para la aplicación de creatividad",
          nodes: 24,
          connections: 31,
          tags: ["app", "creatividad", "proyecto"],
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-22T15:45:00Z",
          category: "project",
          is_public: false,
          collaborators: 2,
          last_activity: "2024-01-22T15:45:00Z"
        },
        {
          id: "2",
          title: "Ideas Blog Creatividad",
          description: "Brainstorming de temas y conceptos para el blog",
          nodes: 18,
          connections: 22,
          tags: ["blog", "ideas", "contenido"],
          created_at: "2024-01-10T08:20:00Z",
          updated_at: "2024-01-20T12:30:00Z",
          category: "brainstorm",
          is_public: true,
          collaborators: 0,
          last_activity: "2024-01-20T12:30:00Z"
        },
        {
          id: "3",
          title: "Aprendizaje React Avanzado",
          description: "Conceptos y relaciones para dominar React",
          nodes: 32,
          connections: 45,
          tags: ["react", "aprendizaje", "programación"],
          created_at: "2024-01-05T14:15:00Z",
          updated_at: "2024-01-21T09:10:00Z",
          category: "learning",
          is_public: false,
          collaborators: 1,
          last_activity: "2024-01-21T09:10:00Z"
        },
        {
          id: "4",
          title: "Planificación Q1 2024",
          description: "Objetivos y estrategias para el primer trimestre",
          nodes: 15,
          connections: 18,
          tags: ["planificación", "objetivos", "q1"],
          created_at: "2024-01-02T11:00:00Z",
          updated_at: "2024-01-18T16:20:00Z",
          category: "planning",
          is_public: false,
          collaborators: 3,
          last_activity: "2024-01-18T16:20:00Z"
        },
        {
          id: "5",
          title: "Mapa Mental Creatividad",
          description: "Exploración del concepto de creatividad y sus dimensiones",
          nodes: 28,
          connections: 38,
          tags: ["creatividad", "conceptos", "teoría"],
          created_at: "2023-12-28T09:30:00Z",
          updated_at: "2024-01-19T14:15:00Z",
          category: "learning",
          is_public: true,
          collaborators: 0,
          last_activity: "2024-01-19T14:15:00Z"
        }
      ];

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 800));
      setMindMaps(mockMindMaps);
    } catch (error) {
      console.error("Error loading mind maps:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMindMaps = mindMaps.filter(mindMap =>
    mindMap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mindMap.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mindMap.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  ).filter(mindMap =>
    selectedCategory === "all" || mindMap.category === selectedCategory
  );

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este mapa mental?")) {
      return;
    }

    try {
      // Simulación de eliminación
      setMindMaps(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error("Error deleting mind map:", error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "brainstorm": return Zap;
      case "project": return Target;
      case "learning": return Brain;
      case "planning": return Clock;
      default: return GitGraph;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "brainstorm": return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300";
      case "project": return "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300";
      case "learning": return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
      case "planning": return "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300";
      default: return "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300";
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "brainstorm": return "Brainstorming";
      case "project": return "Proyecto";
      case "learning": return "Aprendizaje";
      case "planning": return "Planificación";
      default: return "Otro";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    return "hace unos minutos";
  };

  const categories = [
    { id: "all", name: "Todos", icon: GitGraph },
    { id: "brainstorm", name: "Brainstorming", icon: Zap },
    { id: "project", name: "Proyectos", icon: Target },
    { id: "learning", name: "Aprendizaje", icon: Brain },
    { id: "planning", name: "Planificación", icon: Clock }
  ];

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-400 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Cargando mapas mentales...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Mapas Mentales
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Organiza tus ideas y conecta conceptos de forma visual
          </p>
        </div>
        
        <Link
          href="/mindmap/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition"
        >
          <Plus className="w-4 h-4" />
          Nuevo Mapa Mental
        </Link>
      </div>

      {/* Barra de herramientas */}
      <div className="flex flex-col gap-4 items-start sm:items-center sm:flex-row sm:justify-between">
        {/* Búsqueda */}
        <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-md">
          <GitGraph className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar mapas mentales..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>

        {/* Filtros de categoría */}
        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg transition whitespace-nowrap ${
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

      {/* Estado vacío */}
      {filteredMindMaps.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <GitGraph className="w-10 h-10 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
            {searchQuery ? "No se encontraron mapas mentales" : "No tienes mapas mentales aún"}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            {searchQuery 
              ? "Intenta con otros términos de búsqueda"
              : "Crea tu primer mapa mental para empezar a organizar tus ideas"
            }
          </p>
          {!searchQuery && (
            <Link
              href="/mindmap/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition"
            >
              <Plus className="w-4 h-4" />
              Crear Mapa Mental
            </Link>
          )}
        </div>
      )}

      {/* Grid de mapas mentales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredMindMaps.map((mindMap) => {
          const CategoryIcon = getCategoryIcon(mindMap.category);
          return (
            <div
              key={mindMap.id}
              className="group bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Header */}
              <div className="p-4 sm:p-6 pb-2 sm:pb-4">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className={`p-2 rounded-lg ${getCategoryColor(mindMap.category)}`}>
                    <CategoryIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => router.push(`/mindmap/${mindMap.id}/edit`)}
                      className="p-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(mindMap.id)}
                      className="p-1 text-neutral-500 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>

                <Link href={`/mindmap/${mindMap.id}`}>
                  <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition mb-1 sm:mb-2 text-sm sm:text-base">
                    {mindMap.title}
                  </h3>
                  {mindMap.description && (
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3 sm:mb-4">
                      {mindMap.description}
                    </p>
                  )}
                </Link>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
                  {mindMap.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                  {mindMap.tags.length > 2 && (
                    <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs rounded-md">
                      +{mindMap.tags.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="px-4 sm:px-6 pb-4">
                <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-500 mb-2 sm:mb-3">
                  <span>{mindMap.nodes} nodos</span>
                  <span>{mindMap.connections} conexiones</span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-neutral-100 dark:border-neutral-700">
                  <div className="flex items-center gap-2 sm:gap-3 text-xs text-neutral-500">
                    {mindMap.collaborators && mindMap.collaborators > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {mindMap.collaborators}
                      </span>
                    )}
                    {mindMap.is_public && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs">
                        Público
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-neutral-500">
                    {formatRelativeTime(mindMap.last_activity || mindMap.updated_at)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
