import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================================
// TIPOS SIMPLIFICADOS
// ============================================================================

export type Tool = 'select' | 'pan' | 'pencil' | 'eraser' | 'rect' | 'circle' | 'line' | 'text' | 'image';

export interface CanvasElement {
  id: string;
  type: 'image' | 'text' | 'rect' | 'circle' | 'line' | 'freeform';
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  zIndex: number;
  
  // Estilos
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  
  // Para imágenes
  src?: string;
  
  // Para texto
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  
  // Para líneas y freeform
  points?: number[];
  
  // Para círculos
  radius?: number;
}

export interface StyleConfig {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  fontSize: number;
  fontFamily: string;
}

export interface Project {
  id: string;
  title: string;
  type: 'canvas' | 'moodboard' | 'mindmap';
  userId: string;
  elements: CanvasElement[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// STORE
// ============================================================================

interface CanvasState {
  elements: CanvasElement[];
  selectedIds: string[];
  currentTool: Tool;
  style: StyleConfig;
  stageX: number;
  stageY: number;
  stageScale: number;
  past: CanvasElement[][];
  future: CanvasElement[][];
  currentProject: Project | null;
  isDirty: boolean;
  lastSaved: string | null;
  projectId: string | null;
  userId: string | null;
  isDrawing: boolean;
  currentPath: number[];

  // Elementos
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  deleteSelected: () => void;
  setElements: (elements: CanvasElement[]) => void;

  // Selección
  select: (id: string, addToSelection?: boolean) => void;
  selectMultiple: (ids: string[]) => void;
  clearSelection: () => void;

  // Herramientas
  setTool: (tool: Tool) => void;
  setStyle: (style: Partial<StyleConfig>) => void;
  setIsDrawing: (drawing: boolean) => void;
  setCurrentPath: (points: number[]) => void;
  addToCurrentPath: (x: number, y: number) => void;

  // Viewport
  setViewport: (x: number, y: number, scale: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;

  // Historial
  pushToHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Proyecto
  setProject: (project: Project | null) => void;
  setProjectId: (id: string | null) => void;
  setUserId: (id: string | null) => void;
  markDirty: () => void;
  markSaved: () => void;
  clearCanvas: () => void;

  // Capas
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      elements: [],
      selectedIds: [],
      currentTool: 'select',
      style: {
        strokeColor: '#000000',
        fillColor: 'transparent',
        strokeWidth: 2,
        fontSize: 16,
        fontFamily: 'Inter',
      },
      stageX: 0,
      stageY: 0,
      stageScale: 1,
      past: [],
      future: [],
      currentProject: null,
      isDirty: false,
      lastSaved: null,
      projectId: null,
      userId: null,
      isDrawing: false,
      currentPath: [],

      // ==========================================================================
      // ELEMENTOS
      // ==========================================================================

      addElement: (element) => {
        const state = get();
        const newPast = [...state.past, state.elements].slice(-50);
        set({
          elements: [...state.elements, element],
          past: newPast,
          future: [],
          isDirty: true,
        });
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
        const state = get();
        const newPast = [...state.past, state.elements].slice(-50);
        set({
          elements: state.elements.filter((el) => el.id !== id),
          selectedIds: state.selectedIds.filter((sid) => sid !== id),
          past: newPast,
          future: [],
          isDirty: true,
        });
      },

      deleteSelected: () => {
        const state = get();
        if (state.selectedIds.length === 0) return;
        
        const newPast = [...state.past, state.elements].slice(-50);
        set({
          elements: state.elements.filter((el) => !state.selectedIds.includes(el.id)),
          selectedIds: [],
          past: newPast,
          future: [],
          isDirty: true,
        });
      },

      setElements: (elements) => set({ elements, isDirty: true }),

      // ==========================================================================
      // SELECCIÓN
      // ==========================================================================

      select: (id, addToSelection = false) => {
        set((state) => {
          if (addToSelection) {
            const isSelected = state.selectedIds.includes(id);
            return {
              selectedIds: isSelected
                ? state.selectedIds.filter((sid) => sid !== id)
                : [...state.selectedIds, id],
            };
          }
          return { selectedIds: [id] };
        });
      },

      selectMultiple: (ids) => set({ selectedIds: ids }),
      clearSelection: () => set({ selectedIds: [] }),

      // ==========================================================================
      // HERRAMIENTAS
      // ==========================================================================

      setTool: (tool) => set({ currentTool: tool, selectedIds: [] }),
      setStyle: (style) => set((state) => ({ style: { ...state.style, ...style } })),
      
      setIsDrawing: (drawing) => set({ isDrawing: drawing }),
      setCurrentPath: (points) => set({ currentPath: points }),
      addToCurrentPath: (x, y) => set((state) => ({ currentPath: [...state.currentPath, x, y] })),

      // ==========================================================================
      // VIEWPORT
      // ==========================================================================

      setViewport: (x, y, scale) => set({ stageX: x, stageY: y, stageScale: scale }),
      zoomIn: () => set((state) => ({ stageScale: Math.min(state.stageScale * 1.2, 5) })),
      zoomOut: () => set((state) => ({ stageScale: Math.max(state.stageScale / 1.2, 0.1) })),
      resetZoom: () => set({ stageScale: 1, stageX: 0, stageY: 0 }),

      // ==========================================================================
      // HISTORIAL
      // ==========================================================================

      pushToHistory: () => {
        set((state) => ({
          past: [...state.past, state.elements].slice(-50),
          future: [],
        }));
      },

      undo: () => {
        const state = get();
        if (state.past.length === 0) return;
        
        const previous = state.past[state.past.length - 1];
        const newPast = state.past.slice(0, -1);
        
        set({
          elements: previous,
          past: newPast,
          future: [state.elements, ...state.future].slice(0, 50),
          selectedIds: [],
          isDirty: true,
        });
      },

      redo: () => {
        const state = get();
        if (state.future.length === 0) return;
        
        const next = state.future[0];
        const newFuture = state.future.slice(1);
        
        set({
          elements: next,
          past: [...state.past, state.elements].slice(-50),
          future: newFuture,
          selectedIds: [],
          isDirty: true,
        });
      },

      canUndo: () => get().past.length > 0,
      canRedo: () => get().future.length > 0,

      // ==========================================================================
      // PROYECTO
      // ==========================================================================

      setProject: (project) => {
        set({
          currentProject: project,
          elements: project?.elements || [],
          selectedIds: [],
          past: [],
          future: [],
          isDirty: false,
          projectId: project?.id || null,
        });
      },

      setProjectId: (id) => set({ projectId: id }),
      setUserId: (id) => set({ userId: id }),
      markDirty: () => set({ isDirty: true }),
      markSaved: () => set({ isDirty: false, lastSaved: new Date().toISOString() }),
      clearCanvas: () => {
        const state = get();
        set({
          elements: [],
          selectedIds: [],
          past: [...state.past, state.elements].slice(-50),
          future: [],
          isDirty: true,
        });
      },

      // ==========================================================================
      // CAPAS
      // ==========================================================================

      bringToFront: (id) => {
        set((state) => {
          const maxZ = Math.max(...state.elements.map((el) => el.zIndex), 0);
          return {
            elements: state.elements.map((el) =>
              el.id === id ? { ...el, zIndex: maxZ + 1 } : el
            ),
            isDirty: true,
          };
        });
      },

      sendToBack: (id) => {
        set((state) => {
          const minZ = Math.min(...state.elements.map((el) => el.zIndex), 0);
          return {
            elements: state.elements.map((el) =>
              el.id === id ? { ...el, zIndex: minZ - 1 } : el
            ),
            isDirty: true,
          };
        });
      },
    }),
    {
      name: 'canvas-storage',
      partialize: (state) => ({
        elements: state.elements,
        currentProject: state.currentProject,
        projectId: state.projectId,
      }),
    }
  )
);

// ============================================================================
// HELPERS
// ============================================================================

let elementIdCounter = 0;
export const generateId = (prefix: string = 'el') => {
  elementIdCounter += 1;
  return `${prefix}_${Date.now()}_${elementIdCounter}`;
};

// ============================================================================
// SELECTORS (optimizados para re-renders)
// ============================================================================

export const useSelectedElements = () => {
  const elements = useCanvasStore((s) => s.elements);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  return elements.filter((el) => selectedIds.includes(el.id));
};

export const useSelectedIds = () => useCanvasStore((s) => s.selectedIds);
export const useCurrentTool = () => useCanvasStore((s) => s.currentTool);
export const useStyle = () => useCanvasStore((s) => s.style);
export const useViewport = () => useCanvasStore((s) => ({
  x: s.stageX,
  y: s.stageY,
  scale: s.stageScale,
}));
