/**
 * Hook React para Sistema de Colaboración en Tiempo Real
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/authProvider';
import collaborationService, {
  ProjectShare,
  ProjectComment,
  ProjectTask,
  RealtimeCursor
} from '@/lib/collaborationService';

export function useCollaboration(projectId: string) {
  const { session } = useAuth();
  const [share, setShare] = useState<ProjectShare | null>(null);
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [cursors, setCursors] = useState<RealtimeCursor[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar comentarios
  const loadComments = useCallback(async () => {
    if (!projectId) return;
    const data = await collaborationService.getComments(projectId);
    setComments(data);
  }, [projectId]);

  // Cargar tareas
  const loadTasks = useCallback(async () => {
    if (!projectId) return;
    const data = await collaborationService.getTasks(projectId);
    setTasks(data);
  }, [projectId]);

  // Crear share link
  const createShareLink = useCallback(async (
    permissions?: any,
    clientInfo?: { name?: string; email?: string },
    expiresInDays?: number
  ) => {
    if (!projectId) return null;
    setLoading(true);
    try {
      const newShare = await collaborationService.createShare(
        projectId,
        permissions,
        clientInfo,
        expiresInDays
      );
      if (newShare) {
        setShare(newShare);
      }
      return newShare;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Agregar comentario
  const addComment = useCallback(async (
    content: string,
    pinPosition?: { x: number; y: number },
    shareId?: string
  ) => {
    if (!projectId || !session?.user) return null;

    const comment = await collaborationService.createComment(
      projectId,
      content,
      {
        type: 'owner',
        name: session.user.email || 'Usuario',
        email: session.user.email,
        id: session.user.id
      },
      pinPosition,
      shareId
    );

    if (comment) {
      setComments(prev => [...prev, comment]);
    }

    return comment;
  }, [projectId, session]);

  // Resolver comentario
  const resolveComment = useCallback(async (commentId: string) => {
    const success = await collaborationService.resolveComment(commentId);
    if (success) {
      setComments(prev =>
        prev.map(c =>
          c.id === commentId
            ? { ...c, status: 'resolved' as const, resolved_at: new Date().toISOString() }
            : c
        )
      );
    }
    return success;
  }, []);

  // Crear tarea desde comentario
  const createTaskFromComment = useCallback(async (commentId: string) => {
    const taskId = await collaborationService.createTaskFromComment(commentId);
    if (taskId) {
      await loadTasks();
    }
    return taskId;
  }, [loadTasks]);

  // Actualizar estado de tarea
  const updateTaskStatus = useCallback(async (
    taskId: string,
    status: 'todo' | 'in_progress' | 'review' | 'done'
  ) => {
    const success = await collaborationService.updateTaskStatus(taskId, status);
    if (success) {
      setTasks(prev =>
        prev.map(t =>
          t.id === taskId ? { ...t, status } : t
        )
      );
    }
    return success;
  }, []);

  // Actualizar cursor
  const updateCursor = useCallback((position: { x: number; y: number }) => {
    if (!session?.user) return;
    
    const userColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    
    collaborationService.updateCursor(
      projectId,
      session.user.email || 'Usuario',
      position,
      userColor,
      session.user.id
    );
  }, [projectId, session]);

  // Suscribirse a cambios en tiempo real - DESHABILITADO (sin Supabase)
  useEffect(() => {
    // Sin Supabase - no suscribirse a cambios en tiempo real
    // if (!projectId) return;
    // const unsubscribe = collaborationService.subscribeToProject(projectId, {...});
    // return () => { unsubscribe?.(); };
  }, [projectId]);

  // Cargar datos iniciales - DESHABILITADO (sin Supabase)
  useEffect(() => {
    // Sin Supabase - no cargar datos automáticamente
    // if (projectId) {
    //   loadComments();
    //   loadTasks();
    // }
  }, [projectId, loadComments, loadTasks]);

  return {
    share,
    comments,
    tasks,
    cursors,
    loading,
    createShareLink,
    addComment,
    resolveComment,
    createTaskFromComment,
    updateTaskStatus,
    updateCursor,
    reload: () => {
      loadComments();
      loadTasks();
    }
  };
}
