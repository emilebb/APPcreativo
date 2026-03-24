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
  Layers,
} from "lucide-react";
import { useMoodboardStore } from "@/store/useMoodboardStore";
import MoodboardCanvas from "@/components/MoodboardCanvas";

export default function EditMoodboardPage() {
  const params = useParams();
  const moodboardId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showLayers, setShowLayers] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!isDirty || saving) return;

    const timeoutId = setTimeout(() => {
      handleSave();
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [isDirty, saving, handleSave]);

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

  const handleRotateSelected = () => {
    if (!selectedId) return;
    const image = images.find((img) => img.id === selectedId);
    if (image) {
      updateImage(selectedId, { rotation: (image.rotation + 15) % 360 });
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    deleteSelected();
  };

  const handleClearBoard = () => {
    if (images.length === 0) return;
    if (confirm("¿Eliminar todas las imágenes del moodboard?")) {
      clearBoard();
    }
  };

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      Array.from(files).forEach((file, index) => {
        if (!file.type.startsWith("image/")) return;

        const url = URL.createObjectURL(file);

        const img = new window.Image();
        img.onload = () => {
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

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [addImage, images.length]
  );

  if (loading) {
    return (
      <main className="h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-600/10 rounded-full blur-[150px]" />
        </div>
        <div className="relative z-10 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-violet-400 mx-auto mb-4" />
          <p className="text-neutral-400">Cargando moodboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col bg-[#050505] overflow-hidden relative">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,transparent_40%,rgba(255,255,255,0.02)_40%)] bg-[length:24px_24px]" />
      </div>

      {/* ================================================================ */}
      {/* FLOATING TOOLBAR */}
      {/* ================================================================ */}
      <div className="relative z-20 flex-shrink-0">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
          {/* Back */}
          <Link
            href={`/moodboard/${moodboardId}`}
            className="p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Volver"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="w-px h-6 bg-white/10" />

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del moodboard"
            className="text-sm font-medium bg-transparent border-none outline-none text-white placeholder-white/40 w-48"
          />

          {isDirty && (
            <span className="text-xs text-amber-400 animate-pulse">
              Sin guardar
            </span>
          )}

          <div className="w-px h-6 bg-white/10" />

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomOut}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Alejar"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs px-2 min-w-[3rem] text-center font-medium text-white/50">
              {Math.round(stageScale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Acercar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomReset}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Restablecer zoom"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-white/10" />

          {/* Image actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleRotateSelected}
              disabled={!selectedId}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="Rotar 15°"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={!selectedId}
              className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="Eliminar (Supr)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearBoard}
              disabled={images.length === 0}
              className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="Limpiar tablero"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowLayers(!showLayers)}
              className={`p-2 rounded-lg transition-all ${showLayers ? 'text-violet-400 bg-violet-500/10' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
              title="Capas"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-white/10" />

          {/* Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-all text-sm font-medium"
          >
            <Upload className="w-4 h-4" />
            Añadir
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-rose-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-rose-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium">
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
            </div>
          </button>
        </div>
      </div>

      {/* Save toast */}
      {saveMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 backdrop-blur-xl bg-emerald-500/90 border border-emerald-400/30 px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
          <span className="text-sm font-medium text-white flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {saveMessage}
          </span>
        </div>
      )}

      {/* ================================================================ */}
      {/* CANVAS */}
      {/* ================================================================ */}
      <div className="flex-1 relative">
        <MoodboardCanvas />

        {/* Empty state */}
        {images.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center p-10 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-rose-500/20 flex items-center justify-center mx-auto mb-5">
                <Upload className="w-10 h-10 text-white/40" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Comienza tu moodboard
              </h3>
              <p className="text-neutral-400 mb-4 max-w-sm text-sm">
                Añade imágenes para crear tu tablero de inspiración.
              </p>
              <p className="text-sm text-white/30">
                Haz clic en <strong className="text-white/50">Añadir</strong> o arrastra archivos aquí
              </p>
            </div>
          </div>
        )}

        {/* Selection info */}
        {selectedId && (
          <div className="absolute bottom-4 left-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-4">
            <span className="text-sm text-white/60">
              {images.find((img) => img.id === selectedId)?.width.toFixed(0)} x{" "}
              {images.find((img) => img.id === selectedId)?.height.toFixed(0)} px
            </span>
            <button
              onClick={clearSelection}
              className="text-white/40 hover:text-white/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-4 right-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl px-4 py-3">
          <div className="text-xs text-white/30 space-y-1.5">
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
