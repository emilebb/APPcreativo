"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authProvider";
import { useProjects } from "@/hooks/useProjects";
import AuthGuard from "@/components/auth/AuthGuard";
import { Search, Palette, Trash2, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { useProfile } from "@/lib/useProfile";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function ExploreContent() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [hasRedirected, setHasRedirected] = useState(false);
  
  // Usar el hook personalizado con refresco optimista
  const { projects, loading, error, createProject, deleteProject, searchProjects } = useProjects(user?.id || '');

  useEffect(() => {
    if (!profile?.start_tool || hasRedirected) return;
    if (profile.start_tool === 'explore') return;

    const routes = {
      moodboard: '/moodboard',
      mindmap: '/mindmap',
      canvas: '/canvas',
      explore: '/explore'
    };
    const targetRoute = routes[profile.start_tool as keyof typeof routes];
    if (targetRoute) {
      setHasRedirected(true);
      router.push(targetRoute);
    }
  }, [profile?.start_tool, router, hasRedirected]);

  const handleDelete = async (id: string) => {
    try {
      setProjectToDelete(null);
      await deleteProject(id);
      console.log("Proyecto eliminado correctamente");
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  // Usar búsqueda derivada
  const filteredProjects = searchProjects(searchTerm);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/50">Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] p-6 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Explora tus proyectos</h1>
          <p className="text-white/60">Gestiona tus proyectos creativos</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar proyectos..."
              className="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.10] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/30 transition-colors"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="w-8 h-8 text-violet-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? 'No se encontraron proyectos' : 'No tienes proyectos aún'}
            </h3>
            <p className="text-white/50 mb-6">
              {searchTerm ? 'Intenta con otra búsqueda' : 'Crea tu primer proyecto para comenzar'}
            </p>
            {!searchTerm && (
              <button
                onClick={async () => {
                  if (!user) return;
                  try {
                    const project = await createProject('moodboard', { title: 'Nuevo Moodboard' });
                    router.push(`/moodboard/${project.id}`);
                  } catch (error) {
                    console.error('Error creating project:', error);
                  }
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Crear proyecto
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white/[0.05] border border-white/[0.10] rounded-xl p-6 hover:bg-white/[0.08] transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{project.title}</h3>
                    <p className="text-white/60 text-sm">{project.type}</p>
                  </div>
                  <button
                    onClick={() => setProjectToDelete(project.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <Link
                  href={`/${project.type}/${project.id}`}
                  className="block w-full py-2 bg-violet-600 text-white text-center rounded-lg hover:bg-violet-700 transition-colors"
                >
                  Abrir proyecto
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {projectToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#16161a] border border-white/10 rounded-xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-white mb-2">Eliminar proyecto</h3>
              <p className="text-white/60 mb-6">
                ¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setProjectToDelete(null)}
                  className="flex-1 py-2 bg-white/[0.10] text-white rounded-lg hover:bg-white/[0.20] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(projectToDelete)}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ExplorePage() {
  return (
    <AuthGuard requireAuth={true}>
      <ExploreContent />
    </AuthGuard>
  );
}
