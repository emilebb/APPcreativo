"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Heart, Share2, Download, Palette, Grid3X3, List, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/authProvider";
import Link from "next/link";

interface MoodboardImage {
  id: string;
  url: string;
  title?: string;
  description?: string;
}

interface Moodboard {
  id: string;
  title: string;
  description?: string;
  images: MoodboardImage[];
  tags: string[];
  created_at: string;
  updated_at: string;
  category: string;
  is_public?: boolean;
  likes?: number;
  is_liked?: boolean;
  color_palette?: string[];
}

export default function MoodboardDetailPage() {
  const { session } = useAuth();
  const router = useRouter();
  const params = useParams();
  const moodboardId = params.id as string;
  
  const [moodboard, setMoodboard] = useState<Moodboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("grid");
  const [selectedImage, setSelectedImage] = useState<MoodboardImage | null>(null);

  useEffect(() => {
    if (!session) {
      router.push("/");
      return;
    }

    if (moodboardId) {
      loadMoodboard();
    }
  }, [session, moodboardId]);

  const loadMoodboard = async () => {
    try {
      setLoading(true);
      
      // Simulación de carga - en producción vendría de una API
      const mockMoodboard: Moodboard = {
        id: moodboardId,
        title: "Verano 2024",
        description: "Una colección vibrante de colores y energía solar para proyectos de verano. Inspirada en atardeceres, playas y la calidez del mediodía estival.",
        category: "verano",
        images: [
          {
            id: "1",
            url: "https://images.unsplash.com/photo-1507525428034-b723a9ce6890?w=800&h=600&fit=crop",
            title: "Atardecer tropical",
            description: "Colores cálidos del atardecer en la playa"
          },
          {
            id: "2",
            url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop",
            title: "Olas del mar",
            description: "El movimiento y energía del océano"
          },
          {
            id: "3",
            url: "https://images.unsplash.com/photo-1496715976403-7e36dc43f17b?w=800&h=600&fit=crop",
            title: "Palmeras al sol",
            description: "Siluetas tropicales contra el cielo azul"
          }
        ],
        tags: ["verano", "vibrante", "energía", "sol", "tropical", "playa"],
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T15:45:00Z",
        color_palette: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F"],
        is_public: true,
        likes: 42,
        is_liked: false
      };

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 800));
      setMoodboard(mockMoodboard);
    } catch (error) {
      console.error("Error loading moodboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!moodboard) return;
    
    try {
      // Simulación de like
      setMoodboard(prev => prev ? {
        ...prev,
        is_liked: !prev.is_liked,
        likes: (prev.likes || 0) + (prev.is_liked ? -1 : 1)
      } : null);
    } catch (error) {
      console.error("Error liking moodboard:", error);
    }
  };

  const handleShare = async () => {
    if (navigator.share && moodboard) {
      try {
        await navigator.share({
          title: moodboard.title,
          text: moodboard.description,
          url: window.location.href
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(window.location.href);
      alert("Enlace copiado al portapapeles");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-400 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Cargando moodboard...</p>
        </div>
      </main>
    );
  }

  if (!moodboard) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            Moodboard no encontrado
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            El moodboard que buscas no existe o no tienes permiso para verlo.
          </p>
          <Link
            href="/moodboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Moodboards
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/moodboard"
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
              {moodboard.title}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Actualizado {formatDate(moodboard.updated_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
              moodboard.is_liked
                ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
            }`}
          >
            <Heart className={`w-4 h-4 ${moodboard.is_liked ? 'fill-current' : ''}`} />
            {moodboard.likes}
          </button>
          
          <button
            onClick={handleShare}
            className="p-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 border-l border-neutral-200 dark:border-neutral-700 pl-2">
            <button
              onClick={() => router.push(`/moodboard/${moodboard.id}/edit`)}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid de imágenes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {moodboard.images.map((image) => (
          <div
            key={image.id}
            className="group relative overflow-hidden rounded-lg cursor-pointer"
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={image.url}
              alt={image.title || ""}
              className="w-full h-64 object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
              <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-center">
                  <p className="font-medium">{image.title}</p>
                  {image.description && (
                    <p className="text-sm opacity-80">{image.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de imagen seleccionada */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedImage.url}
              alt={selectedImage.title || ""}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {(selectedImage.title || selectedImage.description) && (
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-black/70 text-white rounded-lg">
                {selectedImage.title && (
                  <h3 className="font-medium mb-1">{selectedImage.title}</h3>
                )}
                {selectedImage.description && (
                  <p className="text-sm opacity-90">{selectedImage.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
