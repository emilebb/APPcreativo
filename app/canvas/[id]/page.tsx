'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CanvasBoard from '@/components/canvas/CanvasBoard';
import { useCanvasStore } from '@/stores/canvasStore';
import projectService from '@/lib/projectServiceNew';
import { ArrowLeft, Save, FolderOpen } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CanvasPage({ params }: PageProps) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('Sin título');

  const {
    elements,
    isDirty,
    setProject,
    setProjectId: setStoreProjectId,
    markSaved,
    markDirty,
  } = useCanvasStore();

  // Cargar parámetros
  useEffect(() => {
    params.then((p) => {
      setProjectId(p.id);
      if (p.id !== 'new') {
        loadProject(p.id);
      } else {
        setLoading(false);
      }
    });
  }, [params]);

  // Cargar proyecto
  const loadProject = async (id: string) => {
    try {
      const project = await projectService.getProject(id);
      if (project) {
        setProject(project);
        setTitle(project.title);
        setStoreProjectId(project.id);
      }
    } catch (error) {
      console.error('Error cargando proyecto:', error);
    } finally {
      setLoading(false);
    }
  };

  // Guardar proyecto
  const handleSave = useCallback(async () => {
    if (!projectId || projectId === 'new') {
      // Crear nuevo proyecto
      setSaving(true);
      try {
        const userId = 'anonymous';
        const newProject = await projectService.createProject(userId, 'canvas', title);
        await projectService.updateProjectElements(newProject.id, elements);
        markSaved();
        setStoreProjectId(newProject.id);
        router.replace(`/canvas/${newProject.id}`);
      } catch (error) {
        console.error('Error creando proyecto:', error);
      } finally {
        setSaving(false);
      }
    } else {
      setSaving(true);
      try {
        await projectService.updateProjectElements(projectId, elements);
        await projectService.updateProjectTitle(projectId, title);
        markSaved();
      } catch (error) {
        console.error('Error guardando proyecto:', error);
      } finally {
        setSaving(false);
      }
    }
  }, [projectId, elements, title, router, setStoreProjectId, markSaved]);

  // Auto-guardado
  useEffect(() => {
    if (isDirty && projectId && projectId !== 'new') {
      const timeout = setTimeout(handleSave, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isDirty, projectId, elements]);

  // Atajo Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-100 dark:bg-neutral-900">
      {/* Header */}
      <header className="flex-shrink-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </Link>
            
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                markDirty();
              }}
              className="text-lg font-semibold bg-transparent border-none outline-none text-neutral-900 dark:text-white placeholder-neutral-400"
              placeholder="Nombre del proyecto"
            />

            {saving && <span className="text-sm text-blue-500">Guardando...</span>}
            {isDirty && !saving && <span className="text-sm text-amber-500">Sin guardar</span>}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/canvas/new"
              className="flex items-center gap-2 px-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition"
            >
              <FolderOpen className="w-4 h-4" />
              Nuevo
            </Link>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </header>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <CanvasBoard onSave={handleSave} />
      </div>
    </div>
  );
}
