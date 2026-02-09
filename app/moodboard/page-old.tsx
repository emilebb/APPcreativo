"use client";

import { useState } from "react";
import { Plus, Image as ImageIcon, Palette, Heart, Grid3X3 } from "lucide-react";
import Link from "next/link";

export default function MoodboardsPage() {
  const [moodboards] = useState([
        {
          id: "1",
          title: "Verano 2024",
          description: "Colores vibrantes y energía solar para proyectos de verano",
          images: [
            "https://images.unsplash.com/photo-1507525428034-b723a9ce6890?w=300&h=200&fit=crop",
            "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300&h=200&fit=crop",
            "https://images.unsplash.com/photo-1496715976403-7e36dc43f17b?w=300&h=200&fit=crop"
          ],
          tags: ["verano", "vibrante", "energía", "sol"],
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-20T15:45:00Z",
          color_palette: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A"],
          is_public: true
        },
        {
          id: "2",
          title: "Minimalismo Oscuro",
          description: "Estética minimalista con tonos oscuros y elegantes",
          images: [
            "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&h=200&fit=crop",
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop"
          ],
          tags: ["minimalismo", "oscuro", "elegante", "moderno"],
          created_at: "2024-01-10T08:20:00Z",
          updated_at: "2024-01-18T12:30:00Z",
          color_palette: ["#1A1A1A", "#2D2D2D", "#404040", "#B0B0B0"],
          is_public: false
        },
        {
          id: "3",
          title: "Naturaleza Orgánica",
          description: "Inspiración de la naturaleza con formas orgánicas y colores tierra",
          images: [
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop",
            "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&h=200&fit=crop",
            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop"
          ],
          tags: ["naturaleza", "orgánico", "tierra", "verde"],
          created_at: "2024-01-05T14:15:00Z",
          updated_at: "2024-01-22T09:10:00Z",
          color_palette: ["#8B7355", "#A0826D", "#6B8E23", "#556B2F"],
          is_public: true
        }
      ];

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 800));
      setMoodboards(mockMoodboards);
    } catch (error) {
      console.error("Error loading moodboards:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMoodboards = moodboards.filter(moodboard =>
    moodboard.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    moodboard.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    moodboard.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este moodboard?")) {
      return;
    }

    try {
      // Simulación de eliminación
      setMoodboards(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error("Error deleting moodboard:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-400 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Cargando moodboards...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Moodboards
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Colecciones visuales para inspirar tus proyectos creativos
          </p>
        </div>
        
        <Link
          href="/moodboard/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition"
        >
          <Plus className="w-4 h-4" />
          Nuevo Moodboard
        </Link>
      </div>

      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar moodboards..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>

        {/* Vista y filtros */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition ${
              viewMode === "grid"
                ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition ${
              viewMode === "list"
                ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <Palette className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Estado vacío */}
      {filteredMoodboards.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Palette className="w-10 h-10 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
            {searchQuery ? "No se encontraron moodboards" : "No tienes moodboards aún"}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            {searchQuery 
              ? "Intenta con otros términos de búsqueda"
              : "Crea tu primer moodboard para empezar a coleccionar inspiración visual"
            }
          </p>
          {!searchQuery && (
            <Link
              href="/moodboard/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition"
            >
              <Plus className="w-4 h-4" />
              Crear Moodboard
            </Link>
          )}
        </div>
      )}

      {/* Grid de moodboards */}
      {viewMode === "grid" && filteredMoodboards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredMoodboards.map((moodboard) => (
            <div
              key={moodboard.id}
              className="group bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Imágenes */}
              <div className="relative h-48 bg-neutral-100 dark:bg-neutral-700">
                {moodboard.images.length > 0 && (
                  <img
                    src={moodboard.images[0]}
                    alt={moodboard.title}
                    className="w-full h-full object-cover"
                  />
                )}
                {moodboard.is_public && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded-full">
                    Público
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Link
                    href={`/moodboard/${moodboard.id}`}
                    className="px-3 py-1 bg-white text-neutral-900 rounded-lg text-sm font-medium"
                  >
                    Ver
                  </Link>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition">
                    {moodboard.title}
                  </h3>
                  {moodboard.description && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                      {moodboard.description}
                    </p>
                  )}
                </div>

                {/* Paleta de colores */}
                {moodboard.color_palette && (
                  <div className="flex gap-1">
                    {moodboard.color_palette.slice(0, 4).map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded-full border border-neutral-200 dark:border-neutral-600"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {moodboard.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                  {moodboard.tags.length > 3 && (
                    <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs rounded-md">
                      +{moodboard.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-700">
                  <span className="text-xs text-neutral-500">
                    {formatDate(moodboard.updated_at)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => router.push(`/moodboard/${moodboard.id}/edit`)}
                      className="p-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(moodboard.id)}
                      className="p-1 text-neutral-500 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista de moodboards */}
      {viewMode === "list" && filteredMoodboards.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          {filteredMoodboards.map((moodboard) => (
            <div
              key={moodboard.id}
              className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-3 sm:p-4 hover:shadow-lg transition-all"
            >
              <div className="flex gap-3 sm:gap-4">
                {/* Miniatura */}
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-neutral-100 dark:bg-neutral-700 rounded-lg flex-shrink-0 overflow-hidden">
                  {moodboard.images.length > 0 && (
                    <img
                      src={moodboard.images[0]}
                      alt={moodboard.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Contenido */}
                <div className="flex-1 space-y-1 sm:space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white text-sm sm:text-base">
                        {moodboard.title}
                      </h3>
                      {moodboard.description && (
                        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                          {moodboard.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => router.push(`/moodboard/${moodboard.id}/edit`)}
                        className="p-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(moodboard.id)}
                        className="p-1 text-neutral-500 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-neutral-500">
                    <span>{moodboard.images.length} imágenes</span>
                    <span>{formatDate(moodboard.updated_at)}</span>
                    {moodboard.is_public && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full">
                        Público
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {moodboard.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
