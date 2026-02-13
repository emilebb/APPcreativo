"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authProvider";
import { Plus, X, Save, Eye, GitGraph, Zap, Target, Brain, Clock } from "lucide-react";
import Link from "next/link";

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  category: string;
}

interface MindMapConnection {
  id: string;
  from: string;
  to: string;
  color: string;
}

export default function NewMindMapPage() {
  const { session } = useAuth();
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [category, setCategory] = useState("brainstorm");
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [nodes, setNodes] = useState<MindMapNode[]>([]);
  const [connections, setConnections] = useState<MindMapConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const categories = [
    { id: "brainstorm", name: "Brainstorming", icon: Zap, color: "#F59E0B" },
    { id: "project", name: "Proyecto", icon: Target, color: "#3B82F6" },
    { id: "learning", name: "Aprendizaje", icon: Brain, color: "#10B981" },
    { id: "planning", name: "Planificación", icon: Clock, color: "#8B5CF6" }
  ];

  const nodeColors = [
    "#EF4444", "#F59E0B", "#10B981", "#3B82F6", 
    "#8B5CF6", "#EC4899", "#6B7280", "#059669"
  ];

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isConnecting) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Verificar si hizo clic en un nodo existente
    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
      return distance < 30;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode.id);
    } else {
      // Crear nuevo nodo
      const newNode: MindMapNode = {
        id: Date.now().toString(),
        text: "Nuevo concepto",
        x,
        y,
        color: nodeColors[Math.floor(Math.random() * nodeColors.length)],
        category
      };
      setNodes(prev => [...prev, newNode]);
      setSelectedNode(newNode.id);
    }
  }, [nodes, isConnecting, category]);

  const handleNodeClick = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isConnecting) {
      if (connectingFrom === null) {
        setConnectingFrom(nodeId);
      } else if (connectingFrom !== nodeId) {
        // Crear conexión
        const newConnection: MindMapConnection = {
          id: Date.now().toString(),
          from: connectingFrom,
          to: nodeId,
          color: "#6B7280"
        };
        setConnections(prev => [...prev, newConnection]);
        setConnectingFrom(null);
        setIsConnecting(false);
      }
    } else {
      setSelectedNode(nodeId);
    }
  }, [isConnecting, connectingFrom]);

  const updateNodeText = useCallback((nodeId: string, text: string) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, text } : node
    ));
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => 
      conn.from !== nodeId && conn.to !== nodeId
    ));
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
  }, [selectedNode]);

  const startConnecting = useCallback(() => {
    setIsConnecting(true);
    setConnectingFrom(null);
  }, []);

  const cancelConnecting = useCallback(() => {
    setIsConnecting(false);
    setConnectingFrom(null);
  }, []);

  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags(prev => [...prev, trimmedTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Por favor, añade un título");
      return;
    }

    if (nodes.length === 0) {
      alert("Por favor, añade al menos un nodo al mapa mental");
      return;
    }

    setIsSaving(true);

    try {
      // Simulación de guardado
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Saving mind map:", {
        title,
        description,
        tags,
        category,
        is_public: isPublic,
        nodes,
        connections
      });

      alert("¡Mapa mental creado exitosamente!");
      router.push("/mindmap");
    } catch (error) {
      console.error("Error saving mind map:", error);
      alert("Error al guardar el mapa mental. Intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  const clearCanvas = () => {
    if (confirm("¿Estás seguro de que quieres limpiar el canvas?")) {
      setNodes([]);
      setConnections([]);
      setSelectedNode(null);
      setConnectingFrom(null);
      setIsConnecting(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Nuevo Mapa Mental
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Organiza tus ideas de forma visual e interactiva
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            href="/mindmap"
            className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
          >
            Cancelar
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim() || nodes.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panel lateral - Configuración */}
        <div className="lg:col-span-1 space-y-6">
          {/* Información básica */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Información
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Título *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Mi mapa mental"
                className="w-full px-4 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el propósito de este mapa mental..."
                rows={3}
                className="w-full px-4 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Etiquetas
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Añadir etiqueta..."
                  className="flex-1 px-4 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                />
                <button
                  onClick={addTag}
                  className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-500 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-neutral-900 dark:text-white bg-white dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 rounded focus:ring-neutral-400"
              />
              <label htmlFor="isPublic" className="text-sm text-neutral-700 dark:text-neutral-300">
                Hacer público este mapa mental
              </label>
            </div>
          </div>

          {/* Herramientas */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Herramientas
            </h2>
            
            <div className="space-y-3">
              <button
                onClick={() => setIsConnecting(!isConnecting)}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  isConnecting
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                }`}
              >
                <GitGraph className="w-4 h-4" />
                {isConnecting ? "Conectando..." : "Conectar nodos"}
              </button>
              
              {isConnecting && (
                <button
                  onClick={cancelConnecting}
                  className="w-full px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition"
                >
                  Cancelar conexión
                </button>
              )}
              
              <button
                onClick={clearCanvas}
                className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition"
              >
                Limpiar canvas
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Estadísticas
            </h2>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Nodos:</span>
                <span className="text-neutral-900 dark:text-white">{nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Conexiones:</span>
                <span className="text-neutral-900 dark:text-white">{connections.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Etiquetas:</span>
                <span className="text-neutral-900 dark:text-white">{tags.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas del mapa mental */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Canvas del Mapa Mental
              </h2>
              <div className="text-sm text-neutral-500">
                {isConnecting ? "Click en dos nodos para conectarlos" : "Click para añadir nodos"}
              </div>
            </div>
            
            <div
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="relative w-full h-96 lg:h-[600px] bg-neutral-50 dark:bg-neutral-900 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 cursor-crosshair overflow-hidden"
              style={{ minHeight: "500px" }}
            >
              {/* Conexiones */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {connections.map((connection) => {
                  const fromNode = nodes.find(n => n.id === connection.from);
                  const toNode = nodes.find(n => n.id === connection.to);
                  
                  if (!fromNode || !toNode) return null;
                  
                  return (
                    <line
                      key={connection.id}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={connection.color}
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>

              {/* Nodos */}
              {nodes.map((node) => (
                <div
                  key={node.id}
                  onClick={(e) => handleNodeClick(node.id, e)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedNode === node.id
                      ? "border-neutral-900 dark:border-white scale-110"
                      : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-500 dark:hover:border-neutral-400"
                  } ${connectingFrom === node.id ? "ring-2 ring-blue-400" : ""}`}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    backgroundColor: node.color + "20",
                    borderColor: node.color
                  }}
                >
                  <div className="text-sm font-medium text-neutral-900 dark:text-white">
                    {node.text}
                  </div>
                  {selectedNode === node.id && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-1">
                      <input
                        type="text"
                        value={node.text}
                        onChange={(e) => updateNodeText(node.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-1 text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNode(node.id);
                        }}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
