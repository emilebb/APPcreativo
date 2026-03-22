"use client";

import { useState, useRef, useEffect } from 'react';
import { Plus, Minus, Maximize2, Users } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface Node {
  id: string;
  x: number;
  y: number;
  text: string;
}

interface Connection {
  from: string;
  to: string;
}

interface SimpleMindMapProps {
  mindmapId?: string;
}

export default function SimpleMindMap({ mindmapId = 'demo-map' }: SimpleMindMapProps) {
  const [nodes, setNodes] = useState<Node[]>([
    { id: '1', x: 400, y: 300, text: 'Idea Principal' }
  ]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  
  // Estados para conexión dinámica
  const [isDraggingConnection, setIsDraggingConnection] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{ x: number; y: number } | null>(null);
  const [connectionEnd, setConnectionEnd] = useState<{ x: number; y: number } | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  // Estados para zoom y pan
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // Estados para colaboración
  const [activeUsers, setActiveUsers] = useState<number>(1);
  const [isFirebaseAvailable, setIsFirebaseAvailable] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función para sincronizar cambios a Firebase
  const syncToFirebase = async (updatedNodes?: Node[], updatedConnections?: Connection[]) => {
    if (!isFirebaseAvailable || !db || !mindmapId) return;

    // Debounce para evitar demasiadas escrituras
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      if (!db) return;
      try {
        setIsSyncing(true);
        const mapRef = doc(db, 'mindmaps', mindmapId);
        await updateDoc(mapRef, {
          nodes: updatedNodes || nodes,
          connections: updatedConnections || connections,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        console.warn('⚠️ Error sincronizando:', error);
      } finally {
        setIsSyncing(false);
      }
    }, 500);
  };

  const handleAddNode = () => {
    const newNode: Node = {
      id: Date.now().toString(),
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      text: 'Nueva Idea'
    };
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    syncToFirebase(updatedNodes, connections);
  };

  // Zoom con rueda del mouse
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(scale * delta, 0.1), 3);
    setScale(newScale);
  };

  // Pan del canvas
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.shiftKey) { // Botón medio o Shift+Click
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
      // Actualizar posición de la línea de conexión
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - panOffset.x) / scale;
      const y = (e.clientY - rect.top - panOffset.y) / scale;
      setConnectionEnd({ x, y });

      // Detectar colisión con otros nodos
      let foundHover = null;
      for (const node of nodes) {
        if (node.id === connectingFrom) continue;
        
        const nodeCenter = getNodeCenter(node.id);
        const distance = Math.sqrt(
          Math.pow(x - nodeCenter.x, 2) + Math.pow(y - nodeCenter.y, 2)
        );
        
        if (distance < 60) { // Radio de detección
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
      syncToFirebase(updatedNodes, connections);
    }
  };

  const handleCanvasMouseUp = () => {
    // Crear conexión si se soltó sobre un nodo
    if (isDraggingConnection && hoveredNode && connectingFrom) {
      const exists = connections.some(
        c => (c.from === connectingFrom && c.to === hoveredNode) ||
             (c.from === hoveredNode && c.to === connectingFrom)
      );
      
      if (!exists) {
        const updatedConnections = [...connections, { from: connectingFrom, to: hoveredNode }];
        setConnections(updatedConnections);
        syncToFirebase(nodes, updatedConnections);
      }
    }
    
    // Resetear estados
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

    // Ctrl+Click para iniciar conexión arrastrando
    if (e.ctrlKey || e.metaKey) {
      setIsDraggingConnection(true);
      setConnectingFrom(nodeId);
      const center = getNodeCenter(nodeId);
      setConnectionStart(center);
      setConnectionEnd(center);
    } else {
      // Arrastre normal del nodo
      setDraggingNode(nodeId);
      setDragOffset({
        x: node.x,
        y: node.y
      });
    }
  };

  // Controles de zoom
  const zoomIn = () => setScale(Math.min(scale * 1.2, 3));
  const zoomOut = () => setScale(Math.max(scale * 0.8, 0.1));
  const resetView = () => {
    setScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleNodeClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (connectingFrom) {
      if (connectingFrom !== nodeId) {
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
      setConnectingFrom(nodeId);
    }
  };

  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return { x: node.x + 75, y: node.y + 40 };
  };

  return (
    <div className="relative w-full h-full bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
      {/* Botón agregar nodo */}
      <button
        onClick={handleAddNode}
        className="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
      >
        <Plus className="w-5 h-5" />
        Agregar Nodo
      </button>

      {/* Indicador de colaboración */}
      <div className="absolute top-4 left-48 z-20 flex items-center gap-2 px-3 py-2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg">
        <Users className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium">{activeUsers}</span>
        {isFirebaseAvailable && (
          <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
        )}
        {!isFirebaseAvailable && (
          <span className="text-xs text-neutral-500">Local</span>
        )}
      </div>

      {/* Controles de zoom */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
        <button
          onClick={zoomIn}
          className="p-2 bg-white dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors shadow-lg"
          title="Zoom In"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={zoomOut}
          className="p-2 bg-white dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors shadow-lg"
          title="Zoom Out"
        >
          <Minus className="w-5 h-5" />
        </button>
        <button
          onClick={resetView}
          className="p-2 bg-white dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors shadow-lg"
          title="Centrar Vista"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
        <div className="px-2 py-1 bg-white dark:bg-neutral-800 rounded-lg text-xs font-medium text-center">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* Instrucciones */}
      <div className="absolute top-4 right-4 z-20 bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-lg text-sm max-w-xs">
        <div className="font-bold mb-2 flex items-center gap-2">
          Cómo usar:
          {isFirebaseAvailable && (
            <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
              Colaborativo
            </span>
          )}
        </div>
        <ol className="space-y-1 text-neutral-600 dark:text-neutral-400">
          <li>1. Arrastra nodos para moverlos</li>
          <li>2. <strong>Ctrl+Arrastra</strong> desde un nodo a otro para conectar</li>
          <li>3. Shift+Arrastra para mover canvas</li>
          <li>4. Rueda del mouse para zoom</li>
          {isFirebaseAvailable && (
            <li className="text-green-600 dark:text-green-400 font-medium">
              ✨ Los cambios se sincronizan en tiempo real
            </li>
          )}
        </ol>
      </div>

      {/* Canvas con zoom y pan */}
      <div
        ref={canvasRef}
        className="relative w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onClick={() => setConnectingFrom(null)}
      >
        {/* Contenedor con transformaciones */}
        <div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
            position: 'relative'
          }}
        >
          {/* Conexiones SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
            {/* Conexiones existentes */}
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
                  stroke="#3b82f6"
                  strokeWidth={3 / scale}
                />
              );
            })}
            
            {/* Línea de conexión dinámica (preview) */}
            {isDraggingConnection && connectionStart && connectionEnd && (
              <line
                x1={connectionStart.x}
                y1={connectionStart.y}
                x2={connectionEnd.x}
                y2={connectionEnd.y}
                stroke={hoveredNode ? "#10b981" : "#94a3b8"}
                strokeWidth={3 / scale}
                strokeDasharray={hoveredNode ? "0" : "5,5"}
              />
            )}
          </svg>

          {/* Nodos */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute cursor-move transition-all ${
                hoveredNode === node.id
                  ? 'ring-4 ring-green-500 scale-110'
                  : connectingFrom === node.id
                  ? 'ring-4 ring-blue-500 scale-110'
                  : 'hover:scale-105'
              }`}
              style={{
                left: node.x,
                top: node.y,
                width: 150,
                height: 80,
                backgroundColor: hoveredNode === node.id ? '#10b981' : '#3b82f6',
                borderRadius: '12px',
                zIndex: draggingNode === node.id ? 1000 : 1
              }}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              onClick={(e) => handleNodeClick(node.id, e)}
            >
              <div className="w-full h-full flex items-center justify-center p-3">
                <div className="text-white text-center text-sm font-bold">
                  {node.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
