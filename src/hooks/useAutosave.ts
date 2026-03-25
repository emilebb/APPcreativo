"use client";

import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

// Implementación manual de debounce para evitar dependencias externas
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): {
  (...args: Parameters<T>): void;
  cancel: () => void;
} {
  let timeout: NodeJS.Timeout | null = null;
  
  const debounced = (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

export type SaveStatus = 'saved' | 'saving' | 'error' | 'idle';

interface AutosaveOptions {
  debounceMs?: number;
  tableName?: string;
  onSaveComplete?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useAutosave = (
  projectId: string,
  options: AutosaveOptions = {}
) => {
  const {
    debounceMs = 1000,
    tableName = 'projects',
    onSaveComplete,
    onError
  } = options;

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const pendingSaveRef = useRef<NodeJS.Timeout | null>(null);

  // FUNCIÓN DE GUARDADO (La que va a Supabase)
  const saveToSupabase = useCallback(
    debounce(async (updatedData: any) => {
      // Cancelar cualquier guardado pendiente anterior
      if (pendingSaveRef.current) {
        clearTimeout(pendingSaveRef.current);
      }

      setSaveStatus('saving');
      
      try {
        const { data, error } = await supabase
          .from(tableName)
          .update({ 
            content: updatedData, 
            last_updated: new Date().toISOString() 
          })
          .eq('id', projectId)
          .select()
          .single();

        if (error) {
          console.error("Error al guardar:", error.message);
          setSaveStatus('error');
          onError?.(new Error(error.message));
          return;
        }

        setSaveStatus('saved');
        setLastSavedAt(new Date());
        onSaveComplete?.(data);

        // Después de 2 segundos, volver a estado idle
        pendingSaveRef.current = setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);

      } catch (err) {
        console.error("Error inesperado al guardar:", err);
        setSaveStatus('error');
        onError?.(err as Error);
      }
    }, debounceMs),
    [projectId, tableName, debounceMs, onSaveComplete, onError]
  );

  // Guardado inmediato (para acciones importantes)
  const saveImmediately = useCallback(async (updatedData: any) => {
    // Cancelar cualquier debounce pendiente
    saveToSupabase.cancel();
    
    setSaveStatus('saving');
    
    try {
      const { data, error } = await supabase
        .from(tableName)
        .update({ 
          content: updatedData, 
          last_updated: new Date().toISOString() 
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) {
        console.error("Error al guardar inmediatamente:", error.message);
        setSaveStatus('error');
        onError?.(new Error(error.message));
        return;
      }

      setSaveStatus('saved');
      setLastSavedAt(new Date());
      onSaveComplete?.(data);

      // Después de 2 segundos, volver a estado idle
      if (pendingSaveRef.current) {
        clearTimeout(pendingSaveRef.current);
      }
      pendingSaveRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);

    } catch (err) {
      console.error("Error inesperado al guardar inmediatamente:", err);
      setSaveStatus('error');
      onError?.(err as Error);
    }
  }, [projectId, tableName, onSaveComplete, onError, saveToSupabase]);

  // Limpiar timeouts al desmontar
  const cancelPendingSaves = useCallback(() => {
    saveToSupabase.cancel();
    if (pendingSaveRef.current) {
      clearTimeout(pendingSaveRef.current);
    }
  }, [saveToSupabase]);

  return { 
    saveToSupabase, 
    saveImmediately,
    saveStatus, 
    lastSavedAt,
    cancelPendingSaves
  };
};
