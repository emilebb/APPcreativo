// ============================================================================
// CREATIONX - Moodboard Store
// Store de Zustand para el Moodboard
// ============================================================================

"use client";

import { create } from "zustand";

// ============================================================================
// TYPES
// ============================================================================

export interface MoodboardImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

interface MoodboardState {
  // Estado
  projectId: string | null;
  ownerId: string | null;
  images: MoodboardImage[];
  selectedId: string | null;
  title: string;
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  stageScale: number;
  stagePosition: { x: number; y: number };

  // Acciones locales
  setTitle: (title: string) => void;
  setImages: (images: MoodboardImage[]) => void;
  addImage: (image: Omit<MoodboardImage, "id">) => string;
  updateImage: (id: string, updates: Partial<MoodboardImage>) => void;
  deleteImage: (id: string) => void;
  deleteSelected: () => void;
  setSelected: (id: string | null) => void;
  clearSelection: () => void;
  clearBoard: () => void;
  setStageScale: (scale: number) => void;
  setStagePosition: (position: { x: number; y: number }) => void;
  markClean: () => void;

  // Acciones asíncronas
  saveToLocal: () => Promise<boolean>;
  loadFromLocal: (projectId: string) => Promise<boolean>;
  loadMoodboard: (projectId: string | { title: string; images: MoodboardImage[] }) => Promise<boolean>;  // alias para compatibilidad
  initProject: (projectId: string, ownerId: string) => Promise<void>;
}

// ============================================================================
// HELPERS
// ============================================================================

const generateId = () => `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============================================================================
// STORE
// ============================================================================

export const useMoodboardStore = create<MoodboardState>((set, get) => ({
  // Estado inicial
  projectId: null,
  ownerId: null,
  images: [],
  selectedId: null,
  title: "Sin título",
  isDirty: false,
  isLoading: false,
  isSaving: false,
  error: null,
  stageScale: 1,
  stagePosition: { x: 0, y: 0 },

  // Acciones locales
  setTitle: (title) => set({ title, isDirty: true }),

  setImages: (images) => set({ images, isDirty: true }),

  addImage: (image) => {
    const id = generateId();
    set((state) => ({
      images: [...state.images, { ...image, id }],
      selectedId: id,
      isDirty: true,
    }));
    
    // Auto-save si hay proyecto activo
    const state = get();
    if (state.projectId) {
      setTimeout(() => get().saveToLocal(), 100);
    }
    
    return id;
  },

  updateImage: (id, updates) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, ...updates } : img
      ),
      isDirty: true,
    }));
    
    // Auto-save
    const state = get();
    if (state.projectId) {
      setTimeout(() => get().saveToLocal(), 100);
    }
  },

  deleteImage: (id) => {
    set((state) => ({
      images: state.images.filter((img) => img.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
      isDirty: true,
    }));
  },

  deleteSelected: () => {
    const { selectedId, deleteImage } = get();
    if (selectedId) deleteImage(selectedId);
  },

  setSelected: (id) => set({ selectedId: id }),

  clearSelection: () => set({ selectedId: null }),

  clearBoard: () => set({ images: [], selectedId: null, isDirty: true }),

  setStageScale: (scale) => set({ stageScale: scale }),

  setStagePosition: (position) => set({ stagePosition: position }),

  markClean: () => set({ isDirty: false }),

  // Acciones asíncronas
  saveToLocal: async () => {
    const { projectId, images, title } = get();
    
    if (!projectId) {
      return false;
    }

    set({ isSaving: true });

    try {
      localStorage.setItem(`moodboard-${projectId}`, JSON.stringify({ images, title }));
      set({ isDirty: false, isSaving: false, error: null });
      console.log("Moodboard guardado localmente");
      return true;
    } catch (error: any) {
      console.error("Error guardando:", error);
      set({ isSaving: false, error: error.message });
      return false;
    }
  },

  loadFromLocal: async (projectId: string) => {
    set({ isLoading: true });

    try {
      const stored = localStorage.getItem(`moodboard-${projectId}`);
      if (stored) {
        const data = JSON.parse(stored);
        set({
          projectId,
          title: data.title || "Sin título",
          images: data.images || [],
          isDirty: false,
          isLoading: false,
        });
        return true;
      }

      set({ isLoading: false });
      return false;
    } catch (error: any) {
      console.error("Error cargando:", error);
      set({ isLoading: false, error: error.message });
      return false;
    }
  },

  // Alias para compatibilidad
  loadMoodboard: async (dataOrId: string | { title: string; images: MoodboardImage[] }) => {
    if (typeof dataOrId === 'string') {
      return get().loadFromLocal(dataOrId);
    }
    // Carga datos directamente
    set({
      title: dataOrId.title || "Sin título",
      images: dataOrId.images || [],
      isDirty: false,
    });
    return true;
  },

  initProject: async (projectId, ownerId) => {
    set({ projectId, ownerId, isLoading: true });
    await get().loadFromLocal(projectId);
    set({ isLoading: false });
  },
}));

// Selector para serializar
export const useSerializeMoodboard = () => {
  const { title, images } = useMoodboardStore.getState();
  return { title, images };
};
