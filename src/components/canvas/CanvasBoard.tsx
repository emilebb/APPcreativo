'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Transformer } from 'react-konva';
import { useCanvasStore } from '@/stores/canvasStore';
import { 
  MousePointer2, Pencil, Square, Circle as CircleIcon, 
  Type, Undo2, Redo2, Trash2, ZoomIn, ZoomOut, Save, Maximize2
} from 'lucide-react';

// ============================================================================
// HERRAMIENTAS DISPONIBLES
// ============================================================================

const TOOLS = [
  { id: 'select', icon: MousePointer2, label: 'Seleccionar', key: 'V' },
  { id: 'rect', icon: Square, label: 'Rectángulo', key: 'R' },
  { id: 'circle', icon: CircleIcon, label: 'Círculo', key: 'O' },
  { id: 'pencil', icon: Pencil, label: 'Lápiz', key: 'B' },
  { id: 'text', icon: Type, label: 'Texto', key: 'T' },
];

const COLORS = ['#000000', '#ef4444', '#22c55e', '#3b82f6', '#f97316', '#8b5cf6'];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function CanvasBoard() {
  // ---------------------------------------------------------------------------
  // REFS
  // ---------------------------------------------------------------------------
  
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  
  // ---------------------------------------------------------------------------
  // STORE - Estado global
  // ---------------------------------------------------------------------------
  
  const elements = useCanvasStore((s) => s.elements);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const currentTool = useCanvasStore((s) => s.currentTool);
  const style = useCanvasStore((s) => s.style);
  const stageScale = useCanvasStore((s) => s.stageScale);
  const isDirty = useCanvasStore((s) => s.isDirty);
  
  const addElement = useCanvasStore((s) => s.addElement);
  const updateElement = useCanvasStore((s) => s.updateElement);
  const deleteSelected = useCanvasStore((s) => s.deleteSelected);
  const select = useCanvasStore((s) => s.select);
  const clearSelection = useCanvasStore((s) => s.clearSelection);
  const setTool = useCanvasStore((s) => s.setTool);
  const setStyle = useCanvasStore((s) => s.setStyle);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const canUndo = useCanvasStore((s) => s.canUndo);
  const canRedo = useCanvasStore((s) => s.canRedo);
  const pushToHistory = useCanvasStore((s) => s.pushToHistory);
  const clearCanvas = useCanvasStore((s) => s.clearCanvas);
  const setViewport = useCanvasStore((s) => s.setViewport);
  const zoomIn = useCanvasStore((s) => s.zoomIn);
  const zoomOut = useCanvasStore((s) => s.zoomOut);
  const resetZoom = useCanvasStore((s) => s.resetZoom);

  // ---------------------------------------------------------------------------
  // ESTADO LOCAL
  // ---------------------------------------------------------------------------
  
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<number[]>([]);
  const [drawingId, setDrawingId] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // RESPONSIVE
  // ---------------------------------------------------------------------------
  
  useEffect(() => {
    const updateSize = () => {
      const container = document.getElementById('canvas-container');
      if (container) {
        setSize({ width: container.offsetWidth, height: container.offsetHeight });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // ---------------------------------------------------------------------------
  // TRANSFORMER - Seleccionar y redimensionar
  // ---------------------------------------------------------------------------
  
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    
    const stage = stageRef.current;
    const nodes = selectedIds
      .map((id: string) => stage.findOne(`#${id}`))
      .filter((n: any) => n);
    
    transformerRef.current.nodes(nodes);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedIds]);

  // ---------------------------------------------------------------------------
  // ATAJOS DE TECLADO
  // ---------------------------------------------------------------------------
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      
      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      
      // Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        e.preventDefault();
        pushToHistory();
        deleteSelected();
      }
      
      // Escape
      if (e.key === 'Escape') {
        clearSelection();
        setTool('select');
      }
      
      // Herramientas
      const key = e.key.toUpperCase();
      if (!e.ctrlKey && !e.metaKey) {
        if (key === 'V') setTool('select');
        if (key === 'R') setTool('rect');
        if (key === 'O') setTool('circle');
        if (key === 'B') setTool('pencil');
        if (key === 'T') setTool('text');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, undo, redo, deleteSelected, clearSelection, setTool, pushToHistory]);

  // ---------------------------------------------------------------------------
  // CLICK EN EL STAGE - Crear elementos
  // ---------------------------------------------------------------------------
  
  const handleStageMouseDown = useCallback((e: any) => {
    const stage = stageRef.current;
    if (!stage) return;
    
    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Si clickeamos en el stage vacío
    const clickedOnEmpty = e.target === stage;

    // En modo seleccionar, deseleccionar si clickeamos vacío
    if (currentTool === 'select') {
      if (clickedOnEmpty) {
        clearSelection();
      }
      return;
    }

    // Modos de creación
    if (currentTool === 'rect') {
      pushToHistory();
      addElement({
        id: `rect_${Date.now()}`,
        type: 'rect',
        x: pos.x,
        y: pos.y,
        width: 120,
        height: 80,
        fill: 'transparent',
        stroke: style.strokeColor,
        strokeWidth: style.strokeWidth,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: elements.length,
      });
    }

    if (currentTool === 'circle') {
      pushToHistory();
      addElement({
        id: `circle_${Date.now()}`,
        type: 'circle',
        x: pos.x,
        y: pos.y,
        radius: 50,
        fill: 'transparent',
        stroke: style.strokeColor,
        strokeWidth: style.strokeWidth,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: elements.length,
      });
    }

    if (currentTool === 'pencil') {
      setIsDrawing(true);
      const id = `pencil_${Date.now()}`;
      setDrawingId(id);
      setCurrentPoints([pos.x, pos.y]);
      addElement({
        id,
        type: 'freeform',
        x: 0,
        y: 0,
        points: [pos.x, pos.y],
        stroke: style.strokeColor,
        strokeWidth: style.strokeWidth,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: elements.length,
      });
    }

    if (currentTool === 'text') {
      const text = prompt('Ingrese el texto:');
      if (text && text.trim()) {
        pushToHistory();
        addElement({
          id: `text_${Date.now()}`,
          type: 'text',
          x: pos.x,
          y: pos.y,
          text: text.trim(),
          fontSize: style.fontSize,
          fontFamily: 'Inter',
          fill: style.strokeColor,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          locked: false,
          visible: true,
          zIndex: elements.length,
        });
      }
    }
  }, [currentTool, clearSelection, style, elements.length, pushToHistory, addElement]);

  // ---------------------------------------------------------------------------
  // MOUSE MOVE - Dibujar
  // ---------------------------------------------------------------------------
  
  const handleStageMouseMove = useCallback((e: any) => {
    if (!isDrawing || currentTool !== 'pencil' || !drawingId) return;

    const stage = stageRef.current;
    if (!stage) return;
    
    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Actualizar puntos del elemento actual
    setCurrentPoints((prev) => [...prev, pos.x, pos.y]);
    updateElement(drawingId, {
      points: [...currentPoints, pos.x, pos.y],
    });
  }, [isDrawing, currentTool, drawingId, currentPoints, updateElement]);

  // ---------------------------------------------------------------------------
  // MOUSE UP - Terminar dibujo
  // ---------------------------------------------------------------------------
  
  const handleStageMouseUp = useCallback(() => {
    setIsDrawing(false);
    setDrawingId(null);
    setCurrentPoints([]);
  }, []);

  // ---------------------------------------------------------------------------
  // CLICK EN ELEMENTO - Seleccionar
  // ---------------------------------------------------------------------------
  
  const handleElementClick = useCallback((e: any, id: string) => {
    if (currentTool !== 'select') return;
    e.cancelBubble = true;
    select(id, e.evt.shiftKey);
  }, [currentTool, select]);

  // ---------------------------------------------------------------------------
  // DRAG END - Mover elemento
  // ---------------------------------------------------------------------------
  
  const handleDragEnd = useCallback((e: any, id: string) => {
    pushToHistory();
    updateElement(id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  }, [pushToHistory, updateElement]);

  // ---------------------------------------------------------------------------
  // TRANSFORM END - Redimensionar/Rotar
  // ---------------------------------------------------------------------------
  
  const handleTransformEnd = useCallback((e: any, id: string) => {
    const node = e.target;
    pushToHistory();
    updateElement(id, {
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
    });
    // Reset scale después de transform (importante para mantener tamaño)
    node.scaleX(1);
    node.scaleY(1);
  }, [pushToHistory, updateElement]);

  // ---------------------------------------------------------------------------
  // DOBLE CLICK - Editar texto
  // ---------------------------------------------------------------------------
  
  const handleDblClick = useCallback((e: any, id: string, currentText: string) => {
    if (currentTool !== 'select') return;
    const newText = prompt('Editar texto:', currentText);
    if (newText !== null && newText !== currentText) {
      pushToHistory();
      updateElement(id, { text: newText });
    }
  }, [currentTool, pushToHistory, updateElement]);

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

    const mousePointTo = {
      x: pointer.x / oldScale,
      y: pointer.y / oldScale,
    };

    setViewport(
      pointer.x - mousePointTo.x * clampedScale,
      pointer.y - mousePointTo.y * clampedScale,
      clampedScale
    );
  }, [stageScale, setViewport]);

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  
  return (
    <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        
        {/* Herramientas */}
        <div className="flex items-center gap-1">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = currentTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setTool(tool.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300'
                }`}
                title={`${tool.label} (${tool.key})`}
              >
                <Icon size={18} />
                <span className="text-sm hidden sm:inline">{tool.label}</span>
              </button>
            );
          })}
        </div>

        {/* Colores */}
        <div className="flex items-center gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setStyle({ strokeColor: color })}
              className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                style.strokeColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <input
            type="color"
            value={style.strokeColor}
            onChange={(e) => setStyle({ strokeColor: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border-0"
          />
        </div>

        {/* Grosor */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">{style.strokeWidth}px</span>
          <input
            type="range"
            min={1}
            max={20}
            value={style.strokeWidth}
            onChange={(e) => setStyle({ strokeWidth: Number(e.target.value) })}
            className="w-20"
          />
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={!canUndo()}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30"
            title="Deshacer (Ctrl+Z)"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30"
            title="Rehacer (Ctrl+Y)"
          >
            <Redo2 size={18} />
          </button>
          <button
            onClick={() => confirm('¿Limpiar todo?') && (pushToHistory(), clearCanvas())}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
            title="Limpiar"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div id="canvas-container" className="flex-1 overflow-hidden">
        <Stage
          ref={stageRef}
          width={size.width}
          height={size.height}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          onMouseLeave={handleStageMouseUp}
          onWheel={handleWheel}
        >
          <Layer>
            {/* Elementos */}
            {elements.map((el: any) => {
              const isSelected = selectedIds.includes(el.id);
              
              const commonProps = {
                id: el.id,
                x: el.x,
                y: el.y,
                rotation: el.rotation,
                scaleX: el.scaleX,
                scaleY: el.scaleY,
                opacity: el.opacity,
                draggable: currentTool === 'select' && !el.locked,
                onClick: (e: any) => handleElementClick(e, el.id),
                onDragEnd: (e: any) => handleDragEnd(e, el.id),
                onTransformEnd: (e: any) => handleTransformEnd(e, el.id),
                onDblClick: (e: any) => handleDblClick(e, el.id, el.text),
                shadowColor: isSelected ? '#3b82f6' : undefined,
                shadowBlur: isSelected ? 10 : 0,
                shadowOpacity: isSelected ? 0.5 : 0,
              };

              if (el.type === 'rect') {
                return (
                  <Rect
                    key={el.id}
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
                    key={el.id}
                    {...commonProps}
                    radius={el.radius}
                    fill={el.fill}
                    stroke={el.stroke}
                    strokeWidth={el.strokeWidth}
                  />
                );
              }

              if (el.type === 'freeform') {
                return (
                  <Line
                    key={el.id}
                    {...commonProps}
                    points={el.points}
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
                    key={el.id}
                    {...commonProps}
                    text={el.text}
                    fontSize={el.fontSize || 16}
                    fontFamily={el.fontFamily || 'Inter'}
                    fill={el.fill}
                  />
                );
              }

              return null;
            })}

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

      {/* Barra inferior */}
      <div className="flex items-center justify-center gap-4 px-4 py-2 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
        <button onClick={zoomOut} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded">
          <ZoomOut size={16} />
        </button>
        <span className="text-sm text-neutral-600 dark:text-neutral-400 min-w-[60px] text-center">
          {Math.round(stageScale * 100)}%
        </span>
        <button onClick={zoomIn} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded">
          <ZoomIn size={16} />
        </button>
        <button onClick={resetZoom} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded">
          <Maximize2 size={16} />
        </button>
        {isDirty && <span className="ml-4 text-xs text-amber-500">● Sin guardar</span>}
      </div>
    </div>
  );
}
