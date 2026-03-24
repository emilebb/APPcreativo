"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Stage, Layer, Transformer, Rect } from "react-konva";
import { useMoodboardStore, MoodboardImage } from "@/store/useMoodboardStore";
import URLImage from "./URLImage";
import Konva from "konva";

interface MoodboardCanvasProps {
  width?: number;
  height?: number;
}

export default function MoodboardCanvas({ width = 1200, height = 800 }: MoodboardCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width, height });

  const {
    images,
    selectedId,
    setSelected,
    clearSelection,
    updateImage,
    deleteSelected,
    stageScale,
    setStageScale,
  } = useMoodboardStore();

  // ============================================================================
  // RESPONSIVE - Actualizar tamaño del contenedor
  // ============================================================================
  
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // ============================================================================
  // TRANSFORMER - Acoplar a imagen seleccionada
  // ============================================================================
  
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;

    const stage = stageRef.current;
    const selectedNode = selectedId 
      ? stage.findOne(`#${selectedId}`) 
      : null;

    transformerRef.current.nodes(selectedNode ? [selectedNode] : []);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedId]);

  // ============================================================================
  // KEYBOARD - Manejar Delete/Backspace
  // ============================================================================
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // No eliminar si estamos en un input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelected();
      }

      // Escape para deseleccionar
      if (e.key === "Escape") {
        clearSelection();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelected, clearSelection]);

  // ============================================================================
  // WHEEL - Zoom con rueda del ratón
  // ============================================================================
  
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();

      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = stageScale;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newScale = direction > 0 ? oldScale * 1.1 : oldScale / 1.1;
      const clampedScale = Math.max(0.1, Math.min(5, newScale));

      setStageScale(clampedScale);

      const newPos = {
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      };

      stage.position(newPos);
      stage.scale({ x: clampedScale, y: clampedScale });
    },
    [stageScale, setStageScale]
  );

  // ============================================================================
  // CLICK EN STAGE - Deseleccionar
  // ============================================================================
  
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Solo deseleccionar si clic en el stage vacío
      if (e.target === e.target.getStage()) {
        clearSelection();
      }
    },
    [clearSelection]
  );

  // ============================================================================
  // DRAG END - Guardar posición
  // ============================================================================
  
  const handleDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      updateImage(id, { x, y });
    },
    [updateImage]
  );

  // ============================================================================
  // TRANSFORM END - Guardar tamaño y rotación
  // ============================================================================
  
  const handleTransformEnd = useCallback(
    (id: string, attrs: {
      x: number;
      y: number;
      width: number;
      height: number;
      rotation: number;
      scaleX: number;
      scaleY: number;
    }) => {
      updateImage(id, {
        x: attrs.x,
        y: attrs.y,
        width: attrs.width,
        height: attrs.height,
        rotation: attrs.rotation,
        scaleX: attrs.scaleX,
        scaleY: attrs.scaleY,
      });
    },
    [updateImage]
  );

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden relative"
      style={{ cursor: "default" }}
    >
      {/* Dot pattern background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
      
      {/* Subtle vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(5,5,5,0.3) 100%)',
        }}
      />

      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        scaleX={stageScale}
        scaleY={stageScale}
        onWheel={handleWheel}
        onClick={handleStageClick}
        draggable
      >
        <Layer>
          {/* Fondo expandido para pan */}
          <Rect
            x={-5000}
            y={-5000}
            width={10000 + containerSize.width / stageScale}
            height={10000 + containerSize.height / stageScale}
            fill="#0a0a0f"
          />

          {/* Imágenes */}
          {images.map((image) => (
            <URLImage
              key={image.id}
              image={image}
              isSelected={selectedId === image.id}
              onSelect={() => setSelected(image.id)}
              onDragEnd={(x, y) => handleDragEnd(image.id, x, y)}
              onTransformEnd={(attrs) => handleTransformEnd(image.id, attrs)}
            />
          ))}

          {/* Transformer - Neon styled */}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 50 || newBox.height < 50) {
                return oldBox;
              }
              return newBox;
            }}
            anchorSize={10}
            anchorCornerRadius={2}
            borderStroke="#8b5cf6"
            borderStrokeWidth={2}
            anchorStroke="#8b5cf6"
            anchorFill="#1f1f2e"
            anchorStrokeWidth={2}
            rotateAnchorOffset={25}
            enabledAnchors={[
              "top-left",
              "top-right",
              "bottom-left",
              "bottom-right",
              "middle-left",
              "middle-right",
              "top-center",
              "bottom-center",
            ]}
            rotateEnabled={true}
            enabledRotate={true}
          />
        </Layer>
      </Stage>
    </div>
  );
}
