"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function MindMapsPage() {
  const [mindMaps] = useState([
    {
      id: "1",
      title: "Proyecto App Creativa",
      description: "Estructura y arquitectura para la aplicación de creatividad",
      nodes: 15,
      connections: 12,
      tags: ["proyecto", "app", "creatividad"],
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-20T15:45:00Z",
      category: "project" as const,
      is_public: true,
      collaborators: 2,
      last_activity: "2024-01-20T15:45:00Z"
    }
  ]);

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* SEO h1 - hidden but accessible */}
      <h1 className="sr-only">Mapas Mentales - Organiza Ideas y Conceptos Visualmente</h1>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
          Mapas Mentales
        </div>
        <Link
          href="/mindmap/new"
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          Nuevo Mapa Mental
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {mindMaps.map((mindMap) => (
          <Link
            key={mindMap.id}
            href={`/mindmap/${mindMap.id}`}
            className="group block p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all"
          >
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg mb-3 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  {mindMap.nodes}
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">nodos</div>
              </div>
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
              {mindMap.title}
            </h3>
            <p className="text-base text-neutral-600 dark:text-neutral-400 line-clamp-2">
              {mindMap.description}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
