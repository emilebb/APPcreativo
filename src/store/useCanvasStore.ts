import { create } from 'zustand';

// ============================================================================
// TIPOS
// ============================================================================

export type Tool = 'select' | 'pen' | 'rect' | 'circle' | 'text';

export interface CanvasElement {
  id: string;
  type: 'rect' | 'circle' | 'line' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: number[];
  text?: string;
  fontSize?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

// ============================================================================
// STORE
// ============================================================================

interface CanvasState {
  // Estado
  tool: Tool;
  elements: CanvasElement[];
  selectedId: string | null;
  isDirty: boolean;
  
  // Acciones
  setTool: (tool: Tool) => void;
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  setElements: (elements: CanvasElement[]) => void;
  markDirty: () => void;
  markClean: () => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  // Estado inicial
  tool: 'select',
  elements: [],
  selectedId: null,
  isDirty: false,

  // Acciones
  setTool: (tool) => set({ tool }),

  addElement: (element) => {
    set((state) => ({
      elements: [...state.elements, element],
      isDirty: true,
    }));
  },

  updateElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
      isDirty: true,
    }));
  },

  deleteElement: (id) => {
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
      isDirty: true,
    }));
  },

  selectElement: (id) => set({ selectedId: id }),

  setElements: (elements) => set({ elements }),

  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),
}));

// ============================================================================
// HELPERS
// ============================================================================

export const generateId = () => `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
