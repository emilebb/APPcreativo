"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/authProvider";
import { useRouter } from "next/navigation";
import { projectService, type Project } from "@/lib/projectService";
import { Search, Palette, Brain, Layers, Star, Clock, TrendingUp, Trash2 } from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function ExplorePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Estabilizar userId para evitar cambios innecesarios
  const userId = useMemo(() => user?.id || null, [user?.id]);

  useEffect(() => {
    console.log("🔍 Explore page - Auth state:", { user: !!user, loading, userId });
    
    // Redirección si no hay usuario
    if (!loading && !user) {
      console.log("🔄 No user found, redirecting to login");
      router.replace("/login");
      return;
    }

    // Si no hay userId o ya cargamos proyectos, no hacer nada
    if (!userId || projectsLoaded) {
      if (projectsLoaded) {
        console.log("📁 Projects already loaded for user:", userId);
      }
      return;
    }

    let cancelled = false;

    const loadProjects = async () => {
      try {
        console.log("📁 Loading projects for user:", userId);
        const userProjects = await projectService.getProjects(userId);
        console.log("📊 Projects loaded:", userProjects);
        if (!cancelled) {
          setProjects(userProjects);
          setProjectsLoaded(true);
        }
      } catch (error) {
        console.error("❌ Error loading projects:", error);
        if (!cancelled) {
          setProjects([]);
          setProjectsLoaded(true);
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
  }, [loading, user, userId, projectsLoaded, router]); // ← Unificado y controlado

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

  const handleDeleteProject = async (project: Project) => {
    try {
      const success = await projectService.deleteProject(project.id);
      if (success) {
        // Eliminar el proyecto de la lista local
        setProjects(prev => prev.filter(p => p.id !== project.id));
        setProjectToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-8">
      {/* SEO h1 - hidden but accessible */}
      <h1 className="sr-only">Explorar Proyectos Creativos - Canvas, Mindmaps y Moodboards</h1>
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
              Explorar Proyectos
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Descubre y gestiona todos tus proyectos creativos
            </p>
          </div>
          <LogoutButton />
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
              <div
                key={project.id}
                className="group bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all hover:border-blue-300 dark:hover:border-blue-600 relative"
              >
                <Link
                  href={`/${project.type}/${project.id}`}
                  className="block"
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
                
                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setProjectToDelete(project);
                  }}
                  className="absolute top-4 right-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Eliminar proyecto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Eliminar Proyecto
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300">
                ¿Estás seguro de que quieres eliminar el proyecto:
              </p>
              <p className="font-semibold text-gray-900 dark:text-white mt-2">
                "{projectToDelete.title}"
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {getProjectTypeLabel(projectToDelete.type)} • Creado el {new Date(projectToDelete.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDeleteProject(projectToDelete)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
              <button
                onClick={() => setProjectToDelete(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
