"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Trash2,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Upload,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useMoodboardStore } from "@/store/useMoodboardStore";
import MoodboardCanvas from "@/components/MoodboardCanvas";

export default function EditMoodboardPage() {
  const params = useParams();
  const moodboardId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado del store
  const {
    images,
    selectedId,
    title,
    isDirty,
    stageScale,
    setTitle,
    loadMoodboard,
    addImage,
    updateImage,
    deleteSelected,
    clearSelection,
    clearBoard,
    setStageScale,
    markClean,
  } = useMoodboardStore();

  // ============================================================================
  // CARGAR DATOS DEL MOODBOARD
  // ============================================================================
  
  useEffect(() => {
    const loadMoodboardData = async () => {
      try {
        setLoading(true);
        const stored = localStorage.getItem(`moodboard-${moodboardId}`);
        if (stored) {
          const data = JSON.parse(stored);
          loadMoodboard({
            title: data.title,
            images: data.images || [],
          });
        }
      } catch (error) {
        console.error("Error loading moodboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMoodboardData();
  }, [moodboardId, loadMoodboard]);

  // ============================================================================
  // GUARDAR MOODBOARD
  // ============================================================================
  
  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      alert("Por favor, añade un título");
      return;
    }

    setSaving(true);
    try {
      const { title: currentTitle, images: currentImages } = useMoodboardStore.getState();
      
      const moodboardData = {
        id: moodboardId,
        title: currentTitle,
        images: currentImages,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(`moodboard-${moodboardId}`, JSON.stringify(moodboardData));
      markClean();

      setSaveMessage("¡Guardado!");
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (error) {
      console.error("Error saving moodboard:", error);
      alert("Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }, [moodboardId, title, markClean]);

  // ============================================================================
  // AUTO-SAVE
  // ============================================================================
  
  useEffect(() => {
    if (!isDirty || saving) return;

    const timeoutId = setTimeout(() => {
      handleSave();
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [isDirty, saving, handleSave]);

  // ============================================================================
  // ZOOM CONTROLS
  // ============================================================================
  
  const handleZoomIn = () => {
    const newScale = Math.min(3, stageScale + 0.1);
    setStageScale(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(0.1, stageScale - 0.1);
    setStageScale(newScale);
  };

  const handleZoomReset = () => {
    setStageScale(1);
  };

  // ============================================================================
  // ROTAR IMAGEN SELECCIONADA
  // ============================================================================
  
  const handleRotateSelected = () => {
    if (!selectedId) return;
    const image = images.find((img) => img.id === selectedId);
    if (image) {
      updateImage(selectedId, { rotation: (image.rotation + 15) % 360 });
    }
  };

  // ============================================================================
  // ELIMINAR IMAGEN SELECCIONADA
  // ============================================================================
  
  const handleDeleteSelected = () => {
    if (!selectedId) return;
    deleteSelected();
  };

  // ============================================================================
  // LIMPIAR TABLERO
  // ============================================================================
  
  const handleClearBoard = () => {
    if (images.length === 0) return;
    if (confirm("¿Eliminar todas las imágenes del moodboard?")) {
      clearBoard();
    }
  };

  // ============================================================================
  // SUBIR IMÁGENES
  // ============================================================================
  
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      Array.from(files).forEach((file, index) => {
        if (!file.type.startsWith("image/")) return;

        const url = URL.createObjectURL(file);

        // Crear imagen para obtener dimensiones
        const img = new window.Image();
        img.onload = () => {
          // Calcular tamaño inicial (max 250px manteniendo aspecto)
          const maxSize = 250;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          // Posición inicial con offset
          const baseX = 100 + (images.length % 5) * 30;
          const baseY = 100 + (images.length % 5) * 30;

          addImage({
            src: url,
            x: baseX + index * 20,
            y: baseY + index * 20,
            width,
            height,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
          });
        };
        img.src = url;
      });

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [addImage, images.length]
  );

  // ============================================================================
  // RENDER
  // ============================================================================
  
  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">Cargando moodboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
      {/* ================================================================ */}
      {/* TOOLBAR */}
      {/* ================================================================ */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Izquierda */}
          <div className="flex items-center gap-4">
            <Link
              href={`/moodboard/${moodboardId}`}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del moodboard"
              className="text-lg font-semibold bg-transparent border-none outline-none text-neutral-900 dark:text-white placeholder-neutral-400 w-64"
            />

            {isDirty && (
              <span className="text-xs text-amber-600 dark:text-amber-400">
                Sin guardar
              </span>
            )}
          </div>

          {/* Derecha */}
          <div className="flex items-center gap-2">
            {/* Zoom */}
            <div className="flex items-center gap-1 px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
              <button
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded transition"
                title="Alejar"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm px-2 min-w-[3rem] text-center font-medium">
                {Math.round(stageScale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded transition"
                title="Acercar"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomReset}
                className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded transition"
                title="Restablecer zoom"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>

            {/* Acciones de imagen */}
            <div className="flex items-center gap-1 px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
              <button
                onClick={handleRotateSelected}
                disabled={!selectedId}
                className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
                title="Rotar 15°"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={!selectedId}
                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
                title="Eliminar (Supr)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleClearBoard}
                disabled={images.length === 0}
                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
                title="Limpiar tablero"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Subir imágenes */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition font-medium"
            >
              <Upload className="w-4 h-4" />
              Añadir Imágenes
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Guardar */}
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* TOAST DE GUARDADO */}
      {/* ================================================================ */}
      {saveMessage && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg">
          {saveMessage}
        </div>
      )}

      {/* ================================================================ */}
      {/* CANVAS */}
      {/* ================================================================ */}
      <div className="flex-1 relative">
        <MoodboardCanvas />

        {/* Estado vacío */}
        {images.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center p-8 bg-white/90 dark:bg-neutral-800/90 rounded-xl shadow-lg backdrop-blur-sm">
              <Upload className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                Comienza tu moodboard
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4 max-w-sm">
                Añade imágenes para crear tu tablero de inspiración.
              </p>
              <p className="text-sm text-neutral-500">
                Haz clic en <strong>Añadir Imágenes</strong> o arrastra archivos aquí
              </p>
            </div>
          </div>
        )}

        {/* Info de selección */}
        {selectedId && (
          <div className="absolute bottom-4 left-4 px-3 py-2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {images.find((img) => img.id === selectedId)?.width.toFixed(0)} x{" "}
              {images.find((img) => img.id === selectedId)?.height.toFixed(0)} px
            </span>
            <button
              onClick={clearSelection}
              className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Instrucciones */}
        <div className="absolute bottom-4 right-4 px-3 py-2 bg-white/80 dark:bg-neutral-800/80 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 backdrop-blur-sm">
          <div className="text-xs text-neutral-500 space-y-1">
            <p>🖱️ Arrastra para mover</p>
            <p>📐 Arrastra esquinas para redimensionar</p>
            <p>🔄 Controlador para rotar</p>
            <p>⌨️ Supr para eliminar</p>
            <p>🖱️ Rueda para zoom</p>
          </div>
        </div>
      </div>
    </main>
  );
}
