"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Transformer, Rect } from "react-konva";
import { useMoodboardStore, MoodboardImage } from "@/store/useMoodboardStore";
import Konva from "konva";

interface MoodboardCanvasProps {
  width?: number;
  height?: number;
}

function KonvaImageNode({
  image,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
}: {
  image: MoodboardImage;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (attrs: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
  }) => void;
}) {
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Load image with proper error handling
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setImageElement(null);

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      setImageElement(img);
      setIsLoading(false);
      setHasError(false);
    };
    
    img.onerror = () => {
      console.error("Failed to load image:", image.src);
      setIsLoading(false);
      setHasError(true);
    };

    img.src = image.src;

    // Cleanup
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [image.src]);

  // Attach transformer when selected
  useEffect(() => {
    if (isSelected && transformerRef.current && imageRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // Don't render if loading or error
  if (isLoading || hasError || !imageElement) {
    // Show placeholder rectangle while loading or on error
    return (
      <Rect
        x={image.x}
        y={image.y}
        width={image.width}
        height={image.height}
        fill={hasError ? "#fee2e2" : "#e5e7eb"}
        stroke={isSelected ? "#3b82f6" : "#d1d5db"}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={4}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onDragEnd(e.target.x(), e.target.y());
        }}
      />
    );
  }

  return (
    <>
      <KonvaImage
        ref={imageRef}
        image={imageElement}
        x={image.x}
        y={image.y}
        width={image.width}
        height={image.height}
        rotation={image.rotation}
        scaleX={image.scaleX || 1}
        scaleY={image.scaleY || 1}
        draggable
        onClick={onSelect}
        onDragEnd={(e) => {
          onDragEnd(e.target.x(), e.target.y());
        }}
        onTransformEnd={(e) => {
          const node = imageRef.current;
          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // Reset scale to 1 and adjust width/height
          node.scaleX(1);
          node.scaleY(1);

          onTransformEnd({
            x: node.x(),
            y: node.y(),
            width: Math.max(50, node.width() * scaleX),
            height: Math.max(50, node.height() * scaleY),
            rotation: node.rotation(),
            scaleX: 1,
            scaleY: 1,
          });
        }}
        shadowColor={isSelected ? "#3b82f6" : undefined}
        shadowBlur={isSelected ? 10 : 0}
        shadowOpacity={isSelected ? 0.6 : 0}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (newBox.width < 50 || newBox.height < 50) {
              return oldBox;
            }
            return newBox;
          }}
          anchorSize={10}
          anchorCornerRadius={2}
          borderStroke="#3b82f6"
          anchorStroke="#3b82f6"
          anchorFill="#ffffff"
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
        />
      )}
    </>
  );
}

export default function MoodboardCanvas({ width = 1200, height = 800 }: MoodboardCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width, height });

  const {
    images,
    selectedId,
    setSelected,
    clearSelection,
    updateImage,
    stageScale,
    setStageScale,
  } = useMoodboardStore();

  // Handle container resize
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

  // Handle keyboard delete - usa estado fresco del store
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't delete if user is typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        // Obtener estado fresco para evitar closures stale
        const { selectedId: currentSelectedId, deleteImage } = useMoodboardStore.getState();
        if (currentSelectedId) {
          deleteImage(currentSelectedId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []); // Sin dependencias - usa getState() directamente

  // Handle wheel zoom
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

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Only clear selection if clicking on the stage itself
      if (e.target === e.target.getStage()) {
        clearSelection();
      }
    },
    [clearSelection]
  );

  const handleDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      updateImage(id, { x, y });
    },
    [updateImage]
  );

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

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-neutral-50 dark:bg-neutral-900 overflow-hidden"
      style={{ cursor: "default" }}
    >
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
          {/* Background */}
          <Rect
            x={0}
            y={0}
            width={containerSize.width / stageScale}
            height={containerSize.height / stageScale}
            fill="transparent"
          />
          
          {/* Images */}
          {images.map((image) => (
            <KonvaImageNode
              key={image.id}
              image={image}
              isSelected={selectedId === image.id}
              onSelect={() => setSelected(image.id)}
              onDragEnd={(x, y) => handleDragEnd(image.id, x, y)}
              onTransformEnd={(attrs) => handleTransformEnd(image.id, attrs)}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
