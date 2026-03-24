'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Image, Transformer, Group } from 'react-konva';
import { useCanvasStore, CanvasElement, Tool, generateId } from '@/stores/canvasStore';
import { 
  MousePointer2, Hand, Pencil, Eraser, Square, Circle as CircleIcon, 
  Type, Image as ImageIcon, Undo2, Redo2, Trash2, ZoomIn, ZoomOut, 
  Maximize2, Download, Save, Plus
} from 'lucide-react';
import Konva from 'konva';

interface CanvasBoardProps {
  width?: number;
  height?: number;
  onSave?: () => void;
}

// ============================================================================
// HERRAMIENTAS
// ============================================================================

const TOOLS: { id: Tool; icon: React.ReactNode; name: string; cursor: string }[] = [
  { id: 'select', icon: <MousePointer2 size={18} />, name: 'Seleccionar', cursor: 'default' },
  { id: 'pan', icon: <Hand size={18} />, name: 'Mover', cursor: 'grab' },
  { id: 'pencil', icon: <Pencil size={18} />, name: 'Lápiz', cursor: 'crosshair' },
  { id: 'rect', icon: <Square size={18} />, name: 'Rectángulo', cursor: 'crosshair' },
  { id: 'circle', icon: <CircleIcon size={18} />, name: 'Círculo', cursor: 'crosshair' },
  { id: 'line', icon: <Plus size={18} />, name: 'Línea', cursor: 'crosshair' },
  { id: 'text', icon: <Type size={18} />, name: 'Texto', cursor: 'text' },
  { id: 'eraser', icon: <Eraser size={18} />, name: 'Borrador', cursor: 'cell' },
];

const COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', 
  '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function CanvasBoard({ width = 800, height = 600, onSave }: CanvasBoardProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const layerRef = useRef<Konva.Layer>(null);
  
  // Estados del store
  const {
    elements,
    selectedIds,
    currentTool,
    style,
    stageX,
    stageY,
    stageScale,
    past,
    future,
    isDirty,
    addElement,
    updateElement,
    deleteSelected,
    select,
    clearSelection,
    setTool,
    setStyle,
    setViewport,
    zoomIn,
    zoomOut,
    resetZoom,
    undo,
    redo,
    canUndo,
    canRedo,
    setIsDrawing,
    isDrawing,
    currentPath,
    setCurrentPath,
    addToCurrentPath,
    pushToHistory,
    clearCanvas,
  } = useCanvasStore();

  // Estados locales
  const [stageSize, setStageSize] = useState({ width, height });
  const [isPanning, setIsPanning] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [previewElement, setPreviewElement] = useState<CanvasElement | null>(null);

  // ============================================================================
  // RESPONSIVE SIZING
  // ============================================================================

  useEffect(() => {
    const updateSize = () => {
      const container = document.getElementById('canvas-container');
      if (container) {
        setStageSize({
          width: container.offsetWidth,
          height: container.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // ============================================================================
  // TRANSFORMER (SELECCIÓN)
  // ============================================================================

  useEffect(() => {
    if (transformerRef.current && layerRef.current) {
      const nodes = selectedIds
        .map((id) => layerRef.current?.findOne(`#${id}`))
        .filter(Boolean) as Konva.Node[];
      
      transformerRef.current.nodes(nodes);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedIds, elements]);

  // ============================================================================
  // ATAJOS DE TECLADO
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl/Cmd + Shift + Z = Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      // Ctrl/Cmd + Y = Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      // Delete/Backspace = Eliminar seleccionado
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
      // V = Herramienta seleccionar
      if (e.key === 'v' && !e.ctrlKey && !e.metaKey) {
        setTool('select');
      }
      // H = Herramienta mano
      if (e.key === 'h' && !e.ctrlKey && !e.metaKey) {
        setTool('pan');
      }
      // B = Lápiz
      if (e.key === 'b' && !e.ctrlKey && !e.metaKey) {
        setTool('pencil');
      }
      // R = Rectángulo
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
        setTool('rect');
      }
      // O = Círculo
      if (e.key === 'o' && !e.ctrlKey && !e.metaKey) {
        setTool('circle');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, undo, redo, deleteSelected, clearSelection, setTool, pushToHistory]);

  // ============================================================================
  // HANDLERS DE MOUSE
  // ============================================================================

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Si clickeamos en el stage vacío
    const clickedOnEmpty = e.target === stage;

    if (currentTool === 'pan' || (currentTool === 'select' && e.evt.button === 1)) {
      // Modo pan
      setIsPanning(true);
      setStartPos({ x: e.evt.clientX - stageX, y: e.evt.clientY - stageY });
      return;
    }

    if (currentTool === 'select') {
      if (clickedOnEmpty) {
        clearSelection();
      }
      return;
    }

    if (currentTool === 'pencil' || currentTool === 'eraser') {
      setIsDrawing(true);
      setCurrentPath([pos.x, pos.y]);
      return;
    }

    if (currentTool === 'rect' || currentTool === 'circle' || currentTool === 'line') {
      setIsDrawing(true);
      setShapeStart({ x: pos.x, y: pos.y });
      return;
    }

    if (currentTool === 'text') {
      const text = prompt('Ingrese el texto:');
      if (text) {
        pushToHistory();
        addElement({
          id: generateId('text'),
          type: 'text',
          x: pos.x,
          y: pos.y,
          text,
          fontSize: style.fontSize,
          fontFamily: style.fontFamily,
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

    if (currentTool === 'image') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event: any) => {
            const img = new window.Image();
            img.src = event.target.result;
            img.onload = () => {
              const maxWidth = 300;
              const scale = img.width > maxWidth ? maxWidth / img.width : 1;
              
              pushToHistory();
              addElement({
                id: generateId('img'),
                type: 'image',
                x: pos.x - (img.width * scale) / 2,
                y: pos.y - (img.height * scale) / 2,
                src: event.target.result,
                width: img.width * scale,
                height: img.height * scale,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                opacity: 1,
                locked: false,
                visible: true,
                zIndex: elements.length,
              });
            };
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }
  }, [currentTool, stageX, stageY, clearSelection, style, elements.length, setIsDrawing, setCurrentPath, pushToHistory, addElement]);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Pan mode
    if (isPanning) {
      setViewport(e.evt.clientX - startPos.x, e.evt.clientY - startPos.y, stageScale);
      return;
    }

    // Drawing modes
    if (!isDrawing) return;

    if (currentTool === 'pencil' || currentTool === 'eraser') {
      addToCurrentPath(pos.x, pos.y);
      return;
    }

    if ((currentTool === 'rect' || currentTool === 'circle' || currentTool === 'line') && shapeStart) {
      const width = pos.x - shapeStart.x;
      const height = pos.y - shapeStart.y;
      const radius = Math.sqrt(width * width + height * height);

      const previewBase: CanvasElement = {
        id: 'preview',
        type: currentTool === 'line' ? 'line' : currentTool as any,
        x: shapeStart.x,
        y: shapeStart.y,
        width: Math.abs(width),
        height: Math.abs(height),
        fill: currentTool === 'rect' || currentTool === 'circle' ? 'transparent' : undefined,
        stroke: style.strokeColor,
        strokeWidth: style.strokeWidth,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 9999,
      };

      if (currentTool === 'circle') {
        (previewBase as any).radius = radius;
      }
      if (currentTool === 'line') {
        (previewBase as any).points = [0, 0, width, height];
      }

      setPreviewElement(previewBase);
    }
  }, [isPanning, startPos, stageScale, isDrawing, currentTool, shapeStart, style, setViewport, addToCurrentPath]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);

    if (!isDrawing) return;

    if (currentTool === 'pencil' && currentPath.length > 2) {
      pushToHistory();
      addElement({
        id: generateId('freeform'),
        type: 'freeform',
        x: 0,
        y: 0,
        points: currentPath,
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

    if ((currentTool === 'rect' || currentTool === 'circle' || currentTool === 'line') && shapeStart && previewElement) {
      pushToHistory();
      addElement({
        ...previewElement,
        id: generateId(currentTool),
        x: currentTool === 'rect' || currentTool === 'circle' 
          ? Math.min(shapeStart.x, shapeStart.x + (previewElement.width || 0)) 
          : shapeStart.x,
        y: currentTool === 'rect' || currentTool === 'circle' 
          ? Math.min(shapeStart.y, shapeStart.y + (previewElement.height || 0)) 
          : shapeStart.y,
        width: currentTool === 'line' ? undefined : previewElement.width,
        height: currentTool === 'line' ? undefined : previewElement.height,
      });
    }

    if (currentTool === 'eraser' && currentPath.length > 0) {
      // Eliminar elementos que intersectan con el path del borrador
      const eraserRadius = style.strokeWidth * 3;
      pushToHistory();
      
      elements.forEach((el) => {
        if (el.type === 'freeform' && el.points) {
          let shouldDelete = false;
          for (let i = 0; i < el.points.length; i += 2) {
            const px = el.points[i];
            const py = el.points[i + 1];
            for (let j = 0; j < currentPath.length; j += 2) {
              const dx = px - currentPath[j];
              const dy = py - currentPath[j + 1];
              if (Math.sqrt(dx * dx + dy * dy) < eraserRadius) {
                shouldDelete = true;
                break;
              }
            }
            if (shouldDelete) break;
          }
          if (shouldDelete) {
            useCanvasStore.getState().deleteElement(el.id);
          }
        }
      });
    }

    setIsDrawing(false);
    setCurrentPath([]);
    setShapeStart(null);
    setPreviewElement(null);
  }, [isDrawing, currentTool, currentPath, shapeStart, previewElement, style, elements, pushToHistory, addElement]);

  // ============================================================================
  // HANDLER DE WHEEL (ZOOM)
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
  // RENDERIZADO DE ELEMENTOS
  // ============================================================================

  const renderElement = (el: CanvasElement) => {
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
      onClick: (e: Konva.KonvaEventObject<MouseEvent>) => select(el.id, e.evt.shiftKey),
      onTap: () => select(el.id),
      onDragEnd: (evt: Konva.KonvaEventObject<DragEvent>) => {
        pushToHistory();
        updateElement(el.id, { x: evt.target.x(), y: evt.target.y() });
      },
      onTransformEnd: (evt: Konva.KonvaEventObject<Event>) => {
        const node = evt.target;
        pushToHistory();
        updateElement(el.id, {
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
        });
      },
    };

    switch (el.type) {
      case 'rect':
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
      
      case 'circle':
        return (
          <Circle
            key={el.id}
            {...commonProps}
            radius={(el as any).radius || el.width! / 2}
            fill={el.fill}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
          />
        );
      
      case 'line':
        return (
          <Line
            key={el.id}
            {...commonProps}
            points={(el as any).points || []}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
            lineCap="round"
            lineJoin="round"
          />
        );
      
      case 'freeform':
        return (
          <Line
            key={el.id}
            {...commonProps}
            points={(el as any).points || []}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
            lineCap="round"
            lineJoin="round"
            tension={0.5}
          />
        );
      
      case 'text':
        return (
          <Text
            key={el.id}
            {...commonProps}
            text={el.text}
            fontSize={el.fontSize}
            fontFamily={el.fontFamily}
            fill={el.fill}
          />
        );
      
      case 'image':
        return (
          <ImageElement
            key={el.id}
            {...commonProps}
            src={el.src!}
            width={el.width!}
            height={el.height!}
          />
        );
      
      default:
        return null;
    }
  };

  // ============================================================================
  // COMPONENTE PARA IMÁGENES
  // ============================================================================

  const ImageElement = ({ src, width, height, ...props }: any) => {
    const [image, setImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => setImage(img);
    }, [src]);

    if (!image) return null;
    return <Image {...props} image={image} width={width} height={height} />;
  };

  // ============================================================================
  // CURSOR BASADO EN HERRAMIENTA
  // ============================================================================

  const getCursor = () => {
    const tool = TOOLS.find((t) => t.id === currentTool);
    return tool?.cursor || 'default';
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-900">
      {/* Toolbar Superior */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        {/* Herramientas */}
        <div className="flex items-center gap-1">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setTool(tool.id)}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === tool.id
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
              }`}
              title={tool.name}
            >
              {tool.icon}
            </button>
          ))}
        </div>

        {/* Colores */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {COLORS.slice(0, 6).map((color) => (
              <button
                key={color}
                onClick={() => setStyle({ strokeColor: color })}
                className={`w-6 h-6 rounded border-2 transition-transform hover:scale-110 ${
                  style.strokeColor === color
                    ? 'border-neutral-900 dark:border-white ring-2 ring-blue-500'
                    : 'border-neutral-300 dark:border-neutral-600'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <input
            type="color"
            value={style.strokeColor}
            onChange={(e) => setStyle({ strokeColor: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer"
          />
        </div>

        {/* Grosor */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Grosor:</span>
          <input
            type="range"
            min={1}
            max={20}
            value={style.strokeWidth}
            onChange={(e) => setStyle({ strokeWidth: Number(e.target.value) })}
            className="w-24"
          />
          <span className="text-sm text-neutral-600 dark:text-neutral-400 w-6">
            {style.strokeWidth}
          </span>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={!canUndo()}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 disabled:opacity-30"
            title="Deshacer (Ctrl+Z)"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 disabled:opacity-30"
            title="Rehacer (Ctrl+Y)"
          >
            <Redo2 size={18} />
          </button>
          <button
            onClick={clearCanvas}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
            title="Limpiar todo"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            title="Guardar (Ctrl+S)"
          >
            <Save size={16} />
            <span>Guardar</span>
          </button>
        </div>
      </div>

      {/* Área del Canvas */}
      <div 
        id="canvas-container" 
        className="flex-1 overflow-hidden"
        style={{ cursor: getCursor() }}
      >
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          x={stageX}
          y={stageY}
          scaleX={stageScale}
          scaleY={stageScale}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={(e) => handleMouseDown(e as any)}
          onTouchMove={(e) => handleMouseMove(e as any)}
          onTouchEnd={(e) => handleMouseUp()}
        >
          <Layer ref={layerRef}>
            {/* Elementos */}
            {elements
              .sort((a, b) => a.zIndex - b.zIndex)
              .map(renderElement)}

            {/* Preview del dibujo en progreso */}
            {previewElement && renderElement(previewElement)}

            {/* Dibujo en progreso */}
            {isDrawing && (currentTool === 'pencil' || currentTool === 'eraser') && currentPath.length > 0 && (
              <Line
                points={currentPath}
                stroke={currentTool === 'eraser' ? '#ff0000' : style.strokeColor}
                strokeWidth={style.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
              />
            )}

            {/* Transformer para selección */}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // Limitar tamaño mínimo
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
              rotateEnabled={true}
              enabledAnchors={[
                'top-left',
                'top-right',
                'bottom-left',
                'bottom-right',
                'middle-left',
                'middle-right',
                'top-center',
                'bottom-center',
              ]}
            />
          </Layer>
        </Stage>
      </div>

      {/* Barra inferior - Zoom */}
      <div className="flex items-center justify-center gap-4 px-4 py-2 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
        <button
          onClick={zoomOut}
          className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
          title="Zoom -"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-sm text-neutral-600 dark:text-neutral-400 min-w-[60px] text-center">
          {Math.round(stageScale * 100)}%
        </span>
        <button
          onClick={zoomIn}
          className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
          title="Zoom +"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={resetZoom}
          className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
          title="Resetear zoom"
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
