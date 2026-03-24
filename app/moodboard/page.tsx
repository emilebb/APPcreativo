"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Layers, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/authProvider";
import { projectService } from "@/lib/projectService";

interface Moodboard {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  type: string;
  created_at: string;
  updated_at: string;
  status: string;
}

export default function MoodboardsPage() {
  const { user } = useAuth();
  const [moodboards, setMoodboards] = useState<Moodboard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMoodboards();
  }, [user]);

  const loadMoodboards = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const projects = await projectService.getProjects(user.id, 50);
      const moodboardProjects = projects.filter(p => p.type === 'moodboard');
      setMoodboards(moodboardProjects);
    } catch (error) {
      console.error("Error loading moodboards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este moodboard?")) return;

    try {
      await projectService.deleteProject(id);
      setMoodboards(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error("Error deleting moodboard:", error);
      alert("Error al eliminar el moodboard");
    }
  };

  const handleCreateNew = async () => {
    if (!user) {
      alert("Por favor inicia sesión para crear moodboards");
      return;
    }

    try {
      const newMoodboard = await projectService.createProject(user.id, "moodboard");
      
      const initialMoodboardData = {
        id: newMoodboard.id,
        title: newMoodboard.title,
        description: "",
        layout: "freeform",
        images: [],
        tags: [],
        colorPalette: [],
        createdAt: newMoodboard.created_at,
        updatedAt: newMoodboard.updated_at
      };
      
      localStorage.setItem(`moodboard-${newMoodboard.id}`, JSON.stringify(initialMoodboardData));
      
      window.location.href = `/moodboard/${newMoodboard.id}/edit`;
    } catch (error) {
      console.error("Error creating moodboard:", error);
      alert("Error al crear el moodboard");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/50">Cargando moodboards...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] p-6 sm:p-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Layers className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Moodboards
              </h1>
              <p className="text-white/50">
                {moodboards.length} {moodboards.length === 1 ? 'tablero' : 'tableros'} de inspiración
              </p>
            </div>
          </div>
          
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all"
          >
            <Plus className="w-5 h-5" />
            Nuevo Moodboard
          </button>
        </div>

        {moodboards.length === 0 ? (
          <div className="text-center py-20 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Layers className="w-10 h-10 text-blue-400/50" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              No tienes moodboards aún
            </h3>
            <p className="text-white/50 mb-8 max-w-md mx-auto">
              Crea tu primer tablero para organizar y visualizar tus ideas creativas
            </p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Crear Primer Moodboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {moodboards.map((moodboard) => (
              <div
                key={moodboard.id}
                className="group relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <Link
                  href={`/moodboard/${moodboard.id}`}
                  className="block"
                >
                  {/* Preview */}
                  <div className="aspect-video bg-gradient-to-br from-blue-500/20 via-violet-500/20 to-purple-500/20 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,transparent_40%,rgba(255,255,255,0.03)_40%)] bg-[length:16px_16px]" />
                    <Eye className="w-12 h-12 text-white/20" />
                  </div>
                  
                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-white mb-1 truncate">
                      {moodboard.title}
                    </h3>
                    <p className="text-sm text-white/40">
                      {new Date(moodboard.updated_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </Link>

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/moodboard/${moodboard.id}/edit`}
                    className="p-2.5 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-lg hover:bg-white/20 transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit className="w-4 h-4 text-white" />
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(moodboard.id);
                    }}
                    className="p-2.5 backdrop-blur-xl bg-red-500/20 border border-red-500/30 rounded-xl hover:bg-red-500/40 transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
