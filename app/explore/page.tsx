"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/authProvider";
import { useRouter } from "next/navigation";
import { projectService, type Project } from "@/lib/projectService";
import { Search, Palette, Brain, Layers, Star, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function ExplorePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    console.log("🔍 Explore page - Auth state:", { user: !!user, loading, userId: user?.id });
    
    if (!loading && !user) {
      console.log("🔄 No user found, redirecting to login");
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user?.id) {
      setLoadingProjects(false);
      return;
    }

    let cancelled = false;

    const loadProjects = async () => {
      try {
        console.log("📁 Loading projects for user:", user.id);
        const userProjects = await projectService.getProjects(user.id);
        console.log("📊 Projects loaded:", userProjects);
        if (!cancelled) {
          setProjects(userProjects);
        }
      } catch (error) {
        console.error("❌ Error loading projects:", error);
        if (!cancelled) {
          setProjects([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingProjects(false);
        }
      }
    };

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (loading || loadingProjects) return <div className="flex items-center justify-center min-h-screen"><p>Cargando sesión...</p></div>;
  if (!user) return null;

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProjectIcon = (type: Project['type']) => {
    switch (type) {
      case 'canvas': return <Palette className="w-5 h-5" />;
      case 'moodboard': return <Layers className="w-5 h-5" />;
      case 'mindmap': return <Brain className="w-5 h-5" />;
      default: return <Palette className="w-5 h-5" />;
    }
  };

  const getProjectTypeLabel = (type: Project['type']) => {
    switch (type) {
      case 'canvas': return 'Canvas';
      case 'moodboard': return 'Moodboard';
      case 'mindmap': return 'Mindmap';
      default: return 'Proyecto';
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-8">
      {/* SEO h1 - hidden but accessible */}
      <h1 className="sr-only">Explorar Proyectos Creativos - Canvas, Mindmaps y Moodboards</h1>
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Explorar Proyectos
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Descubre y gestiona todos tus proyectos creativos
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {projects.length}
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Total Proyectos
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Star className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {projects.filter(p => p.status === 'active').length}
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Activos
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {projects.filter(p => p.type === 'canvas').length}
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Canvas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {loadingProjects ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">
              Cargando proyectos...
            </p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
              {searchTerm ? 'No se encontraron proyectos' : 'No tienes proyectos aún'}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : 'Crea tu primer proyecto para comenzar'
              }
            </p>
            {!searchTerm && (
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Primer Proyecto
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/${project.type}/${project.id}`}
                className="group bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all hover:border-blue-300 dark:hover:border-blue-600"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-neutral-100 dark:bg-neutral-700 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 transition-colors">
                    {getProjectIcon(project.type)}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    project.status === 'active' 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                  }`}>
                    {project.status === 'active' ? 'Activo' : 'Archivado'}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {project.title}
                </h3>
                
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  {getProjectTypeLabel(project.type)}
                </p>
                
                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <span>
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                  <span>
                    {project.type}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
