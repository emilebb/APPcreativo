"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Trash2,
  RotateCw,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import { useMoodboardStore } from "@/store/useMoodboardStore";
import MoodboardCanvas from "@/components/MoodboardCanvas";
import MoodboardUploader from "@/components/MoodboardUploader";

export default function EditMoodboardPage() {
  const params = useParams();
  const router = useRouter();
  const moodboardId = params.id as string;

  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const {
    images,
    selectedId,
    isDirty,
    stageScale,
    setStageScale,
    loadMoodboard,
    updateImage,
    deleteSelected,
    clearSelection,
  } = useMoodboardStore();

  // Load moodboard data
  useEffect(() => {
    const loadMoodboardData = async () => {
      try {
        setLoading(true);

        // Try to load from localStorage first
        const stored = localStorage.getItem(`moodboard-${moodboardId}`);
        if (stored) {
          const data = JSON.parse(stored);
          setTitle(data.title || "Sin título");
          loadMoodboard({ images: data.images || [] });
        } else {
          setTitle("Sin título");
          loadMoodboard({ images: [] });
        }
      } catch (error) {
        console.error("Error loading moodboard:", error);
        setTitle("Sin título");
        loadMoodboard({ images: [] });
      } finally {
        setLoading(false);
      }
    };

    loadMoodboardData();
  }, [moodboardId, loadMoodboard]);

  // Save moodboard
  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      alert("Por favor, añade un título");
      return;
    }

    setSaving(true);
    try {
      const moodboardData = {
        id: moodboardId,
        title,
        images,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(`moodboard-${moodboardId}`, JSON.stringify(moodboardData));

      setSaveMessage("¡Guardado!");
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (error) {
      console.error("Error saving moodboard:", error);
      alert("Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }, [moodboardId, title, images]);

  // Auto-save on changes (debounced)
  useEffect(() => {
    if (!isDirty || saving) return;

    const timeoutId = setTimeout(() => {
      handleSave();
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [isDirty, saving, handleSave]);

  // Zoom controls
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

  // Rotate selected image
  const handleRotateSelected = () => {
    if (!selectedId) return;
    const image = images.find((img) => img.id === selectedId);
    if (image) {
      updateImage(selectedId, { rotation: (image.rotation + 15) % 360 });
    }
  };

  // Delete selected image
  const handleDeleteSelected = () => {
    if (!selectedId) return;
    if (confirm("¿Eliminar la imagen seleccionada?")) {
      deleteSelected();
    }
  };

  // Clear selection
  const handleClearSelection = () => {
    clearSelection();
  };

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
    <main className="h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
      {/* Header Toolbar */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left side */}
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

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Zoom controls */}
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

            {/* Image controls */}
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
            </div>

            {/* Uploader */}
            <MoodboardUploader />

            {/* Save button */}
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

      {/* Save message toast */}
      {saveMessage && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg animate-pulse">
          {saveMessage}
        </div>
      )}

      {/* Canvas area */}
      <div className="flex-1 relative">
        <MoodboardCanvas />

        {/* Empty state */}
        {images.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center p-8 bg-white/80 dark:bg-neutral-800/80 rounded-xl shadow-lg backdrop-blur-sm">
              <Upload className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                Comienza tu moodboard
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4 max-w-sm">
                Añade imágenes para crear tu tablero de inspiración. Arrastra, redimensiona y rota las imágenes libremente.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                <span>Haz clic en</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">Añadir Imágenes</span>
                <span>o arrastra archivos aquí</span>
              </div>
            </div>
          </div>
        )}

        {/* Selection info */}
        {selectedId && (
          <div className="absolute bottom-4 left-4 px-3 py-2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">
                {images.find((img) => img.id === selectedId)?.width.toFixed(0)} x{" "}
                {images.find((img) => img.id === selectedId)?.height.toFixed(0)} px
              </span>
              <button
                onClick={handleClearSelection}
                className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-4 right-4 px-3 py-2 bg-white/80 dark:bg-neutral-800/80 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 backdrop-blur-sm">
          <div className="text-xs text-neutral-500 space-y-1">
            <p>🖱️ Arrastra para mover</p>
            <p>📐 Arrastra esquinas para redimensionar</p>
            <p>🔄 Usa el controlador de rotación</p>
            <p>⌨️ Supr para eliminar</p>
            <p>🖱️ Rueda del ratón para zoom</p>
          </div>
        </div>
      </div>
    </main>
  );
}
