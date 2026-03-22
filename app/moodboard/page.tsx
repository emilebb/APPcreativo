"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
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
      
      // Guardar moodboard inicial en localStorage para evitar 404
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
      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Cargando moodboards...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-6">
      <h1 className="sr-only">Moodboards - Crea Tableros de Inspiración Visual</h1>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
            Moodboards
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            {moodboards.length} {moodboards.length === 1 ? 'moodboard' : 'moodboards'}
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          Nuevo Moodboard
        </button>
      </div>

      {moodboards.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              No tienes moodboards aún
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Crea tu primer moodboard para organizar y visualizar tus ideas creativas
            </p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              Crear Primer Moodboard
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {moodboards.map((moodboard) => (
            <div
              key={moodboard.id}
              className="group relative bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all overflow-hidden"
            >
              <Link
                href={`/moodboard/${moodboard.id}`}
                className="block p-4"
              >
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg mb-3 flex items-center justify-center">
                  <Eye className="w-12 h-12 text-neutral-400 dark:text-neutral-600" />
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-1 truncate">
                  {moodboard.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {new Date(moodboard.updated_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </Link>

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Link
                  href={`/moodboard/${moodboard.id}/edit`}
                  className="p-2 bg-white dark:bg-neutral-700 rounded-lg shadow-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Edit className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(moodboard.id);
                  }}
                  className="p-2 bg-white dark:bg-neutral-700 rounded-lg shadow-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
