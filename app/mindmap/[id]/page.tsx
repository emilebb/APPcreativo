"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authProvider";
import { ArrowLeft, Share2, Download, Edit, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  children: string[];
}

interface MindMap {
  id: string;
  title: string;
  description?: string;
  nodes: MindMapNode[];
  created_at: string;
  updated_at: string;
}

export default function MindMapDetailPage() {
  const { session } = useAuth();
  const router = useRouter();
  const params = useParams();
  const mindMapId = params.id as string;
  
  const [mindMap, setMindMap] = useState<MindMap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mindMapId) {
      loadMindMap();
    }
  }, [mindMapId]);

  const loadMindMap = async () => {
    try {
      setLoading(true);
      
      // Simulación de carga - en producción vendría de una API
      const mockMindMap: MindMap = {
        id: mindMapId,
        title: "Mapa Mental de Proyectos",
        description: "Organización visual de todos los proyectos creativos actuales y futuros.",
        nodes: [
          {
            id: "1",
            text: "Proyectos Creativos",
            x: 400,
            y: 300,
            color: "#3B82F6",
            children: ["2", "3", "4"]
          },
          {
            id: "2",
            text: "Canvas Digital",
            x: 200,
            y: 150,
            color: "#10B981",
            children: []
          },
          {
            id: "3",
            text: "Moodboards",
            x: 300,
            y: 100,
            color: "#F59E0B",
            children: []
          },
          {
            id: "4",
            text: "Mapas Mentales",
            x: 500,
            y: 150,
            color: "#EF4444",
            children: []
          }
        ],
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T15:45:00Z"
      };

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 800));
      setMindMap(mockMindMap);
    } catch (error) {
      console.error("Error loading mindmap:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share && mindMap) {
      try {
        await navigator.share({
          title: mindMap.title,
          text: mindMap.description,
          url: '' // No URL needed for sharing in SSR
        });
      } catch (error) {
        // Fallback: show message instead of copying URL
        alert("Compartir no disponible. Usa el enlace del navegador.");
      }
    }
  };

  const handleAddNode = () => {
    if (!mindMap) return;
    
    const newNode: MindMapNode = {
      id: Date.now().toString(),
      text: "Nuevo Nodo",
      x: 400,
      y: 300,
      color: "#6B7280",
      children: []
    };

    setMindMap(prev => prev ? {
      ...prev,
      nodes: [...prev.nodes, newNode]
    } : null);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!mindMap) return;
    
    setMindMap(prev => prev ? {
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId)
    } : null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-400 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Cargando mapa mental...</p>
        </div>
      </main>
    );
  }

  if (!mindMap) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            Mapa mental no encontrado
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            El mapa mental que buscas no existe o no tienes permiso para verlo.
          </p>
          <Link
            href="/mindmap"
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Mapas Mentales
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/mindmap"
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
              {mindMap.title}
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
              Actualizado {formatDate(mindMap.updated_at)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition"
          >
            <Share2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => router.push(`/mindmap/${mindMap.id}/edit`)}
            className="p-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition"
          >
            <Edit className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 border-l border-neutral-200 dark:border-neutral-700 pl-2">
            <button
              onClick={handleAddNode}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mind Map Canvas */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 h-[600px] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-neutral-400 dark:text-neutral-500">
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto">
                <div className="w-8 h-8 bg-neutral-300 dark:bg-neutral-600 rounded-full"></div>
              </div>
            </div>
            <h3 className="font-medium mb-2">Mapa Mental Visual</h3>
            <p className="text-sm">Interfaz de mapa mental en desarrollo</p>
            <div className="mt-4 space-y-2">
              {mindMap.nodes.map((node) => (
                <div key={node.id} className="flex items-center justify-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: node.color }}
                  ></div>
                  <span className="text-xs">{node.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
