"use client";

import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { useAutosave } from '@/hooks/useAutosave';
import AutosaveIndicator from '@/components/ui/AutosaveIndicator';

interface Node {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
}

interface Connection {
  from: string;
  to: string;
}

interface MindMapData {
  nodes: Node[];
  connections: Connection[];
}

interface MindMapCanvasWithAutosaveProps {
  mindmapId: string;
  projectId?: string;
  onSave?: (data: MindMapData) => void;
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
];

export default function MindMapCanvasWithAutosave({ 
  mindmapId, 
  projectId,
  onSave 
}: MindMapCanvasWithAutosaveProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Hook de auto-guardado
  const { saveToSupabase, saveImmediately, saveStatus } = useAutosave(
    projectId || mindmapId,
    {
      debounceMs: 1000,
      onSaveComplete: (data) => {
        console.log("Mindmap guardado exitosamente:", data);
        onSave?.({ nodes, connections });
      },
      onError: (error) => {
        console.error("Error guardando mindmap:", error);
      }
    }
  );

  // Datos combinados para guardar
  const mindmapData: MindMapData = { nodes, connections };

  // Cargar datos guardados
  useEffect(() => {
    const saved = localStorage.getItem(`mindmap-${mindmapId}`);
    if (saved) {
      try {
        const { nodes: savedNodes, connections: savedConnections } = JSON.parse(saved);
        setNodes(savedNodes || []);
        setConnections(savedConnections || []);
      } catch (error) {
        console.error("Error cargando mindmap:", error);
      }
    }
  }, [mindmapId]);

  // Auto-guardar cuando cambian los datos
  useEffect(() => {
    if (nodes.length > 0 || connections.length > 0) {
      // Guardar en localStorage como backup
      localStorage.setItem(`mindmap-${mindmapId}`, JSON.stringify(mindmapData));
      
      // Auto-guardar en Supabase si tenemos projectId
      if (projectId) {
        saveToSupabase(mindmapData);
      }
    }
  }, [nodes, connections, mindmapId, projectId, mindmapData, saveToSupabase]);

  // Guardado inmediato para acciones importantes
  const handleImmediateSave = () => {
    if (projectId) {
      saveImmediately(mindmapData);
    }
  };

  const handleAddNode = () => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      x: 400 + Math.random() * 200 - 100,
      y: 300 + Math.random() * 200 - 100,
      text: 'Nuevo nodo',
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
    setNodes([...nodes, newNode]);
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId));
    setSelectedNode(null);
  };

  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setDraggingNode(nodeId);
    setSelectedNode(nodeId);
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    setNodes(nodes.map(node =>
      node.id === draggingNode
        ? { ...node, x, y }
        : node
    ));
  };

  const handleMouseUp = () => {
    if (draggingNode) {
      // Guardado inmediato cuando se suelta un nodo
      handleImmediateSave();
    }
    setDraggingNode(null);
  };

  const handleNodeClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (connectingFrom) {
      if (connectingFrom !== nodeId) {
        // Crear conexión
        const exists = connections.some(
          c => (c.from === connectingFrom && c.to === nodeId) ||
               (c.from === nodeId && c.to === connectingFrom)
        );
        
        if (!exists) {
          setConnections([...connections, { from: connectingFrom, to: nodeId }]);
          handleImmediateSave(); // Guardado inmediato al crear conexión
        }
      }
      setConnectingFrom(null);
    } else {
      setSelectedNode(nodeId);
      // Permitir editar con un solo click si el nodo ya está seleccionado
      if (selectedNode === nodeId && !draggingNode) {
        setEditingNode(nodeId);
      }
    }
  };

  const handleNodeTextChange = (nodeId: string, newText: string) => {
    setNodes(nodes.map(node =>
      node.id === nodeId ? { ...node, text: newText } : node
    ));
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Verificar si hizo clic en un nodo existente
    const clickedNode = nodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < 40; // Radio del nodo
    });

    if (!clickedNode && !connectingFrom) {
      setSelectedNode(null);
      setEditingNode(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' && selectedNode) {
      handleDeleteNode(selectedNode);
    }
    if (e.key === 'Escape') {
      setConnectingFrom(null);
      setSelectedNode(null);
      setEditingNode(null);
    }
  };

  return (
    <div className="relative h-full bg-[#050505]" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Indicador de auto-guardado */}
      <AutosaveIndicator status={saveStatus} />

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
      >
        {/* Conexiones */}
        <svg className="absolute inset-0 pointer-events-none">
          {connections.map((connection, index) => {
            const fromNode = nodes.find(n => n.id === connection.from);
            const toNode = nodes.find(n => n.id === connection.to);
            
            if (!fromNode || !toNode) return null;
            
            return (
              <line
                key={index}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="#666"
                strokeWidth="2"
              />
            );
          })}
        </svg>

        {/* Nodos */}
        {nodes.map(node => (
          <div
            key={node.id}
            className={`absolute w-20 h-20 rounded-full flex items-center justify-center text-white font-medium text-xs cursor-pointer transition-all ${
              selectedNode === node.id ? 'ring-2 ring-violet-500' : ''
            } ${draggingNode === node.id ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{
              left: node.x - 40,
              top: node.y - 40,
              backgroundColor: node.color,
            }}
            onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
            onClick={(e) => handleNodeClick(node.id, e)}
          >
            {editingNode === node.id ? (
              <input
                type="text"
                value={node.text}
                onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                onBlur={() => setEditingNode(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setEditingNode(null);
                    handleImmediateSave(); // Guardado inmediato al editar texto
                  }
                }}
                className="w-16 text-center bg-transparent border-none outline-none text-white"
                autoFocus
              />
            ) : (
              <span className="text-center px-1">{node.text}</span>
            )}
          </div>
        ))}
      </div>

      {/* Controles */}
      <div className="absolute top-4 left-4 flex gap-2">
        <button
          onClick={handleAddNode}
          className="p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          title="Agregar nodo"
        >
          <Plus className="w-4 h-4" />
        </button>
        
        {selectedNode && (
          <button
            onClick={() => handleDeleteNode(selectedNode)}
            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            title="Eliminar nodo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={handleImmediateSave}
          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          title="Guardar ahora"
        >
          <Save className="w-4 h-4" />
        </button>
      </div>

      {/* Información */}
      <div className="absolute bottom-4 left-4 text-white/60 text-sm">
        <p>Nodos: {nodes.length} | Conexiones: {connections.length}</p>
        <p className="text-xs mt-1">Click para seleccionar | Click en nodo para editar | Delete para eliminar</p>
      </div>
    </div>
  );
}
