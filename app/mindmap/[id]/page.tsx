"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Share2, Edit, Trash2, Plus, GitGraph } from "lucide-react";
import { useAuth } from "@/lib/authProvider";
import Link from "next/link";

interface MindMapNode {
  id: string;
  text: string;
  position: { x: number; y: number };
  type: 'central' | 'idea' | 'connection';
}

interface MindMap {
  id: string;
  title: string;
  description?: string;
  nodes: MindMapNode[];
  tags: string[];
  created_at: string;
  updated_at: string;
  category: string;
  is_public?: boolean;
}

export default function MindMapDetailPage() {
  const { session } = useAuth();
  const router = useRouter();
  const params = useParams();
  const mindMapId = params.id as string;
  
  const [mindMap, setMindMap] = useState<MindMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newNodeText, setNewNodeText] = useState("");

  useEffect(() => {
    if (!session) {
      router.push("/");
      return;
    }

    if (mindMapId) {
      loadMindMap();
    }
  }, [session, mindMapId]);

  const loadMindMap = async () => {
    try {
      setLoading(true);
      
      // Datos basados en tu proyecto actual
      const mockMindMap: MindMap = {
        id: mindMapId,
        title: "Estructura App Creativa",
        description: "Mapa mental de la arquitectura y flujo de la aplicación de creatividad",
        nodes: [
          {
            id: "1",
            text: "App Creativa",
            position: { x: 400, y: 300 },
            type: "central"
          },
          {
            id: "2",
            text: "Perfil Usuario",
            position: { x: 200, y: 200 },
            type: "idea"
          },
          {
            id: "3",
            text: "Mapas Mentales",
            position: { x: 600, y: 200 },
            type: "idea"
          },
          {
            id: "4",
            text: "Moodboards",
            position: { x: 200, y: 400 },
            type: "idea"
          },
          {
            id: "5",
            text: "Búsqueda",
            position: { x: 600, y: 400 },
            type: "idea"
          },
          {
            id: "6",
            text: "Chat Creativo",
            position: { x: 400, y: 150 },
            type: "idea"
          }
        ],
        tags: ["app", "creatividad", "arquitectura"],
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-22T15:45:00Z",
        category: "project",
        is_public: false
      };

      await new Promise(resolve => setTimeout(resolve, 800));
      setMindMap(mockMindMap);
    } catch (error) {
      console.error("Error loading mind map:", error);
    } finally {
      setLoading(false);
    }
  };

  const addNode = () => {
    if (!newNodeText.trim() || !mindMap) return;
    
    const newNode: MindMapNode = {
      id: Date.now().toString(),
      text: newNodeText,
      position: { 
        x: 300 + Math.random() * 200, 
        y: 200 + Math.random() * 200 
      },
      type: "idea"
    };
    
    setMindMap(prev => prev ? {
      ...prev,
      nodes: [...prev.nodes, newNode]
    } : null);
    
    setNewNodeText("");
  };

  const deleteNode = (nodeId: string) => {
    if (!mindMap) return;
    
    setMindMap(prev => prev ? {
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId)
    } : null);
  };

  const handleShare = async () => {
    if (navigator.share && mindMap) {
      try {
        await navigator.share({
          title: mindMap.title,
          text: mindMap.description,
          url: window.location.href
        });
      } catch (error) {
        navigator.clipboard.writeText(window.location.href);
        alert("Enlace copiado al portapapeles");
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
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/mindmap"
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
              {mindMap.title}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Actualizado {formatDate(mindMap.updated_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas del mapa mental */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <GitGraph className="w-5 h-5" />
            Canvas del Mapa Mental
          </h2>
          <div className="text-sm text-neutral-500">
            {mindMap.nodes.length} nodos
          </div>
        </div>
        
        {/* Área de dibujo simple */}
        <div className="relative w-full h-96 bg-neutral-50 dark:bg-neutral-900 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 overflow-hidden">
          {/* Conexiones simples */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {mindMap.nodes.slice(1).map((node) => (
              <line
                key={`line-${node.id}`}
                x1={mindMap.nodes[0].position.x}
                y1={mindMap.nodes[0].position.y}
                x2={node.position.x}
                y2={node.position.y}
                stroke="#6B7280"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            ))}
          </svg>

          {/* Nodos */}
          {mindMap.nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-4 py-3 rounded-lg border-2 transition-all hover:scale-105 cursor-pointer ${
                node.type === 'central'
                  ? "bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-400"
                  : "bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 hover:border-neutral-500 dark:hover:border-neutral-400"
              }`}
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`
              }}
            >
              <div className="text-sm font-medium text-neutral-900 dark:text-white">
                {node.text}
              </div>
              {isEditing && node.type !== 'central' && (
                <button
                  onClick={() => deleteNode(node.id)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Controles de edición */}
        {isEditing && (
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={newNodeText}
              onChange={(e) => setNewNodeText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addNode()}
              placeholder="Nuevo concepto..."
              className="flex-1 px-4 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400"
            />
            <button
              onClick={addNode}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Descripción */}
        {mindMap.description && (
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">
              Descripción
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
              {mindMap.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {mindMap.tags.length > 0 && (
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">
              Etiquetas
            </h3>
            <div className="flex flex-wrap gap-2">
              {mindMap.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
