'use client';

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Image, Transformer } from 'react-konva';
import { useCanvasStore, CanvasElement, Tool, generateId } from '@/stores/canvasStore';
import { 
  MousePointer2, Hand, Pencil, Eraser, Square, Circle as CircleIcon, 
  Type, Undo2, Redo2, Trash2, ZoomIn, ZoomOut, 
  Maximize2, Save, Plus
} from 'lucide-react';
import Konva from 'konva';

interface CanvasBoardProps {
  onSave?: () => void;
}

// ============================================================================
// HERRAMIENTAS
// ============================================================================

const TOOLS_CONFIG = [
  { id: 'select' as Tool, icon: MousePointer2, name: 'Seleccionar', cursor: 'default' },
  { id: 'pan' as Tool, icon: Hand, name: 'Mover', cursor: 'grab' },
  { id: 'pencil' as Tool, icon: Pencil, name: 'Lápiz', cursor: 'crosshair' },
  { id: 'rect' as Tool, icon: Square, name: 'Rect', cursor: 'crosshair' },
  { id: 'circle' as Tool, icon: CircleIcon, name: 'Círculo', cursor: 'crosshair' },
  { id: 'line' as Tool, icon: Plus, name: 'Línea', cursor: 'crosshair' },
  { id: 'text' as Tool, icon: Type, name: 'Texto', cursor: 'text' },
  { id: 'eraser' as Tool, icon: Eraser, name: 'Borrador', cursor: 'cell' },
];

const COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', 
  '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

// ============================================================================
// COMPONENTE
// ============================================================================

