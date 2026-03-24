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
  images: MoodboardImage[];
  selectedId: string | null;
  isDirty: boolean;
  stageScale: number;
  stagePosition: { x: number; y: number };

  // Actions
  setImages: (images: MoodboardImage[]) => void;
  addImage: (image: Omit<MoodboardImage, "id">) => string;
  updateImage: (id: string, updates: Partial<MoodboardImage>) => void;
  deleteImage: (id: string) => void;
  deleteSelected: () => void;
  setSelected: (id: string | null) => void;
  clearSelection: () => void;
  setStageScale: (scale: number) => void;
  setStagePosition: (position: { x: number; y: number }) => void;
  bringToFront: (id: string) => void;
  markClean: () => void;
  loadMoodboard: (data: { images: MoodboardImage[] }) => void;
}

const generateId = () => `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useMoodboardStore = create<MoodboardState>((set, get) => ({
  images: [],
  selectedId: null,
  isDirty: false,
  stageScale: 1,
  stagePosition: { x: 0, y: 0 },

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
    const { selectedId } = get();
    if (selectedId) {
      get().deleteImage(selectedId);
    }
  },

  setSelected: (id) => set({ selectedId: id }),

  clearSelection: () => set({ selectedId: null }),

  setStageScale: (scale) => set({ stageScale: scale }),

  setStagePosition: (position) => set({ stagePosition: position }),

  bringToFront: (id) => {
    set((state) => {
      const maxZIndex = state.images.length;
      return {
        images: state.images.map((img) =>
          img.id === id ? { ...img, scaleX: img.scaleX || 1, scaleY: img.scaleY || 1 } : img
        ),
        isDirty: true,
      };
    });
  },

  markClean: () => set({ isDirty: false }),

  loadMoodboard: (data) => {
    set({
      images: data.images || [],
      selectedId: null,
      isDirty: false,
    });
  },
}));

// Selector para serializar estado (para guardar)
export const useSerializeMoodboard = () => {
  const images = useMoodboardStore((s) => s.images);
  return {
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
