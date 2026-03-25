"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Stage, Layer, Transformer, Rect } from "react-konva";
import { useMoodboardStore, MoodboardImage } from "@/store/useMoodboardStore";
import { useAutosave } from "@/hooks/useAutosave";
import AutosaveIndicator from "@/components/ui/AutosaveIndicator";
import URLImage from "./URLImage";
import Konva from "konva";

interface MoodboardCanvasWithAutosaveProps {
  width?: number;
  height?: number;
  projectId?: string;
  moodboardId?: string;
}

export default function MoodboardCanvasWithAutosave({ 
  width = 1200, 
  height = 800,
  projectId,
  moodboardId
}: MoodboardCanvasWithAutosaveProps) {
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

  // Hook de auto-guardado
  const { saveToSupabase, saveImmediately, saveStatus } = useAutosave(
    projectId || moodboardId || 'default',
    {
      debounceMs: 1500, // Un poco más de tiempo para moodboard
      tableName: 'moodboards',
      onSaveComplete: (data) => {
        console.log("Moodboard guardado exitosamente:", data);
      },
      onError: (error) => {
        console.error("Error guardando moodboard:", error);
      }
    }
  );

  // ============================================================================
  // RESPALSO LOCAL STORAGE
  // ============================================================================
  
  useEffect(() => {
    if (images.length > 0) {
      const moodboardData = {
        images,
        layout: "freeform",
        lastUpdated: new Date().toISOString()
      };
      
      // Guardar en localStorage como backup
      localStorage.setItem(`moodboard-${moodboardId || 'default'}`, JSON.stringify(moodboardData));
      
      // Auto-guardar en Supabase si tenemos projectId
      if (projectId) {
        saveToSupabase(moodboardData);
      }
    }
  }, [images, moodboardId, projectId, saveToSupabase]);

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
  // MANEJO DE SELECCIÓN Y TRANSFORMACIÓN
  // ============================================================================

  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const selectedNode = stageRef.current?.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else {
      transformerRef.current?.nodes([]);
    }
  }, [selectedId]);

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        clearSelection();
      }
    },
    [clearSelection]
  );

  const handleTransformEnd = useCallback(() => {
    if (selectedId && transformerRef.current) {
      const node = transformerRef.current.getNode();
      if (node) {
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        const rotation = node.rotation();
        
        // Actualizar la imagen con las nuevas propiedades
        updateImage(selectedId, {
          x: node.x(),
          y: node.y(),
          width: node.width() * scaleX,
          height: node.height() * scaleY,
          rotation,
        });

        // Guardado inmediato después de transformación
        saveImmediately({
          images,
          layout: "freeform",
          lastUpdated: new Date().toISOString()
        });
      }
    }
  }, [selectedId, updateImage, saveImmediately, images]);

  // ============================================================================
  // MANEJO DE DRAG AND DROP
  // ============================================================================

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const imageId = node.id();
    
    updateImage(imageId, {
      x: node.x(),
      y: node.y(),
    });

    // Guardado inmediato después de arrastrar
    saveImmediately({
      images,
      layout: "freeform",
      lastUpdated: new Date().toISOString()
    });
  }, [updateImage, saveImmediately, images]);

  // ============================================================================
  // CARGA DE DATOS GUARDADOS
  // ============================================================================

  useEffect(() => {
    const saved = localStorage.getItem(`moodboard-${moodboardId || 'default'}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.images && Array.isArray(data.images)) {
          // Cargar imágenes guardadas en el store
          data.images.forEach((image: MoodboardImage) => {
            // Aquí necesitarías una función para cargar imágenes en el store
            // Por ahora, solo lo mostramos en consola
            console.log("Imagen guardada encontrada:", image);
          });
        }
      } catch (error) {
        console.error("Error cargando moodboard:", error);
      }
    }
  }, [moodboardId]);

  return (
    <div className="relative h-full bg-[#050505]">
      {/* Indicador de auto-guardado */}
      <AutosaveIndicator status={saveStatus} />
      
      <div ref={containerRef} className="w-full h-full">
        <Stage
          ref={stageRef}
          width={containerSize.width}
          height={containerSize.height}
          scaleX={stageScale}
          scaleY={stageScale}
          onClick={handleStageClick}
        >
          <Layer>
            {images.map((image) => (
              <URLImage
                key={image.id}
                image={image}
                isSelected={image.id === selectedId}
                onSelect={() => {
                  setSelected(image.id);
                }}
                onDragEnd={(x, y) => {
                  updateImage(image.id, { x, y });
                  saveImmediately({
                    images,
                    layout: "freeform",
                    lastUpdated: new Date().toISOString()
                  });
                }}
                onTransformEnd={(attrs) => {
                  updateImage(image.id, attrs);
                  saveImmediately({
                    images,
                    layout: "freeform",
                    lastUpdated: new Date().toISOString()
                  });
                }}
              />
            ))}
            
            <Transformer
              ref={transformerRef}
              flipEnabled={false}
              onTransformEnd={handleTransformEnd}
              boundBoxFunc={(oldBox, newBox) => {
                // Limitar tamaño mínimo
                if (newBox.width < 30 || newBox.height < 30) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          </Layer>
        </Stage>
      </div>

      {/* Controles de zoom */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setStageScale(Math.min(stageScale * 1.2, 3))}
          className="p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          +
        </button>
        <button
          onClick={() => setStageScale(Math.max(stageScale / 1.2, 0.3))}
          className="p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          -
        </button>
        <button
          onClick={() => setStageScale(1)}
          className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          100%
        </button>
      </div>

      {/* Información */}
      <div className="absolute bottom-4 left-4 text-white/60 text-sm">
        <p>Imágenes: {images.length} | Zoom: {Math.round(stageScale * 100)}%</p>
        <p className="text-xs mt-1">Arrastra imágenes para reposicionar | Usa Transform para redimensionar</p>
      </div>
    </div>
  );
}
