"use client";

import { create } from "zustand";

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
  images: MoodboardImage[];
  selectedId: string | null;
  title: string;
  isDirty: boolean;
  stageScale: number;
  stagePosition: { x: number; y: number };

  // Acciones
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
  loadMoodboard: (data: { title?: string; images: MoodboardImage[] }) => void;
}

const generateId = () => `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useMoodboardStore = create<MoodboardState>((set, get) => ({
  // Estado inicial
  images: [],
  selectedId: null,
  title: "Sin título",
  isDirty: false,
  stageScale: 1,
  stagePosition: { x: 0, y: 0 },

  // Acciones
  setTitle: (title) => set({ title, isDirty: true }),

  setImages: (images) => set({ images, isDirty: true }),

  addImage: (image) => {
    const id = generateId();
    set((state) => ({
      images: [...state.images, { ...image, id }],
      selectedId: id,
      isDirty: true,
    }));
    return id;
  },

  updateImage: (id, updates) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, ...updates } : img
      ),
      isDirty: true,
    }));
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
    if (selectedId) {
      deleteImage(selectedId);
    }
  },

  setSelected: (id) => set({ selectedId: id }),

  clearSelection: () => set({ selectedId: null }),

  clearBoard: () => {
    set({
      images: [],
      selectedId: null,
      isDirty: true,
    });
  },

  setStageScale: (scale) => set({ stageScale: scale }),

  setStagePosition: (position) => set({ stagePosition: position }),

  markClean: () => set({ isDirty: false }),

  loadMoodboard: (data) => {
    set({
      title: data.title || "Sin título",
      images: data.images || [],
      selectedId: null,
      isDirty: false,
    });
  },
}));

// Selector para serializar (para guardar en localStorage/Firebase)
export const useSerializeMoodboard = () => {
  const { title, images } = useMoodboardStore.getState();
  return {
    title,
    images: images.map((img) => ({
      id: img.id,
      src: img.src,
      x: img.x,
      y: img.y,
      width: img.width,
      height: img.height,
      rotation: img.rotation,
      scaleX: img.scaleX,
      scaleY: img.scaleY,
    })),
  };
};
