"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authProvider";
import { 
  Upload, X, Plus, Save, ArrowLeft, Grid3X3, 
  Columns, Layout, Sparkles, Image as ImageIcon,
  Move, Trash2, ZoomIn, ZoomOut, RotateCw, BookmarkPlus, Menu
} from "lucide-react";
import Link from "next/link";

interface MoodboardImage {
  id: string;
  url: string;
  file?: File;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
}

type LayoutStyle = "freeform" | "grid" | "masonry" | "collage" | "magazine" | "minimal";

interface LayoutTemplate {
  id: LayoutStyle;
  name: string;
  description: string;
  icon: any;
  gridCols?: number;
  gap?: number;
}

const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  {
    id: "freeform",
    name: "Libre",
    description: "Posiciona imágenes donde quieras",
    icon: Move,
  },
  {
    id: "grid",
    name: "Cuadrícula",
    description: "Grid uniforme y ordenado",
    icon: Grid3X3,
    gridCols: 3,
    gap: 16,
  },
  {
    id: "masonry",
    name: "Mosaico",
    description: "Estilo Pinterest",
    icon: Layout,
    gridCols: 3,
    gap: 12,
  },
  {
    id: "collage",
    name: "Collage",
    description: "Superposición artística",
    icon: Sparkles,
  },
  {
    id: "magazine",
    name: "Revista",
    description: "Diseño editorial",
    icon: Columns,
    gridCols: 2,
    gap: 24,
  },
  {
    id: "minimal",
    name: "Minimalista",
    description: "Espacios amplios",
    icon: ImageIcon,
    gridCols: 2,
    gap: 48,
  },
];

