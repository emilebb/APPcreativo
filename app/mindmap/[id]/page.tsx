"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authProvider";
import { ArrowLeft, Share2, Edit, Network } from "lucide-react";
import Link from "next/link";
import SimpleMindMap from "@/components/mindmap/SimpleMindMap";

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
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const mindMapId = params.id as string;
  
  const [mindMap, setMindMap] = useState<MindMap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && mindMapId) {
      loadMindMap();
    }
  }, [user, mindMapId]);

  const loadMindMap = async () => {
    try {
      setLoading(true);
      
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
          url: ''
        });
      } catch (error) {
        alert("Compartir no disponible. Usa el enlace del navegador.");
      }
    }
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
      <main className="w-full h-screen bg-[#050505] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[150px]" />
        </div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
            <p className="text-neutral-400 text-sm">Cargando mapa mental...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!mindMap) {
    return (
      <main className="w-full h-screen bg-[#050505] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[150px]" />
        </div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center max-w-md mx-auto p-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
            <h2 className="text-xl font-semibold text-white mb-2">
              Mapa mental no encontrado
            </h2>
            <p className="text-neutral-400 mb-6">
              El mapa mental que buscas no existe o no tienes permiso para verlo.
            </p>
            <Link
              href="/mindmap"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-500 text-white rounded-xl hover:opacity-90 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Mapas Mentales
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-[#050505] relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,transparent_40%,rgba(255,255,255,0.02)_40%)] bg-[length:24px_24px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex-shrink-0 backdrop-blur-xl bg-white/5 border-b border-white/10 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/mindmap"
              className="flex-shrink-0 p-2.5 hover:bg-white/10 rounded-xl transition-colors backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-xl blur-md opacity-50" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-xl flex items-center justify-center">
                  <Network className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-white truncate">
                  {mindMap.title}
                </h1>
                <p className="text-xs text-white/50 truncate">
                  Actualizado {formatDate(mindMap.updated_at)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleShare}
              className="p-2.5 backdrop-blur-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              title="Compartir"
            >
              <Share2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => router.push(`/mindmap/${mindMap.id}/edit`)}
              className="relative group p-2.5"
              title="Editar"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl p-2.5 text-white">
                <Edit className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mind Map Canvas */}
      <div className="flex-1 w-full relative overflow-hidden">
        <SimpleMindMap mindmapId={mindMapId} />
      </div>
    </div>
  );
}