export default function CanvasBoard({ onSave }: CanvasBoardProps) {
  // ============================================================================
  // REFS
  // ============================================================================
  
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // ============================================================================
  // STORE - Estado global
  // ============================================================================
  
  const elements = useCanvasStore((s) => s.elements);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const currentTool = useCanvasStore((s) => s.currentTool);
  const style = useCanvasStore((s) => s.style);
  const stageX = useCanvasStore((s) => s.stageX);
  const stageY = useCanvasStore((s) => s.stageY);
  const stageScale = useCanvasStore((s) => s.stageScale);
  const isDirty = useCanvasStore((s) => s.isDirty);
  
  const addElement = useCanvasStore((s) => s.addElement);
  const updateElement = useCanvasStore((s) => s.updateElement);
  const deleteSelected = useCanvasStore((s) => s.deleteSelected);
  const select = useCanvasStore((s) => s.select);
  const clearSelection = useCanvasStore((s) => s.clearSelection);
  const setTool = useCanvasStore((s) => s.setTool);
  const setStyle = useCanvasStore((s) => s.setStyle);
  const setViewport = useCanvasStore((s) => s.setViewport);
  const zoomIn = useCanvasStore((s) => s.zoomIn);
  const zoomOut = useCanvasStore((s) => s.zoomOut);
  const resetZoom = useCanvasStore((s) => s.resetZoom);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const canUndo = useCanvasStore((s) => s.canUndo);
  const canRedo = useCanvasStore((s) => s.canRedo);
  const pushToHistory = useCanvasStore((s) => s.pushToHistory);
  const clearCanvas = useCanvasStore((s) => s.clearCanvas);

  // ============================================================================
  // ESTADO LOCAL
  // ============================================================================
  
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [drawCurrent, setDrawCurrent] = useState({ x: 0, y: 0 });
  const [pencilPoints, setPencilPoints] = useState<number[]>([]);

  // ============================================================================
  // RESPONSIVE
  // ============================================================================
  
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // ============================================================================
  // TRANSFORMER - Actualizar selección visual
  // ============================================================================
  
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    
    const stage = stageRef.current;
    const layer = stage.findOne('Layer');
    if (!layer) return;

    // Encontrar nodos seleccionados
    const nodes = selectedIds
      .map((id) => stage.findOne(`#${id}`))
      .filter((n): n is Konva.Node => n !== undefined && n !== null);

    transformerRef.current.nodes(nodes);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedIds, elements]);

  // ============================================================================
  // ATAJOS DE TECLADO
  // ============================================================================
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si estamos en un input
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      
      // Ctrl+Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl+Y = Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      // Ctrl+Shift+Z = Redo
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        redo();
      }
      // Delete/Backspace = Eliminar
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        e.preventDefault();
        pushToHistory();
        deleteSelected();
      }
      // Escape = Deseleccionar
      if (e.key === 'Escape') {
        clearSelection();
        setTool('select');
      }
      // V = Select
      if (e.key === 'v' && !e.ctrlKey && !e.metaKey) {
        setTool('select');
      }
      // H = Pan
      if (e.key === 'h' && !e.ctrlKey && !e.metaKey) {
        setTool('pan');
      }
      // B = Pencil
      if (e.key === 'b' && !e.ctrlKey && !e.metaKey) {
        setTool('pencil');
      }
      // R = Rect
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
        setTool('rect');
      }
      // O = Circle
      if (e.key === 'o' && !e.ctrlKey && !e.metaKey) {
        setTool('circle');
      }
      // T = Text
      if (e.key === 't' && !e.ctrlKey && !e.metaKey) {
        setTool('text');
      }
      // E = Eraser
      if (e.key === 'e' && !e.ctrlKey && !e.metaKey) {
        setTool('eraser');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, undo, redo, deleteSelected, clearSelection, setTool, pushToHistory]);

  // ============================================================================
  // OBTENER POSICIÓN DEL MOUSE EN EL STAGE
  // ============================================================================
  
  const getPointerPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    
    // Ajustar por transform del stage
    return {
      x: (pos.x - stageX) / stageScale,
      y: (pos.y - stageY) / stageScale,
    };
  }, [stageX, stageY, stageScale]);

  // ============================================================================
  // HANDLERS DE MOUSE - PRINCIPALES
  // ============================================================================
  
  const handleStageMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    // Si clickeamos en un elemento (no en el stage vacío)
    const clickedOnStage = e.target === e.target.getStage();
    
    // En modo seleccionar, dejar que los elementos manejen su propia selección
    if (currentTool === 'select') {
      if (clickedOnStage) {
        clearSelection();
      }
      return;
    }

    // En modo pan,也开始 pan
    if (currentTool === 'pan') {
      setIsPanning(true);
      setDrawStart({ x: e.evt.clientX, y: e.evt.clientY });
      return;
    }

    // Obtener posición en el canvas
    const pos = getPointerPosition();
    if (!pos) return;

    // Modos de dibujo
    if (currentTool === 'pencil' || currentTool === 'eraser') {
      setIsDrawing(true);
      setPencilPoints([pos.x, pos.y]);
      return;
    }

    // Formas
    if (currentTool === 'rect' || currentTool === 'circle' || currentTool === 'line') {
      setIsDrawing(true);
      setDrawStart(pos);
      setDrawCurrent(pos);
      return;
    }

    // Texto
    if (currentTool === 'text') {
      const text = prompt('Ingrese el texto:');
      if (text && text.trim()) {
        pushToHistory();
        addElement({
          id: generateId('text'),
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
      return;
    }
  }, [currentTool, clearSelection, getPointerPosition, style, elements.length, pushToHistory, addElement]);

  const handleStageMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    // Pan mode
    if (isPanning && currentTool === 'pan') {
      setViewport(
        e.evt.clientX - drawStart.x + stageX,
        e.evt.clientY - drawStart.y + stageY,
        stageScale
      );
      return;
    }

    if (!isDrawing) return;

    const pos = getPointerPosition();
    if (!pos) return;

    // Pencil
    if (currentTool === 'pencil' || currentTool === 'eraser') {
      setPencilPoints((prev) => [...prev, pos.x, pos.y]);
      return;
    }

    // Formas - actualizar preview
    if (currentTool === 'rect' || currentTool === 'circle' || currentTool === 'line') {
      setDrawCurrent(pos);
    }
  }, [isPanning, isDrawing, currentTool, drawStart, stageX, stageY, stageScale, getPointerPosition, setViewport]);

  const handleStageMouseUp = useCallback(() => {
    // Terminar pan
    if (isPanning) {
      setIsPanning(false);
    }

    if (!isDrawing) return;

    const pos = getPointerPosition();
    
    // Pencil - crear path
    if ((currentTool === 'pencil' || currentTool === 'eraser') && pencilPoints.length > 2) {
      pushToHistory();
      addElement({
        id: generateId('freeform'),
        type: 'freeform',
        x: 0,
        y: 0,
        points: pencilPoints,
        stroke: currentTool === 'eraser' ? '#ff0000' : style.strokeColor,
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

    // Formas - crear shape
    if ((currentTool === 'rect' || currentTool === 'circle' || currentTool === 'line') && drawStart && pos) {
      const width = pos.x - drawStart.x;
      const height = pos.y - drawStart.y;
      
      // Solo crear si tiene tamaño mínimo
      if (Math.abs(width) > 5 || Math.abs(height) > 5) {
        pushToHistory();
        
        if (currentTool === 'rect') {
          addElement({
            id: generateId('rect'),
            type: 'rect',
            x: width > 0 ? drawStart.x : pos.x,
            y: height > 0 ? drawStart.y : pos.y,
            width: Math.abs(width),
            height: Math.abs(height),
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
          const radius = Math.sqrt(width * width + height * height) / 2;
          addElement({
            id: generateId('circle'),
            type: 'circle',
            x: drawStart.x + width / 2,
            y: drawStart.y + height / 2,
            radius,
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
        
        if (currentTool === 'line') {
          addElement({
            id: generateId('line'),
            type: 'line',
            x: drawStart.x,
            y: drawStart.y,
            points: [0, 0, width, height],
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
      }
    }

    // Reset
    setIsDrawing(false);
    setPencilPoints([]);
    setDrawStart({ x: 0, y: 0 });
    setDrawCurrent({ x: 0, y: 0 });
  }, [isPanning, isDrawing, currentTool, pencilPoints, drawStart, style, elements.length, getPointerPosition, pushToHistory, addElement]);

  // ============================================================================
  // CLICK EN ELEMENTO
  // ============================================================================
  
  const handleElementClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>, elementId: string) => {
    // Solo en modo seleccionar
    if (currentTool !== 'select') return;
    
    e.cancelBubble = true; // Evitar que llegue al stage
    select(elementId, e.evt.shiftKey);
  }, [currentTool, select]);

  // ============================================================================
  // DRAG DE ELEMENTO
  // ============================================================================
  
  const handleElementDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>, elementId: string) => {
    if (currentTool !== 'select') return;
    
    pushToHistory();
    updateElement(elementId, {
      x: e.target.x(),
      y: e.target.y(),
    });
  }, [currentTool, pushToHistory, updateElement]);

  // ============================================================================
  // TRANSFORM DE ELEMENTO
  // ============================================================================
  
  const handleTransformEnd = useCallback((e: Konva.KonvaEventObject<Event>, elementId: string) => {
    const node = e.target;
    pushToHistory();
    updateElement(elementId, {
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
    });
  }, [pushToHistory, updateElement]);

  // ============================================================================
  // ZOOM
  // ============================================================================
  
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
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
      x: (pointer.x - stageX) / oldScale,
      y: (pointer.y - stageY) / oldScale,
    };

    setViewport(
      pointer.x - mousePointTo.x * clampedScale,
      pointer.y - mousePointTo.y * clampedScale,
      clampedScale
    );
  }, [stageScale, stageX, stageY, setViewport]);

  // ============================================================================
  // CURSOR
  // ============================================================================
  
  const cursor = useMemo(() => {
    const tool = TOOLS_CONFIG.find((t) => t.id === currentTool);
    return tool?.cursor || 'default';
  }, [currentTool]);

  // ============================================================================
  // CALCULAR SHAPE EN PROCESO
  // ============================================================================
  
  const previewShape = useMemo(() => {
    if (!isDrawing || !drawStart || !drawCurrent) return null;
    
    const width = drawCurrent.x - drawStart.x;
    const height = drawCurrent.y - drawStart.y;
    
    if (currentTool === 'rect') {
      return {
        type: 'rect' as const,
        x: width > 0 ? drawStart.x : drawCurrent.x,
        y: height > 0 ? drawStart.y : drawCurrent.y,
        width: Math.abs(width),
        height: Math.abs(height),
      } as { type: 'rect'; x: number; y: number; width: number; height: number };
    }
    
    if (currentTool === 'circle') {
      const radius = Math.sqrt(width * width + height * height) / 2;
      return {
        type: 'circle' as const,
        x: drawStart.x + width / 2,
        y: drawStart.y + height / 2,
        radius,
      } as { type: 'circle'; x: number; y: number; radius: number };
    }
    
    if (currentTool === 'line') {
      return {
        type: 'line' as const,
        points: [drawStart.x, drawStart.y, drawCurrent.x, drawCurrent.y],
      } as { type: 'line'; points: number[] };
    }
    
    return null;
  }, [isDrawing, drawStart, drawCurrent, currentTool]);

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-900">
      {/* Toolbar Superior */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        {/* Herramientas */}
        <div className="flex items-center gap-1">
          {TOOLS_CONFIG.map((tool) => {
            const Icon = tool.icon;
            const isActive = currentTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setTool(tool.id)}
                className={`p-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300'
                }`}
                title={`${tool.name} (${tool.id[0].toUpperCase()})`}
              >
                <Icon size={18} />
              </button>
            );
          })}
        </div>

        {/* Colores */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {COLORS.slice(0, 6).map((color) => (
              <button
                key={color}
                onClick={() => setStyle({ strokeColor: color })}
                className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                  style.strokeColor === color
                    ? 'ring-2 ring-blue-500 ring-offset-2'
                    : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <input
            type="color"
            value={style.strokeColor}
            onChange={(e) => setStyle({ strokeColor: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border-0"
          />
        </div>

        {/* Grosor */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-600 dark:text-neutral-400">Grosor:</span>
          <input
            type="range"
            min={1}
            max={20}
            value={style.strokeWidth}
            onChange={(e) => setStyle({ strokeWidth: Number(e.target.value) })}
            className="w-20"
          />
          <span className="text-xs text-neutral-600 dark:text-neutral-400 w-5">
            {style.strokeWidth}
          </span>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={!canUndo()}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 disabled:opacity-30"
            title="Deshacer (Ctrl+Z)"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 disabled:opacity-30"
            title="Rehacer (Ctrl+Y)"
          >
            <Redo2 size={18} />
          </button>
          <button
            onClick={() => {
              if (confirm('¿Limpiar todo el canvas?')) {
                pushToHistory();
                clearCanvas();
              }
            }}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
            title="Limpiar"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Save size={16} />
            <span>Guardar</span>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden"
        style={{ cursor }}
      >
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          x={stageX}
          y={stageY}
          scaleX={stageScale}
          scaleY={stageScale}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          onMouseLeave={handleStageMouseUp}
          onWheel={handleWheel}
        >
          <Layer>
            {/* Elementos existentes */}
            {elements.map((el) => {
              const isSelected = selectedIds.includes(el.id);
              
              // Propiedades comunes
              const commonProps = {
                id: el.id,
                x: el.x,
                y: el.y,
                rotation: el.rotation,
                scaleX: el.scaleX,
                scaleY: el.scaleY,
                opacity: el.opacity,
                draggable: currentTool === 'select' && !el.locked,
                onClick: (e: Konva.KonvaEventObject<MouseEvent>) => handleElementClick(e, el.id),
                onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => handleElementDragEnd(e, el.id),
                onTransformEnd: (e: Konva.KonvaEventObject<Event>) => handleTransformEnd(e, el.id),
              };

              // Render según tipo
              if (el.type === 'rect') {
                return (
                  <Rect
                    key={el.id}
                    {...commonProps}
                    width={el.width || 100}
                    height={el.height || 100}
                    fill={el.fill}
                    stroke={el.stroke}
                    strokeWidth={el.strokeWidth}
                    shadowColor={isSelected ? '#3b82f6' : undefined}
                    shadowBlur={isSelected ? 10 : 0}
                    shadowOpacity={isSelected ? 0.5 : 0}
                  />
                );
              }

              if (el.type === 'circle') {
                return (
                  <Circle
                    key={el.id}
                    {...commonProps}
                    radius={el.radius || 50}
                    fill={el.fill}
                    stroke={el.stroke}
                    strokeWidth={el.strokeWidth}
                    shadowColor={isSelected ? '#3b82f6' : undefined}
                    shadowBlur={isSelected ? 10 : 0}
                    shadowOpacity={isSelected ? 0.5 : 0}
                  />
                );
              }

              if (el.type === 'line') {
                return (
                  <Line
                    key={el.id}
                    {...commonProps}
                    points={el.points || []}
                    stroke={el.stroke}
                    strokeWidth={el.strokeWidth}
                    lineCap="round"
                    lineJoin="round"
                    hitStrokeWidth={20}
                  />
                );
              }

              if (el.type === 'freeform') {
                return (
                  <Line
                    key={el.id}
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
                    key={el.id}
                    {...commonProps}
                    text={el.text || ''}
                    fontSize={el.fontSize || 16}
                    fontFamily={el.fontFamily || 'Inter'}
                    fill={el.fill}
                  />
                );
              }

              return null;
            })}

            {/* Preview de forma en proceso */}
            {previewShape && currentTool === 'rect' && (
              <Rect
                x={(previewShape as any).x}
                y={(previewShape as any).y}
                width={(previewShape as any).width}
                height={(previewShape as any).height}
                stroke={style.strokeColor}
                strokeWidth={style.strokeWidth}
                dash={[5, 5]}
                fill="transparent"
              />
            )}
            {previewShape && currentTool === 'circle' && (
              <Circle
                x={(previewShape as any).x}
                y={(previewShape as any).y}
                radius={(previewShape as any).radius}
                stroke={style.strokeColor}
                strokeWidth={style.strokeWidth}
                dash={[5, 5]}
                fill="transparent"
              />
            )}
            {previewShape && currentTool === 'line' && (
              <Line
                points={(previewShape as any).points}
                stroke={style.strokeColor}
                strokeWidth={style.strokeWidth}
                lineCap="round"
              />
            )}

            {/* Pencil en proceso */}
            {isDrawing && (currentTool === 'pencil' || currentTool === 'eraser') && pencilPoints.length > 0 && (
              <Line
                points={pencilPoints}
                stroke={currentTool === 'eraser' ? '#ff0000' : style.strokeColor}
                strokeWidth={style.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
              />
            )}

            {/* Transformer */}
            <Transformer
              ref={transformerRef}
              rotateEnabled={true}
              enabledAnchors={[
                'top-left',
                'top-right',
                'bottom-left',
                'bottom-right',
              ]}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          </Layer>
        </Stage>
      </div>

      {/* Barra inferior */}
      <div className="flex items-center justify-center gap-4 px-4 py-2 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
        <button
          onClick={zoomOut}
          className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-sm text-neutral-600 dark:text-neutral-400 min-w-[60px] text-center">
          {Math.round(stageScale * 100)}%
        </span>
        <button
          onClick={zoomIn}
          className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={resetZoom}
          className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
        >
          <Maximize2 size={16} />
        </button>
        
        {isDirty && (
          <span className="ml-4 text-xs text-amber-500">● Sin guardar</span>
        )}
      </div>
    </div>
  );
}
