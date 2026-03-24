"use client";

import { useState, useRef, useEffect } from 'react';
import { Plus, Minus, Maximize2, Users } from 'lucide-react';

interface Node {
  id: string;
  x: number;
  y: number;
  text: string;
  color?: string;
}

interface Connection {
  from: string;
  to: string;
}

interface SimpleMindMapProps {
  mindmapId?: string;
}

// Neon colors for nodes
const NODE_COLORS = [
  { bg: '#22d3ee', glow: 'rgba(34, 211, 238, 0.5)' },  // cyan
  { bg: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.5)' },  // violet
  { bg: '#f472b6', glow: 'rgba(244, 114, 182, 0.5)' }, // pink
  { bg: '#4ade80', glow: 'rgba(74, 222, 128, 0.5)' },  // green
  { bg: '#fb923c', glow: 'rgba(251, 146, 60, 0.5)' },  // orange
];

export default function SimpleMindMap({ mindmapId = 'demo-map' }: SimpleMindMapProps) {
  const [nodes, setNodes] = useState<Node[]>([
    { id: '1', x: 400, y: 300, text: 'Idea Principal', color: NODE_COLORS[0].bg }
  ]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  
  const [isDraggingConnection, setIsDraggingConnection] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{ x: number; y: number } | null>(null);
  const [connectionEnd, setConnectionEnd] = useState<{ x: number; y: number } | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const [activeUsers, setActiveUsers] = useState<number>(1);

  const canvasRef = useRef<HTMLDivElement>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveToLocal = (updatedNodes?: Node[], updatedConnections?: Connection[]) => {
    if (!mindmapId) return;
    try {
      localStorage.setItem(`mindmap-${mindmapId}`, JSON.stringify({
        nodes: updatedNodes || nodes,
        connections: updatedConnections || connections
      }));
    } catch (error) {
      console.warn('Error guardando localmente:', error);
    }
  };

  const getNodeColor = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    const index = nodes.indexOf(node!) % NODE_COLORS.length;
    return node?.color || NODE_COLORS[index].bg;
  };

  const getNodeGlow = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    const index = nodes.indexOf(node!) % NODE_COLORS.length;
    return NODE_COLORS[index].glow;
  };

  const handleAddNode = () => {
    const colorIndex = nodes.length % NODE_COLORS.length;
    const newNode: Node = {
      id: Date.now().toString(),
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      text: 'Nueva Idea',
      color: NODE_COLORS[colorIndex].bg
    };
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    saveToLocal(updatedNodes, connections);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(scale * delta, 0.1), 3);
    setScale(newScale);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.shiftKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else if (isDraggingConnection && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - panOffset.x) / scale;
      const y = (e.clientY - rect.top - panOffset.y) / scale;
      setConnectionEnd({ x, y });

      let foundHover = null;
      for (const node of nodes) {
        if (node.id === connectingFrom) continue;
        
        const nodeCenter = getNodeCenter(node.id);
        const distance = Math.sqrt(
          Math.pow(x - nodeCenter.x, 2) + Math.pow(y - nodeCenter.y, 2)
        );
        
        if (distance < 60) {
          foundHover = node.id;
          break;
        }
      }
      setHoveredNode(foundHover);
    } else if (draggingNode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - panOffset.x) / scale - dragOffset.x;
      const y = (e.clientY - rect.top - panOffset.y) / scale - dragOffset.y;

      const updatedNodes = nodes.map(node =>
        node.id === draggingNode ? { ...node, x, y } : node
      );
      setNodes(updatedNodes);
      saveToLocal(updatedNodes, connections);
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDraggingConnection && hoveredNode && connectingFrom) {
      const exists = connections.some(
        c => (c.from === connectingFrom && c.to === hoveredNode) ||
             (c.from === hoveredNode && c.to === connectingFrom)
      );
      
      if (!exists) {
        const updatedConnections = [...connections, { from: connectingFrom, to: hoveredNode }];
        setConnections(updatedConnections);
        saveToLocal(nodes, updatedConnections);
      }
    }
    
    setIsPanning(false);
    setDraggingNode(null);
    setIsDraggingConnection(false);
    setConnectionStart(null);
    setConnectionEnd(null);
    setHoveredNode(null);
    setConnectingFrom(null);
  };

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (e.ctrlKey || e.metaKey) {
      setIsDraggingConnection(true);
      setConnectingFrom(nodeId);
      const center = getNodeCenter(nodeId);
      setConnectionStart(center);
      setConnectionEnd(center);
    } else {
      setDraggingNode(nodeId);
      setDragOffset({
        x: node.x,
        y: node.y
      });
    }
  };

  const zoomIn = () => setScale(Math.min(scale * 1.2, 3));
  const zoomOut = () => setScale(Math.max(scale * 0.8, 0.1));
  const resetView = () => {
    setScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleNodeClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (editingNode) return;
    
    if (connectingFrom) {
      if (connectingFrom !== nodeId) {
        const exists = connections.some(
          c => (c.from === connectingFrom && c.to === nodeId) ||
               (c.from === nodeId && c.to === connectingFrom)
        );
        
        if (!exists) {
          const updatedConnections = [...connections, { from: connectingFrom, to: nodeId }];
          setConnections(updatedConnections);
          saveToLocal(nodes, updatedConnections);
        }
      }
      setConnectingFrom(null);
    } else {
      setConnectingFrom(nodeId);
    }
  };

  const handleDoubleClick = (nodeId: string, currentText: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNode(nodeId);
    setEditingText(currentText);
  };

  const handleEditChange = (text: string) => {
    setEditingText(text);
  };

  const handleTextBlur = () => {
    if (editingNode && editingText.trim()) {
      const updatedNodes = nodes.map(node =>
        node.id === editingNode ? { ...node, text: editingText.trim() } : node
      );
      setNodes(updatedNodes);
      saveToLocal(updatedNodes, connections);
    }
    setEditingNode(null);
    setEditingText('');
  };

  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTextBlur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditingNode(null);
      setEditingText('');
    }
  };

  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return { x: node.x + 75, y: node.y + 40 };
  };

  return (
    <div className="relative w-full h-full bg-[#050505] overflow-hidden">
      {/* Dot pattern background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,transparent_40%,rgba(255,255,255,0.03)_40%)] bg-[length:24px_24px]" />
      
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/5 rounded-full blur-[150px]" />

      {/* Add node button */}
      <button
        onClick={handleAddNode}
        className="absolute top-4 left-4 z-20 group flex items-center gap-2 px-4 py-2.5 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
          <div className="relative flex items-center justify-center w-8 h-8 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg">
            <Plus className="w-4 h-4 text-white" />
          </div>
        </div>
        <span className="text-sm font-medium text-white/80">Agregar Nodo</span>
      </button>

      {/* Mode indicator */}
      <div className="absolute top-4 left-56 z-20 flex items-center gap-3 px-4 py-2.5 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-white">{activeUsers}</span>
        </div>
        <span className="text-xs text-white/40">Local</span>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-2">
        <button
          onClick={zoomIn}
          className="p-2.5 hover:bg-white/10 rounded-lg transition-colors"
          title="Zoom In"
        >
          <Plus className="w-4 h-4 text-white/70" />
        </button>
        <button
          onClick={zoomOut}
          className="p-2.5 hover:bg-white/10 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4 text-white/70" />
        </button>
        <button
          onClick={resetView}
          className="p-2.5 hover:bg-white/10 rounded-lg transition-colors"
          title="Centrar Vista"
        >
          <Maximize2 className="w-4 h-4 text-white/70" />
        </button>
        <div className="px-2 py-1 text-xs font-medium text-center text-white/50 border-t border-white/10 mt-1">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 right-4 z-20 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 text-sm max-w-xs">
        <div className="font-bold mb-2 flex items-center gap-2 text-white">
          Cómo usar:
        </div>
        <ol className="space-y-1 text-white/50">
          <li>1. Arrastra nodos para moverlos</li>
          <li>2. <strong className="text-white/70">Doble click</strong> para editar</li>
          <li>3. <strong className="text-white/70">Ctrl+Arrastra</strong> para conectar</li>
          <li>4. Shift+Arrastra para mover canvas</li>
          <li>5. Rueda del mouse para zoom</li>
        </ol>
      </div>

      {/* Canvas with zoom and pan */}
      <div
        ref={canvasRef}
        className="relative w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onClick={() => {
          if (editingNode) {
            handleTextBlur();
          }
          setConnectingFrom(null);
        }}
      >
        <div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
            position: 'relative'
          }}
        >
          {/* SVG Connections with neon gradient */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {connections.map((conn, idx) => {
              const from = getNodeCenter(conn.from);
              const to = getNodeCenter(conn.to);
              
              return (
                <g key={idx} filter="url(#glow)">
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="url(#connectionGradient)"
                    strokeWidth={3 / scale}
                  />
                </g>
              );
            })}
            
            {isDraggingConnection && connectionStart && connectionEnd && (
              <line
                x1={connectionStart.x}
                y1={connectionStart.y}
                x2={connectionEnd.x}
                y2={connectionEnd.y}
                stroke={hoveredNode ? "#4ade80" : "#64748b"}
                strokeWidth={3 / scale}
                strokeDasharray={hoveredNode ? "0" : "8,8"}
                filter="url(#glow)"
              />
            )}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const nodeColor = getNodeColor(node.id);
            const nodeGlow = getNodeGlow(node.id);
            const isHovered = hoveredNode === node.id;
            const isConnecting = connectingFrom === node.id;
            const isEditing = editingNode === node.id;
            const isDragging = draggingNode === node.id;
            
            return (
              <div
                key={node.id}
                className={`absolute cursor-move transition-all duration-200 ${
                  isHovered ? 'scale-110' : isConnecting ? 'scale-110' : 'hover:scale-105'
                } ${isEditing ? 'ring-4 ring-yellow-400' : ''}`}
                style={{
                  left: node.x,
                  top: node.y,
                  width: 150,
                  minHeight: 80,
                  zIndex: isDragging || isEditing ? 1000 : 1
                }}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                onClick={(e) => handleNodeClick(node.id, e)}
                onDoubleClick={handleDoubleClick(node.id, node.text)}
              >
                {/* Glow effect */}
                <div 
                  className="absolute inset-0 rounded-xl blur-xl opacity-50"
                  style={{ backgroundColor: nodeGlow }}
                />
                
                {/* Node card */}
                <div 
                  className="relative h-full flex items-center justify-center p-4 rounded-xl backdrop-blur-xl transition-all"
                  style={{
                    backgroundColor: isEditing ? '#1f2937' : `${nodeColor}20`,
                    border: `1px solid ${isHovered || isConnecting ? nodeColor : `${nodeColor}50`}`,
                    boxShadow: isHovered || isConnecting ? `0 0 30px ${nodeGlow}` : `0 0 15px ${nodeGlow}40`
                  }}
                >
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => handleEditChange(e.target.value)}
                      onBlur={handleTextBlur}
                      onKeyDown={handleTextKeyDown}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className="w-full px-3 py-2 bg-white/10 text-white text-center text-sm font-bold rounded-lg outline-none ring-2 ring-yellow-400 focus:ring-yellow-300"
                      style={{ minWidth: '100px' }}
                      placeholder="Escribe aquí..."
                    />
                  ) : (
                    <div className="text-center text-sm font-bold break-words leading-tight text-white/90">
                      {node.text}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
