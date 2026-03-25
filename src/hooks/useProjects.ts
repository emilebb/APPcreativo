"use client";

import { useState, useEffect, useCallback } from 'react';
import { projectServiceSupabase } from '@/lib/projectServiceSupabase';
import { Project } from '@/lib/projectService';

export const useProjects = (userId: string) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar proyectos iniciales
  const loadProjects = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await projectServiceSupabase.getProjects(userId);
      setProjects(data);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('No se pudieron cargar los proyectos');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Crear proyecto con refresco optimista
  const createProject = useCallback(async (type: Project['type'], data?: Partial<Project>) => {
    if (!userId) throw new Error('Usuario no autenticado');
    
    try {
      const newProject = await projectServiceSupabase.createProject(userId, type, data);
      
      // Refresco optimista: añadir al estado local inmediatamente
      setProjects(prev => [newProject, ...prev]);
      
      return newProject;
    } catch (err) {
      console.error('Error creating project:', err);
      setError('No se pudo crear el proyecto');
      throw err;
    }
  }, [userId]);

  // Actualizar proyecto con refresco optimista
  const updateProject = useCallback(async (projectId: string, updates: Partial<Project>) => {
    try {
      // Refresco optimista: actualizar en estado local primero
      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, ...updates, updated_at: new Date().toISOString() }
          : p
      ));

      const updatedProject = await projectServiceSupabase.updateProject(projectId, updates);
      
      if (updatedProject) {
        // Actualizar con los datos reales de Supabase
        setProjects(prev => prev.map(p => 
          p.id === projectId ? updatedProject : p
        ));
      }
      
      return updatedProject;
    } catch (err) {
      console.error('Error updating project:', err);
      setError('No se pudo actualizar el proyecto');
      
      // Si hay error, recargar para restaurar el estado correcto
      loadProjects();
      throw err;
    }
  }, [loadProjects]);

  // Eliminar proyecto con refresco optimista
  const deleteProject = useCallback(async (projectId: string) => {
    // Guardar el estado original por si hay error
    const originalProjects = [...projects];
    
    try {
      // Refresco optimista: eliminar del estado local primero
      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      await projectServiceSupabase.deleteProject(projectId);
      
      console.log('Proyecto eliminado correctamente');
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('No se pudo eliminar el proyecto');
      
      // Si hay error, restaurar el estado original
      setProjects(originalProjects);
      throw err;
    }
  }, [projects]);

  // Búsqueda derivada (no modifica el estado original)
  const searchProjects = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return projects;
    
    return projects.filter(project =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects]);

  // Efecto para cargar proyectos y suscribirse a cambios
  useEffect(() => {
    if (!userId) return;

    loadProjects();

    // Suscribirse a cambios en tiempo real
    const unsubscribe = projectServiceSupabase.subscribeToProjects(userId, (updatedProjects) => {
      setProjects(updatedProjects);
    });

    return () => {
      unsubscribe();
    };
  }, [userId, loadProjects]);

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    searchProjects,
    refetch: loadProjects
  };
};
