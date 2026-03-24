"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authProvider";
import { projectService } from "@/lib/projectService";
import { Search, Palette, Trash2, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { useProfile } from "@/lib/useProfile";

export default function ExplorePage() {
  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfile();
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasRedirected, setHasRedirected] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any | null>(null);

  useEffect(() => {
    if (!profile?.start_tool || hasRedirected) return;
    if (profile.start_tool === 'explore') return;

    const routes = {
      moodboard: '/moodboard',
      mindmap: '/mindmap',
      canvas: '/canvas',
      explore: '/explore'
    };

    const targetRoute = routes[profile.start_tool];
    if (targetRoute) {
      setHasRedirected(true);
      router.push(targetRoute);
    }
  }, [profile?.start_tool, router, hasRedirected]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadProjects = async () => {
      try {
        const data = await projectService.getProjects(user.id);
        setProjects(data);
      } catch (error) {
        console.error("Error loading projects:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [user, authLoading, router]);

  const handleDelete = async (id: string) => {
    try {
      await projectService.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      setProjectToDelete(null);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/50">Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] p-6 sm:p-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Explora tus proyectos
              </h2>
            </div>
            <p className="text-white/50">
              Organiza, crea y da vida a tus ideas
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* Search Bar */}
        <div className="mb-10">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar proyectos..."
              className="w-full pl-12 pr-4 py-3.5 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl">
            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Plus className="w-10 h-10 text-white/30" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              No tienes proyectos aún
            </h3>
            <p className="text-white/50 mb-8 max-w-md mx-auto">
              Crea tu primer proyecto para comenzar tu viaje creativo
            </p>
            <button 
              onClick={async () => {
                if (!user) return;
                try {
                  const project = await projectService.createProject(user.id, 'moodboard');
                  const initialMoodboardData = {
                    id: project.id,
                    title: project.title,
                    description: "",
                    layout: "freeform",
                    images: [],
                    tags: [],
                    colorPalette: [],
                    createdAt: project.created_at,
                    updatedAt: project.updated_at
                  };
                  localStorage.setItem(`moodboard-${project.id}`, JSON.stringify(initialMoodboardData));
                  router.push(`/moodboard/${project.id}/edit`);
                } catch (error) {
                  console.error('Error creating project:', error);
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] transition-all"
            >
              <Plus className="w-5 h-5" />
              Crear Primer Proyecto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((project) => (
              <div key={project.id} className="group relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                <Link href={`/${project.type}/${project.id}`} className="block">
                  {/* Preview */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-violet-500/20 to-blue-500/20 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,transparent_50%,rgba(255,255,255,0.05)_50%)] bg-[length:20px_20px]" />
                    <Palette className="w-10 h-10 text-white/30" />
                  </div>
                  
                  {/* Info */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1 truncate pr-8">
                        {project.title}
                      </h3>
                      <p className="text-sm text-white/40">
                        {new Date(project.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                    </div>
                    <div className="px-2.5 py-1 bg-white/10 rounded-lg text-xs text-white/60 capitalize">
                      {project.type}
                    </div>
                  </div>
                </Link>
                
                {/* Delete Button */}
                <button
                  onClick={() => setProjectToDelete(project)}
                  className="absolute top-4 right-4 p-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-3">Eliminar Proyecto</h3>
            <p className="text-white/60 mb-6">
              ¿Estás seguro de eliminar "{projectToDelete.title}"? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(projectToDelete.id)}
                className="flex-1 px-5 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
              <button
                onClick={() => setProjectToDelete(null)}
                className="flex-1 px-5 py-3 backdrop-blur-xl bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors"
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
