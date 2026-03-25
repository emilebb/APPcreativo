"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Heart, Share2, Download, Palette, Grid3X3, List, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  const auth = useAuth();
  const router = useRouter();
  const params = useParams();
  const moodboardId = params.id as string;
  
  const [moodboard, setMoodboard] = useState<Moodboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("grid");
  const [selectedImage, setSelectedImage] = useState<MoodboardImage | null>(null);

  // REGLA DE ORO: No buscar nada si la auth no ha terminado
  useEffect(() => {
    if (auth?.isInitialLoading) return;
    if (!auth?.user) {
      router.push('/login');
      return;
    }

    const fetchMoodboard = async () => {
      try {
        setLoading(true);
        setError(false);

        // Buscar en Supabase con seguridad: solo proyectos del usuario
        const { data, error } = await supabase
          .from('proyectos')
          .select('*')
          .eq('id', moodboardId)
          .eq('user_id', auth.user.id) // Seguridad: solo mis proyectos
          .eq('estado', 'active')
          .single();

        if (error || !data) {
          console.error('Moodboard not found:', error?.message);
          setError(true);
          return;
        }

        // Convertir datos de Supabase al formato esperado
        const loadedMoodboard: Moodboard = {
          id: data.id,
          title: data.nombre || 'Sin título',
          description: data.descripcion || '',
          category: data.tipo || 'moodboard',
          images: [], // TODO: Cargar imágenes desde data.images
          tags: [],
          created_at: data.created_at,
          updated_at: data.updated_at,
          color_palette: [],
          is_public: false,
          likes: 0,
          is_liked: false
        };

        setMoodboard(loadedMoodboard);

      } catch (error) {
        console.error('Error loading moodboard:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMoodboard();
  }, [moodboardId, auth?.user, auth?.isInitialLoading, router]);

  if (auth?.isInitialLoading || loading) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white/60">Cargando moodboard...</p>
        </div>
      </main>
    );
  }

  if (error || !moodboard) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-white mb-2">
            Moodboard no encontrado
          </h2>
          <p className="text-white/60 mb-6">
            El moodboard que buscas no existe, fue eliminado o no tienes permiso para verlo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Ir al Dashboard
            </Link>
            <Link
              href="/moodboard/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all border border-white/20"
            >
              <Palette className="w-4 h-4" />
              Crear Nuevo
            </Link>
          </div>
        </div>
      </main>
    );
  }

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
    if (typeof navigator !== 'undefined' && navigator.share && moodboard) {
      try {
        await navigator.share({
          title: moodboard.title,
          text: moodboard.description,
          url: '' // No URL needed for sharing in SSR
        });
      } catch (error) {
        // Fallback: show message instead of copying URL
        alert("Compartir no disponible. Usa el enlace del navegador.");
      }
    }
  };

  const handleEdit = () => {
    if (moodboard) {
      router.push(`/moodboard/${moodboard.id}/edit`);
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
    <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/moodboard"
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
              {moodboard.title}
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
              Actualizado {formatDate(moodboard.updated_at)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
              onClick={handleEdit}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid de imágenes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {moodboard.images.map((image) => (
          <div
            key={image.id}
            className="group relative overflow-hidden rounded-lg cursor-pointer"
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={image.url}
              alt={image.title || ""}
              width="800"
              height="384"
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
              width="1200"
              height="800"
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
