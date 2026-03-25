"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAutosave } from "@/hooks/useAutosave";

interface Node {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  nodeId: string | null;
}

interface MindMapCanvasProps {
  projectId?: string;
  mindmapId: string;
}

export default function MindMapCanvasFixed({ projectId, mindmapId }: MindMapCanvasProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    nodeId: null,
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-save con debounce
  const { saveToSupabase, saveStatus } = useAutosave(projectId || mindmapId, {
    debounceMs: 1000,
    onSaveComplete: () => console.log("Mindmap guardado"),
  });

  // Guardar automáticamente cuando cambian los nodos
  useEffect(() => {
    if (nodes.length > 0) {
      saveToSupabase({ nodes, scale, offset });
    }
  }, [nodes, scale, offset, saveToSupabase]);

  // Convertir coordenadas de pantalla a coordenadas de canvas
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = (screenX - rect.left - offset.x) / scale;
    const canvasY = (screenY - rect.top - offset.y) / scale;
    
    return { x: canvasX, y: canvasY };
  }, [scale, offset]);

  // Convertir coordenadas de canvas a pantalla
  const canvasToScreen = useCallback((canvasX: number, canvasY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = canvasX * scale + offset.x + rect.left;
    const screenY = canvasY * scale + offset.y + rect.top;
    
    return { x: screenX, y: screenY };
  }, [scale, offset]);

  // Manejar clic derecho para menú contextual
  const handleContextMenu = useCallback((e: React.MouseEvent, nodeId?: string) => {
    e.preventDefault();
    
    // Asegurar que el menú esté dentro de la pantalla
    const menuWidth = 200;
    const menuHeight = 150;
    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth;
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight;
    }

    setContextMenu({
      visible: true,
      x,
      y,
      nodeId: nodeId || null,
    });
  }, []);

  // Cerrar menú contextual
  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  // Manejar clic en el canvas
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    closeContextMenu();
    setSelectedNode(null);
  }, [closeContextMenu]);

  // Manejar clic en nodo
  const handleNodeClick = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNode(nodeId);
  }, []);

  // Manejar inicio de arrastre
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const canvasCoords = screenToCanvas(e.clientX, e.clientY);
    
    setDraggingNode(nodeId);
    setSelectedNode(nodeId);
    setDragOffset({
      x: canvasCoords.x - node.x,
      y: canvasCoords.y - node.y,
    });
  }, [nodes, screenToCanvas]);

  // Manejar movimiento de arrastre
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingNode || !canvasRef.current) return;

    const canvasCoords = screenToCanvas(e.clientX, e.clientY);
    
    setNodes(prev => prev.map(node =>
      node.id === draggingNode
        ? {
            ...node,
            x: canvasCoords.x - dragOffset.x,
            y: canvasCoords.y - dragOffset.y,
          }
        : node
    ));
  }, [draggingNode, dragOffset, screenToCanvas]);

  // Manejar fin de arrastre
  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
  }, []);

  // Eliminar nodo
  const handleDeleteNode = useCallback(() => {
    if (contextMenu.nodeId) {
      setNodes(prev => prev.filter(n => n.id !== contextMenu.nodeId));
      setSelectedNode(null);
    }
    closeContextMenu();
  }, [contextMenu.nodeId, closeContextMenu]);

  // Agregar nuevo nodo
  const handleAddNode = useCallback(() => {
    const canvasCoords = screenToCanvas(contextMenu.x, contextMenu.y);
    
    const newNode: Node = {
      id: `node-${Date.now()}`,
      x: canvasCoords.x,
      y: canvasCoords.y,
      text: 'Nuevo nodo',
      color: '#3b82f6',
    };
    setNodes(prev => [...prev, newNode]);
    closeContextMenu();
  }, [contextMenu.x, contextMenu.y, screenToCanvas, closeContextMenu]);

  // Cerrar menú con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeContextMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeContextMenu]);

  return (
    <div className="relative h-full bg-[#050505]">
      {/* Indicador de auto-guardado */}
      <div className="fixed top-4 right-4 flex items-center gap-2 bg-[#16161a]/80 backdrop-blur-md px-3 py-2 rounded-full border border-white/10">
        <div className={`w-2 h-2 rounded-full ${
          saveStatus === 'saving' ? 'bg-yellow-500 animate-pulse' : 
          saveStatus === 'saved' ? 'bg-green-500' : 
          'bg-gray-500'
        }`} />
        <span className="text-xs text-white/60">
          {saveStatus === 'saving' ? 'Guardando...' : 
           saveStatus === 'saved' ? 'Guardado' : 
           'Listo'}
        </span>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden relative"
      >
        <div
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
          style={{
            transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
            transformOrigin: '0 0',
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleCanvasClick}
          onContextMenu={(e) => handleContextMenu(e)}
        >
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
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              onClick={(e) => handleNodeClick(e, node.id)}
              onContextMenu={(e) => handleContextMenu(e, node.id)}
            >
              <span className="text-center px-1 select-none">{node.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Menú Contextual */}
      {contextMenu.visible && (
        <div
          className="fixed bg-[#16161a] border border-white/10 rounded-lg shadow-2xl py-2 z-50"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          {contextMenu.nodeId ? (
            <>
              <button
                onClick={handleDeleteNode}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/[0.05] flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar nodo
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleAddNode}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/[0.05] flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar nodo
              </button>
            </>
          )}
        </div>
      )}

      {/* Controles de zoom */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setScale(Math.min(scale * 1.2, 3))}
          className="p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          +
        </button>
        <button
          onClick={() => setScale(Math.max(scale / 1.2, 0.3))}
          className="p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          -
        </button>
        <button
          onClick={() => setScale(1)}
          className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          100%
        </button>
      </div>

      {/* Información */}
      <div className="absolute bottom-4 left-4 text-white/60 text-sm">
        <p>Nodos: {nodes.length} | Zoom: {Math.round(scale * 100)}%</p>
      </div>
    </div>
  );
}