export default function EditMoodboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const moodboardId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<MoodboardImage[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<LayoutStyle>("freeform");
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showLayoutPanel, setShowLayoutPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);

  useEffect(() => {
    loadMoodboard();
    loadCustomTemplates();
  }, [moodboardId, user]);

  const loadCustomTemplates = async () => {
    if (!user) return;
    
    try {
      const { default: templateService } = await import("@/lib/templateService");
      const templates = templateService.getTemplates(user.id);
      setCustomTemplates(templates);
    } catch (error) {
      console.error("Error loading custom templates:", error);
    }
  };

  const loadMoodboard = async () => {
    try {
      setLoading(true);
      
      const { default: moodboardService } = await import("@/lib/moodboardService");
      const data = await moodboardService.getMoodboard(moodboardId);
      
      if (data) {
        setTitle(data.title);
        setDescription(data.description || "");
        setImages(data.images || []);
        
        // Validar que el layout sea válido
        const validLayouts: LayoutStyle[] = ["freeform", "grid", "masonry", "collage", "magazine", "minimal"];
        const loadedLayout = data.layout;
        if (loadedLayout && validLayouts.includes(loadedLayout as LayoutStyle)) {
          setSelectedLayout(loadedLayout as LayoutStyle);
        } else {
          setSelectedLayout("freeform");
        }
      } else {
        setTitle("Sin título");
        setDescription("");
        setImages([]);
      }
    } catch (error) {
      console.error("Error loading moodboard:", error);
      setTitle("Sin título");
      setDescription("");
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage: MoodboardImage = {
            id: Date.now().toString() + Math.random().toString(),
            url: e.target?.result as string,
            file: file,
            x: 50 + index * 20,
            y: 50 + index * 20,
            width: 200,
            height: 200,
            rotation: 0,
            zIndex: images.length + index,
          };
          setImages((prev) => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
  }, [images.length]);

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

  const handleImageMouseDown = (e: React.MouseEvent, imageId: string) => {
    if (selectedLayout !== "freeform") return;
    
    e.stopPropagation();
    const image = images.find((img) => img.id === imageId);
    if (!image) return;

    setDraggedImageId(imageId);
    setSelectedImageId(imageId);
    setDragOffset({
      x: e.clientX - image.x,
      y: e.clientY - image.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedImageId || selectedLayout !== "freeform") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    setImages((prev) =>
      prev.map((img) =>
        img.id === draggedImageId
          ? { ...img, x: Math.max(0, x), y: Math.max(0, y) }
          : img
      )
    );
  };

  const handleMouseUp = () => {
    setDraggedImageId(null);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (selectedImageId === id) setSelectedImageId(null);
  };

  const rotateImage = (id: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, rotation: (img.rotation + 90) % 360 } : img
      )
    );
  };

  const resizeImage = (id: string, delta: number) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id
          ? {
              ...img,
              width: Math.max(100, img.width + delta),
              height: Math.max(100, img.height + delta),
            }
          : img
      )
    );
  };

  const applyLayout = (layout: LayoutStyle) => {
    setSelectedLayout(layout);
    
    if (layout === "freeform") return;

    const template = LAYOUT_TEMPLATES.find((t) => t.id === layout);
    if (!template) return;

    const cols = template.gridCols || 3;
    const gap = template.gap || 16;
    const baseSize = 200;

    setImages((prev) =>
      prev.map((img, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);

        return {
          ...img,
          x: col * (baseSize + gap),
          y: row * (baseSize + gap),
          width: baseSize,
          height: baseSize,
          rotation: 0,
        };
      })
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Por favor, añade un título");
      return;
    }

    setIsSaving(true);
    try {
      const { default: moodboardService } = await import("@/lib/moodboardService");
      
      const moodboardData = {
        id: moodboardId,
        title,
        description,
        layout: selectedLayout,
        images: images.map((img) => ({
          id: img.id,
          url: img.url,
          x: img.x,
          y: img.y,
          width: img.width,
          height: img.height,
          rotation: img.rotation,
          zIndex: img.zIndex,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await moodboardService.saveMoodboard(moodboardData);
      
      alert("¡Moodboard guardado exitosamente!");
      router.push(`/moodboard/${moodboardId}`);
    } catch (error) {
      console.error("Error saving moodboard:", error);
      alert("Error al guardar. Intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!user) {
      alert("Debes iniciar sesión para guardar plantillas");
      return;
    }

    if (!templateName.trim()) {
      alert("Por favor, añade un nombre a la plantilla");
      return;
    }

    try {
      const { default: templateService } = await import("@/lib/templateService");
      
      const template = templateService.createTemplateFromMoodboard(
        user.id,
        templateName,
        templateDescription,
        selectedLayout,
        images.map(img => ({
          x: img.x,
          y: img.y,
          width: img.width,
          height: img.height,
          rotation: img.rotation,
        }))
      );

      templateService.saveTemplate(template);
      
      setCustomTemplates(prev => [...prev, template]);
      setShowSaveTemplateModal(false);
      setTemplateName("");
      setTemplateDescription("");
      
      alert("¡Plantilla guardada exitosamente!");
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Error al guardar la plantilla");
    }
  };

  const applyCustomTemplate = (template: any) => {
    setSelectedLayout(template.layout);
    
    if (template.imagePositions && images.length > 0) {
      setImages(prev => 
        prev.map((img, index) => {
          const position = template.imagePositions[index % template.imagePositions.length];
          return position ? {
            ...img,
            x: position.x,
            y: position.y,
            width: position.width,
            height: position.height,
            rotation: position.rotation,
          } : img;
        })
      );
    }
  };

  const deleteCustomTemplate = async (templateId: string) => {
    if (!user) return;
    if (!confirm("¿Eliminar esta plantilla?")) return;

    try {
      const { default: templateService } = await import("@/lib/templateService");
      templateService.deleteTemplate(user.id, templateId);
      setCustomTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Cargando moodboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      {/* Toolbar superior */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href={`/moodboard/${moodboardId}`}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título del moodboard"
                className="text-lg font-semibold bg-transparent border-none outline-none text-neutral-900 dark:text-white placeholder-neutral-400"
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción..."
                className="text-sm bg-transparent border-none outline-none text-neutral-600 dark:text-neutral-400 placeholder-neutral-400 w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón para abrir panel en móvil */}
            <button
              onClick={() => setShowLayoutPanel(true)}
              className="lg:hidden p-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition"
              title="Estilos de Layout"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm px-2 min-w-[3rem] text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Añadir Imágenes</span>
            </button>

            <button
              onClick={() => setShowSaveTemplateModal(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition"
            >
              <BookmarkPlus className="w-4 h-4" />
              Guardar como Plantilla
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Guardar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Panel lateral - Estilos (Desktop) */}
        <div className="hidden lg:block w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
            Estilos de Layout
          </h3>
          <div className="space-y-2">
            {LAYOUT_TEMPLATES.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => applyLayout(template.id)}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    selectedLayout === template.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{template.name}</span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {template.description}
                  </p>
                </button>
              );
            })}
          </div>

          {customTemplates.length > 0 && (
            <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                Mis Plantillas
              </h3>
              <div className="space-y-2">
                {customTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <button
                        onClick={() => applyCustomTemplate(template)}
                        className="flex-1 text-left"
                      >
                        <span className="font-medium text-sm text-neutral-900 dark:text-white block">
                          {template.name}
                        </span>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                          {template.description}
                        </p>
                      </button>
                      <button
                        onClick={() => deleteCustomTemplate(template.id)}
                        className="p-1 text-neutral-400 hover:text-red-500 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedImageId && (
            <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                Imagen Seleccionada
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => rotateImage(selectedImageId)}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition"
                >
                  <RotateCw className="w-4 h-4" />
                  Rotar 90°
                </button>
                <button
                  onClick={() => resizeImage(selectedImageId, 20)}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition"
                >
                  <ZoomIn className="w-4 h-4" />
                  Agrandar
                </button>
                <button
                  onClick={() => resizeImage(selectedImageId, -20)}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition"
                >
                  <ZoomOut className="w-4 h-4" />
                  Reducir
                </button>
                <button
                  onClick={() => removeImage(selectedImageId)}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Panel lateral - Estilos (Mobile Drawer) */}
        {showLayoutPanel && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowLayoutPanel(false)}
            />
            
            {/* Drawer */}
            <div className="relative w-80 max-w-[85vw] bg-white dark:bg-neutral-800 p-4 overflow-y-auto animate-in slide-in-from-left duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Estilos de Layout
                </h3>
                <button
                  onClick={() => setShowLayoutPanel(false)}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {LAYOUT_TEMPLATES.map((template) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => {
                        applyLayout(template.id);
                        setShowLayoutPanel(false);
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        selectedLayout === template.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4" />
                        <span className="font-medium text-sm">{template.name}</span>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {template.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {customTemplates.length > 0 && (
                <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                    Mis Plantillas
                  </h3>
                  <div className="space-y-2">
                    {customTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <button
                            onClick={() => {
                              applyCustomTemplate(template);
                              setShowLayoutPanel(false);
                            }}
                            className="flex-1 text-left"
                          >
                            <span className="font-medium text-sm text-neutral-900 dark:text-white block">
                              {template.name}
                            </span>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                              {template.description}
                            </p>
                          </button>
                          <button
                            onClick={() => deleteCustomTemplate(template.id)}
                            className="p-1 text-neutral-400 hover:text-red-500 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedImageId && (
                <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                    Imagen Seleccionada
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        rotateImage(selectedImageId);
                        setShowLayoutPanel(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition"
                    >
                      <RotateCw className="w-4 h-4" />
                      Rotar 90°
                    </button>
                    <button
                      onClick={() => {
                        resizeImage(selectedImageId, 20);
                        setShowLayoutPanel(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition"
                    >
                      <ZoomIn className="w-4 h-4" />
                      Agrandar
                    </button>
                    <button
                      onClick={() => {
                        resizeImage(selectedImageId, -20);
                        setShowLayoutPanel(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition"
                    >
                      <ZoomOut className="w-4 h-4" />
                      Reducir
                    </button>
                    <button
                      onClick={() => {
                        removeImage(selectedImageId);
                        setShowLayoutPanel(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Canvas principal */}
        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <div
            ref={canvasRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={() => setSelectedImageId(null)}
            className={`relative bg-white dark:bg-neutral-800 rounded-lg shadow-lg mx-auto transition-all ${
              isDragging ? "ring-2 ring-blue-500" : ""
            }`}
            style={{
              width: `${800 * (zoom / 100)}px`,
              height: `${600 * (zoom / 100)}px`,
              minHeight: "600px",
            }}
          >
            {images.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                    Arrastra imágenes aquí o haz clic en "Añadir Imágenes"
                  </p>
                  <p className="text-sm text-neutral-500">
                    Luego elige un estilo de layout o personalízalo libremente
                  </p>
                </div>
              </div>
            ) : (
              images.map((image) => (
                <div
                  key={image.id}
                  onMouseDown={(e) => handleImageMouseDown(e, image.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageId(image.id);
                  }}
                  className={`absolute cursor-move transition-shadow ${
                    selectedImageId === image.id
                      ? "ring-2 ring-blue-500 shadow-xl"
                      : "hover:shadow-lg"
                  }`}
                  style={{
                    left: `${image.x * (zoom / 100)}px`,
                    top: `${image.y * (zoom / 100)}px`,
                    width: `${image.width * (zoom / 100)}px`,
                    height: `${image.height * (zoom / 100)}px`,
                    transform: `rotate(${image.rotation}deg)`,
                    zIndex: image.zIndex,
                  }}
                >
                  <img
                    src={image.url}
                    alt=""
                    className="w-full h-full object-cover rounded-lg pointer-events-none"
                    draggable={false}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Modal para guardar plantilla */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Guardar como Plantilla
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Nombre de la plantilla *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Mi plantilla personalizada"
                  className="w-full px-4 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Describe el estilo de esta plantilla..."
                  rows={3}
                  className="w-full px-4 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowSaveTemplateModal(false);
                    setTemplateName("");
                    setTemplateDescription("");
                  }}
                  className="flex-1 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveAsTemplate}
                  disabled={!templateName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Guardar Plantilla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
