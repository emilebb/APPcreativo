'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Transformer } from 'react-konva';
import { useCanvasStore, CanvasElement, generateId } from '@/store/useCanvasStore';
import { 
  MousePointer2, Hand, Pencil, Square, Circle as CircleIcon, 
  Type, Trash2, Undo2, Redo2, ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react';

// ============================================================================
// ICONS (inline para evitar dependencias)
// ============================================================================

const Icons = {
  ZoomIn: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6"/><path d="M8 11h6"/>
    </svg>
  ),
  ZoomOut: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M8 11h6"/>
    </svg>
  ),
  RotateCcw: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
    </svg>
  ),
};

// ============================================================================
// CANVAS BOARD
// ============================================================================

export default function CanvasBoard() {
  // ---------------------------------------------------------------------------
  // REFS
  // ---------------------------------------------------------------------------
  
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  
  // ---------------------------------------------------------------------------
  // STORE
  // ---------------------------------------------------------------------------
  
  const tool = useCanvasStore((s) => s.tool);
  const elements = useCanvasStore((s) => s.elements);
  const selectedId = useCanvasStore((s) => s.selectedId);
  const setTool = useCanvasStore((s) => s.setTool);
  const addElement = useCanvasStore((s) => s.addElement);
  const updateElement = useCanvasStore((s) => s.updateElement);
  const selectElement = useCanvasStore((s) => s.selectElement);
  const deleteElement = useCanvasStore((s) => s.deleteElement);
  
  // ---------------------------------------------------------------------------
  // ESTADO LOCAL
  // ---------------------------------------------------------------------------
  
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<number[]>([]);
  const [drawingId, setDrawingId] = useState<string | null>(null);
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);

  // ---------------------------------------------------------------------------
  // RESPONSIVE
  // ---------------------------------------------------------------------------
  
  useEffect(() => {
    const updateSize = () => {
      const container = document.getElementById('canvas-container');
      if (container) {
        setDimensions({
          width: container.offsetWidth,
          height: container.offsetHeight,
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // ---------------------------------------------------------------------------
  // TRANSFORMER - Selección visual
  // ---------------------------------------------------------------------------
  
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    
    const stage = stageRef.current;
    const selectedNode = selectedId ? stage.findOne(`#${selectedId}`) : null;
    
    transformerRef.current.nodes(selectedNode ? [selectedNode] : []);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedId]);

  // ---------------------------------------------------------------------------
  // ATAJOS DE TECLADO
  // ---------------------------------------------------------------------------
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si estamos en un input
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      
      // Herramientas
      if (!e.ctrlKey && !e.metaKey) {
        if (e.key === 'v' || e.key === 'V') setTool('select');
        if (e.key === 'p' || e.key === 'P') setTool('pen');
        if (e.key === 'r' || e.key === 'R') setTool('rect');
        if (e.key === 'o' || e.key === 'O') setTool('circle');
        if (e.key === 't' || e.key === 'T') setTool('text');
      }
      
      // Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        deleteElement(selectedId);
      }
      
      // Escape
      if (e.key === 'Escape') {
        selectElement(null);
        setTool('select');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, setTool, deleteElement, selectElement]);

  // ---------------------------------------------------------------------------
  // OBTENER POSICIÓN DEL MOUSE
  // ---------------------------------------------------------------------------
  
  const getPointerPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    
    // Ajustar por scale y posición del stage
    return {
      x: (pos.x - stagePos.x) / stageScale,
      y: (pos.y - stagePos.y) / stageScale,
    };
  }, [stageScale, stagePos]);

  // ---------------------------------------------------------------------------
  // MOUSE DOWN - Crear elementos
  // ---------------------------------------------------------------------------
  
  const handleMouseDown = useCallback((e: any) => {
    const pos = getPointerPosition();
    if (!pos) return;
    
    // Click en el stage vacío
    const clickedOnEmpty = e.target === e.target.getStage();
    
    // En modo seleccionar, deseleccionar si clickeamos vacío
    if (tool === 'select') {
      if (clickedOnEmpty) {
        selectElement(null);
      }
      return;
    }
    
    // CREAR ELEMENTOS SEGÚN HERRAMIENTA
    if (tool === 'rect') {
      addElement({
        id: generateId(),
        type: 'rect',
        x: pos.x,
        y: pos.y,
        width: 120,
        height: 80,
        fill: 'transparent',
        stroke: strokeColor,
        strokeWidth: strokeWidth,
      });
    }
    
    if (tool === 'circle') {
      addElement({
        id: generateId(),
        type: 'circle',
        x: pos.x,
        y: pos.y,
        radius: 50,
        fill: 'transparent',
        stroke: strokeColor,
        strokeWidth: strokeWidth,
      });
    }
    
    if (tool === 'pen') {
      setIsDrawing(true);
      const id = generateId();
      setDrawingId(id);
      setCurrentPoints([pos.x, pos.y]);
      
      addElement({
        id,
        type: 'line',
        x: 0,
        y: 0,
        points: [pos.x, pos.y],
        stroke: strokeColor,
        strokeWidth: strokeWidth,
      });
    }
    
    if (tool === 'text') {
      const text = prompt('Ingrese el texto:');
      if (text && text.trim()) {
        addElement({
          id: generateId(),
          type: 'text',
          x: pos.x,
          y: pos.y,
          text: text.trim(),
          fontSize: 16,
          fill: strokeColor,
        });
      }
    }
  }, [tool, getPointerPosition, selectElement, addElement, strokeColor, strokeWidth]);

  // ---------------------------------------------------------------------------
  // MOUSE MOVE - Dibujar
  // ---------------------------------------------------------------------------
  
  const handleMouseMove = useCallback((e: any) => {
    if (!isDrawing || tool !== 'pen' || !drawingId) return;
    
    const pos = getPointerPosition();
    if (!pos) return;
    
    setCurrentPoints((prev) => [...prev, pos.x, pos.y]);
    updateElement(drawingId, {
      points: [...currentPoints, pos.x, pos.y],
    });
  }, [isDrawing, tool, drawingId, getPointerPosition, currentPoints, updateElement]);

  // ---------------------------------------------------------------------------
  // MOUSE UP - Terminar
  // ---------------------------------------------------------------------------
  
  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    setDrawingId(null);
    setCurrentPoints([]);
  }, []);

  // ---------------------------------------------------------------------------
  // CLICK EN ELEMENTO - Seleccionar
  // ---------------------------------------------------------------------------
  
  const handleElementClick = useCallback((e: any, id: string) => {
    if (tool !== 'select') return;
    e.cancelBubble = true;
    selectElement(id);
  }, [tool, selectElement]);

  // ---------------------------------------------------------------------------
  // DRAG END - Mover elemento
  // ---------------------------------------------------------------------------
  
  const handleDragEnd = useCallback((e: any, id: string) => {
    updateElement(id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  }, [updateElement]);

  // ---------------------------------------------------------------------------
  // ZOOM
  // ---------------------------------------------------------------------------
  
  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;
    
    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const clampedScale = Math.max(0.1, Math.min(5, newScale));
    
    setStageScale(clampedScale);
  }, [stageScale]);

  // ---------------------------------------------------------------------------
  // CURSOR
  // ---------------------------------------------------------------------------
  
  const getCursor = () => {
    switch (tool) {
      case 'select': return 'default';
      case 'pen': return 'crosshair';
      case 'rect': return 'crosshair';
      case 'circle': return 'crosshair';
      case 'text': return 'text';
      default: return 'default';
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  
  return (
    <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        
        {/* Herramientas */}
        <div className="flex items-center gap-2">
          {/* Select */}
          <button
            onClick={() => setTool('select')}
            className={`p-2 rounded-lg transition-all ${
              tool === 'select'
                ? 'bg-blue-500 text-white'
                : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
            }`}
          >
            <MousePointer2 size={20} />
          </button>
          
          {/* Pen */}
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-lg transition-all ${
              tool === 'pen'
                ? 'bg-blue-500 text-white'
                : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
            }`}
          >
            <Pencil size={20} />
          </button>
          
          {/* Rect */}
          <button
            onClick={() => setTool('rect')}
            className={`p-2 rounded-lg transition-all ${
              tool === 'rect'
                ? 'bg-blue-500 text-white'
                : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
            }`}
          >
            <Square size={20} />
          </button>
          
          {/* Circle */}
          <button
            onClick={() => setTool('circle')}
            className={`p-2 rounded-lg transition-all ${
              tool === 'circle'
                ? 'bg-blue-500 text-white'
                : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
            }`}
          >
            <CircleIcon size={20} />
          </button>
          
          {/* Text */}
          <button
            onClick={() => setTool('text')}
            className={`p-2 rounded-lg transition-all ${
              tool === 'text'
                ? 'bg-blue-500 text-white'
                : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
            }`}
          >
            <Type size={20} />
          </button>
        </div>
        
        {/* Colores */}
        <div className="flex items-center gap-2">
          {['#000000', '#ef4444', '#22c55e', '#3b82f6', '#f97316', '#8b5cf6'].map((color) => (
            <button
              key={color}
              onClick={() => setStrokeColor(color)}
              className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                strokeColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0"
          />
        </div>
        
        {/* Grosor */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">{strokeWidth}px</span>
          <input
            type="range"
            min={1}
            max={20}
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-20"
          />
        </div>
        
        {/* Zoom */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setStageScale((s) => Math.max(0.1, s / 1.2))}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <Icons.ZoomOut />
          </button>
          <span className="text-xs text-neutral-500 min-w-[50px] text-center">
            {Math.round(stageScale * 100)}%
          </span>
          <button
            onClick={() => setStageScale((s) => Math.min(5, s * 1.2))}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <Icons.ZoomIn />
          </button>
          <button
            onClick={() => { setStageScale(1); setStagePos({ x: 0, y: 0 }); }}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <Icons.RotateCcw />
          </button>
        </div>
      </div>
      
      {/* Canvas */}
      <div 
        id="canvas-container" 
        className="flex-1 overflow-hidden"
        style={{ cursor: getCursor() }}
      >
        <Stage
          ref={stageRef}
          width={dimensions.width}
          height={dimensions.height}
          x={stagePos.x}
          y={stagePos.y}
          scaleX={stageScale}
          scaleY={stageScale}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <Layer>
            {/* Elementos */}
            {elements.map((el) => {
              const isSelected = selectedId === el.id;
              
              const commonProps = {
                key: el.id,
                id: el.id,
                x: el.x,
                y: el.y,
                draggable: tool === 'select',
                onClick: (e: any) => handleElementClick(e, el.id),
                onDragEnd: (e: any) => handleDragEnd(e, el.id),
                shadowColor: isSelected ? '#3b82f6' : undefined,
                shadowBlur: isSelected ? 10 : 0,
                shadowOpacity: isSelected ? 0.5 : 0,
              };
              
              if (el.type === 'rect') {
                return (
                  <Rect
                    {...commonProps}
                    width={el.width}
                    height={el.height}
                    fill={el.fill}
                    stroke={el.stroke}
                    strokeWidth={el.strokeWidth}
                  />
                );
              }
              
              if (el.type === 'circle') {
                return (
                  <Circle
                    {...commonProps}
                    radius={el.radius}
                    fill={el.fill}
                    stroke={el.stroke}
                    strokeWidth={el.strokeWidth}
                  />
                );
              }
              
              if (el.type === 'line') {
                return (
                  <Line
                    {...commonProps}
                    points={el.points || []}
                    stroke={el.stroke}
                    strokeWidth={el.strokeWidth}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                    hitStrokeWidth={20}
                  />
                );
              }
              
              if (el.type === 'text') {
                return (
                  <Text
                    {...commonProps}
                    text={el.text || ''}
                    fontSize={el.fontSize || 16}
                    fill={el.fill}
                  />
                );
              }
              
              return null;
            })}
            
            {/* Dibujo en proceso */}
            {isDrawing && tool === 'pen' && currentPoints.length > 0 && (
              <Line
                points={currentPoints}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
              />
            )}
            
            {/* Transformer */}
            <Transformer
              ref={transformerRef}
              rotateEnabled={true}
              enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
              boundBoxFunc={(oldBox: any, newBox: any) => {
                if (newBox.width < 5 || newBox.height < 5) return oldBox;
                return newBox;
              }}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
