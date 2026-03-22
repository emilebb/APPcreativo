"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authProvider";
import { projectService } from "@/lib/projectService";

export default function MindMapsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mindMaps, setMindMaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMindMaps();
  }, [user]);

  const loadMindMaps = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const projects = await projectService.getProjects(user.id, 50);
      const mindmapProjects = projects.filter(p => p.type === 'mindmap');
      setMindMaps(mindmapProjects);
    } catch (error) {
      console.error("Error loading mindmaps:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    if (!user) {
      alert("Por favor inicia sesión para crear mapas mentales");
      return;
    }

    try {
      const newMindMap = await projectService.createProject(user.id, "mindmap");
      router.push(`/mindmap/${newMindMap.id}`);
    } catch (error) {
      console.error("Error creating mindmap:", error);
      alert("Error al crear el mapa mental");
    }
  };

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Cargando mapas mentales...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* SEO h1 - hidden but accessible */}
      <h1 className="sr-only">Mapas Mentales - Organiza Ideas y Conceptos Visualmente</h1>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
            Mapas Mentales
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            {mindMaps.length} {mindMaps.length === 1 ? 'mapa mental' : 'mapas mentales'}
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          Nuevo Mapa Mental
        </button>
      </div>

      {mindMaps.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              No tienes mapas mentales aún
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Crea tu primer mapa mental para organizar y visualizar tus ideas
            </p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              Crear Primer Mapa Mental
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {mindMaps.map((mindMap) => (
            <Link
              key={mindMap.id}
              href={`/mindmap/${mindMap.id}`}
              className="group block p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all"
            >
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg mb-3 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-1 truncate">
                {mindMap.title}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {new Date(mindMap.updated_at).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
