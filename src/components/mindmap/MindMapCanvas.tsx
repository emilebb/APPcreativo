"use client";

import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';

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

interface MindMapCanvasProps {
  mindmapId: string;
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

export default function MindMapCanvas({ mindmapId, onSave }: MindMapCanvasProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Cargar datos guardados
  useEffect(() => {
    const saved = localStorage.getItem(`mindmap-${mindmapId}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setNodes(data.nodes || []);
        setConnections(data.connections || []);
      } catch (error) {
        console.error('Error loading mindmap data:', error);
        // Si hay error, iniciar con nodo vacío
        setNodes([]);
        setConnections([]);
      }
    } else {
      // No hay datos guardados, iniciar vacío
      setNodes([]);
      setConnections([]);
    }
  }, [mindmapId]);

  // Guardar automáticamente
  useEffect(() => {
    if (nodes.length > 0) {
      const data = { nodes, connections };
      localStorage.setItem(`mindmap-${mindmapId}`, JSON.stringify(data));
      onSave?.(data);
    }
  }, [nodes, connections, mindmapId, onSave]);

  const handleAddNode = () => {
    const newNode: Node = {
      id: Date.now().toString(),
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      text: 'Nueva Idea',
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
    setNodes([...nodes, newNode]);
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId));
    setSelectedNode(null);
  };

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (editingNode === nodeId) return;
    
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

  const handleDoubleClick = (nodeId: string) => {
    setEditingNode(nodeId);
  };

  const handleTextChange = (nodeId: string, text: string) => {
    setNodes(nodes.map(node =>
      node.id === nodeId ? { ...node, text } : node
    ));
  };

  const handleTextBlur = () => {
    setEditingNode(null);
  };

  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return { x: node.x + 75, y: node.y + 40 }; // Centro del nodo
  };

  return (
    <div className="relative w-full h-full bg-neutral-50 dark:bg-neutral-900">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
        <button
          onClick={handleAddNode}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" />
          Nuevo Nodo
        </button>
        
        <button
          onClick={() => setConnectingFrom(selectedNode)}
          disabled={!selectedNode}
          className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {connectingFrom ? 'Selecciona destino...' : 'Conectar'}
        </button>

        {selectedNode && (
          <button
            onClick={() => handleDeleteNode(selectedNode)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors shadow-md text-red-600 dark:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        )}
        
        {nodes.length > 0 && (
          <button
            onClick={() => {
              if (confirm('¿Limpiar todo el canvas? Esta acción no se puede deshacer.')) {
                setNodes([]);
                setConnections([]);
                setSelectedNode(null);
                localStorage.removeItem(`mindmap-${mindmapId}`);
              }
            }}
            className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors shadow-md text-neutral-600 dark:text-neutral-400 text-sm"
          >
            Limpiar Todo
          </button>
        )}
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative w-full h-full overflow-hidden cursor-default"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={() => {
          setSelectedNode(null);
          setConnectingFrom(null);
        }}
      >
        {/* SVG para conexiones */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {connections.map((conn, idx) => {
            const from = getNodeCenter(conn.from);
            const to = getNodeCenter(conn.to);
            
            return (
              <line
                key={idx}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            );
          })}
        </svg>

        {/* Nodos */}
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`absolute cursor-move transition-shadow ${
              selectedNode === node.id
                ? 'ring-2 ring-blue-500 shadow-lg'
                : 'shadow-md'
            }`}
            style={{
              left: node.x,
              top: node.y,
              width: 150,
              height: 80,
              backgroundColor: node.color,
              borderRadius: '12px',
              zIndex: draggingNode === node.id ? 1000 : 1
            }}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
            onClick={(e) => handleNodeClick(node.id, e)}
            onDoubleClick={() => handleDoubleClick(node.id)}
          >
            <div className="w-full h-full flex items-center justify-center p-3">
              {editingNode === node.id ? (
                <input
                  type="text"
                  value={node.text}
                  onChange={(e) => handleTextChange(node.id, e.target.value)}
                  onBlur={handleTextBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTextBlur();
                  }}
                  autoFocus
                  className="w-full h-full bg-white/90 dark:bg-black/30 text-white text-center text-sm font-medium rounded px-2 outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div className="text-white text-center text-sm font-medium break-words">
                  {node.text}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Instrucciones */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg p-3 text-xs text-neutral-600 dark:text-neutral-400 shadow-md max-w-xs">
        <div className="font-semibold mb-1">Instrucciones:</div>
        <ul className="space-y-1">
          <li>• <strong>Arrastrar:</strong> Click y arrastra un nodo</li>
          <li>• <strong>Editar:</strong> Click 2 veces en el mismo nodo o doble click</li>
          <li>• <strong>Conectar:</strong> Selecciona un nodo, click "Conectar", luego click en otro nodo</li>
          <li>• <strong>Eliminar:</strong> Selecciona un nodo y click "Eliminar"</li>
        </ul>
      </div>

      {/* Contador de nodos */}
      {nodes.length > 0 && (
        <div className="absolute top-4 right-4 bg-white dark:bg-neutral-800 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 shadow-md">
          {nodes.length} {nodes.length === 1 ? 'nodo' : 'nodos'}
        </div>
      )}
      
      {/* Mensaje cuando no hay nodos */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-neutral-400 dark:text-neutral-500">
            <div className="text-lg font-medium mb-2">Canvas vacío</div>
            <p className="text-sm">Click en "Nuevo Nodo" para comenzar</p>
          </div>
        </div>
      )}
    </div>
  );
}
