"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authProvider";
import { Upload, X, Plus, Palette, Image as ImageIcon, Save, Eye } from "lucide-react";
import Link from "next/link";

interface MoodboardImage {
  id: string;
  url: string;
  file?: File;
}

export default function NewMoodboardPage() {
  const { session } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState<MoodboardImage[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Colores extraídos de las imágenes (simulación)
  const [extractedColors, setExtractedColors] = useState<string[]>([]);

  if (!session) {
    router.push("/");
    return null;
  }

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage: MoodboardImage = {
            id: Date.now().toString() + Math.random().toString(),
            url: e.target?.result as string,
            file: file
          };
          setImages(prev => [...prev, newImage]);
          
          // Simular extracción de colores
          extractColorsFromImage(newImage.url);
        };
        reader.readAsDataURL(file);
      }
    });
  }, []);

  const extractColorsFromImage = (imageUrl: string) => {
    // Simulación de extracción de colores
    // En producción, usaría una librería como color-thief
    const mockColors = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", 
      "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2"
    ];
    
    const newColors = mockColors
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    
    setExtractedColors(prev => {
      const combined = [...prev, ...newColors];
      // Eliminar duplicados y limitar a 8 colores
      return Array.from(new Set(combined)).slice(0, 8);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags(prev => [...prev, trimmedTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Por favor, añade un título");
      return;
    }

    if (images.length === 0) {
      alert("Por favor, añade al menos una imagen");
      return;
    }

    setIsSaving(true);

    try {
      // Simulación de guardado
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // En producción, aquí subiría las imágenes y guardaría el moodboard
      console.log("Saving moodboard:", {
        title,
        description,
        tags,
        images: images.map(img => img.url),
        is_public: isPublic,
        color_palette: extractedColors
      });

      alert("¡Moodboard creado exitosamente!");
      router.push("/moodboard");
    } catch (error) {
      console.error("Error saving moodboard:", error);
      alert("Error al guardar el moodboard. Intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Nuevo Moodboard
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Crea una colección visual para inspirar tus proyectos
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            href="/moodboard"
            className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
          >
            Cancelar
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim() || images.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal - Formulario */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información básica */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Información
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Título *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Mi moodboard inspirador"
                className="w-full px-4 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el propósito y estilo de este moodboard..."
                rows={3}
                className="w-full px-4 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Etiquetas
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Añadir etiqueta..."
                  className="flex-1 px-4 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                />
                <button
                  onClick={addTag}
                  className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-500 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-neutral-900 dark:text-white bg-white dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 rounded focus:ring-neutral-400"
              />
              <label htmlFor="isPublic" className="text-sm text-neutral-700 dark:text-neutral-300">
                Hacer público este moodboard
              </label>
            </div>
          </div>

          {/* Área de imágenes */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Imágenes ({images.length})
            </h2>

            {/* Drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                isDragging
                  ? "border-neutral-400 bg-neutral-50 dark:bg-neutral-700"
                  : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500"
              }`}
            >
              <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                Arrastra imágenes aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-neutral-500">
                JPG, PNG, GIF hasta 10MB cada una
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Grid de imágenes */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt="Moodboard image"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Columna lateral - Paleta de colores */}
        <div className="space-y-6">
          {/* Paleta de colores */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Paleta de Colores
              </h2>
            </div>
            
            {extractedColors.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Colores extraídos de tus imágenes:
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {extractedColors.map((color, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg border border-neutral-200 dark:border-neutral-600"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">
                Añade imágenes para extraer colores automáticamente
              </p>
            )}
          </div>

          {/* Vista previa */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Vista Previa
              </h2>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium text-neutral-900 dark:text-white">
                {title || "Sin título"}
              </h3>
              {description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {description}
                </p>
              )}
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {images.slice(0, 4).map((image) => (
                    <img
                      key={image.id}
                      src={image.url}
                      alt="Preview"
                      className="w-full h-20 object-cover rounded"
                    />
                  ))}
                </div>
              )}
              <div className="text-xs text-neutral-500">
                {images.length} imágenes • {tags.length} etiquetas
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
