'use client';

import React from 'react';
import { useCanvasStore, Tool } from '@/store/useCanvasStore';
import { 
  MousePointer2, 
  Pencil, 
  Square, 
  Circle as CircleIcon, 
  Type 
} from 'lucide-react';

// ============================================================================
// CONFIGURACIÓN DE HERRAMIENTAS
// ============================================================================

const TOOLS: { id: Tool; label: string; icon: React.ReactNode; key: string }[] = [
  { id: 'select', label: 'Seleccionar', icon: <MousePointer2 size={20} />, key: 'V' },
  { id: 'pen', label: 'Lápiz', icon: <Pencil size={20} />, key: 'P' },
  { id: 'rect', label: 'Rectángulo', icon: <Square size={20} />, key: 'R' },
  { id: 'circle', label: 'Círculo', icon: <CircleIcon size={20} />, key: 'O' },
  { id: 'text', label: 'Texto', icon: <Type size={20} />, key: 'T' },
];

// ============================================================================
// COLORES
// ============================================================================

const COLORS = [
  { id: 'black', color: '#000000' },
  { id: 'red', color: '#ef4444' },
  { id: 'green', color: '#22c55e' },
  { id: 'blue', color: '#3b82f6' },
  { id: 'orange', color: '#f97316' },
  { id: 'purple', color: '#8b5cf6' },
];

// ============================================================================
// TOOLBAR
// ============================================================================

export default function Toolbar() {
  const tool = useCanvasStore((s) => s.tool);
  const setTool = useCanvasStore((s) => s.setTool);

  return (
    <div className="flex items-center gap-2">
      {TOOLS.map((t) => {
        const isActive = tool === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg transition-all
              ${isActive 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300'
              }
            `}
            title={`${t.label} (${t.key})`}
          >
            {t.icon}
            <span className="hidden sm:inline text-sm font-medium">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Exportar herramientas y colores para usar en otros componentes
export { TOOLS, COLORS };
