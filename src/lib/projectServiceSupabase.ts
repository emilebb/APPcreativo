/**
 * projectService para Supabase - Con refresco optimista
 * Gestión de proyectos con sincronización en tiempo real
 */

import { supabase } from './supabase';
import { Project } from './projectService';

export const projectServiceSupabase = {
  /**
   * Obtener proyectos del usuario con manejo de errores robusto
   */
  async getProjects(userId: string, limit?: number): Promise<Project[]> {
    try {
      let query = supabase
        .from('proyectos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching projects:', error);
        throw new Error('No se pudieron cargar los proyectos');
      }

      // Mapear datos de Supabase a formato Project
      return data.map(project => ({
        id: project.id,
        title: project.nombre,
        type: project.tipo || 'mindmap',
        ownerId: project.user_id,
        user_id: project.user_id,
        status: project.estado || 'active',
        created_at: project.created_at,
        updated_at: project.updated_at,
        data: project.data
      }));
    } catch (error) {
      console.error('Error in getProjects:', error);
      throw error;
    }
  },

  /**
   * Obtener un proyecto específico
   */
  async getProject(projectId: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('proyectos')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No encontrado
          return null;
        }
        console.error('Error fetching project:', error);
        throw new Error('No se pudo cargar el proyecto');
      }

      return {
        id: data.id,
        title: data.nombre,
        type: data.tipo || 'mindmap',
        ownerId: data.user_id,
        user_id: data.user_id,
        status: data.estado || 'active',
        created_at: data.created_at,
        updated_at: data.updated_at,
        data: data.data
      };
    } catch (error) {
      console.error('Error in getProject:', error);
      throw error;
    }
  },

  /**
   * Crear nuevo proyecto con refresco optimista
   */
  async createProject(userId: string, type: Project["type"], data?: Partial<Project>): Promise<Project> {
    try {
      const newProject = {
        nombre: data?.title || `Nuevo ${type}`,
        tipo: type,
        user_id: userId,
        estado: 'active',
        descripcion: data?.title || '', // Usar title como description
        data: data?.data || null
      };

      const { data: result, error } = await supabase
        .from('proyectos')
        .insert(newProject)
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        throw new Error('No se pudo crear el proyecto');
      }

      return {
        id: result.id,
        title: result.nombre,
        type: result.tipo || 'mindmap',
        ownerId: result.user_id,
        user_id: result.user_id,
        status: result.estado || 'active',
        created_at: result.created_at,
        updated_at: result.updated_at,
        data: result.data
      };
    } catch (error) {
      console.error('Error in createProject:', error);
      throw error;
    }
  },

  /**
   * Actualizar proyecto
   */
  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.title) updateData.nombre = updates.title;
      if (updates.type) updateData.tipo = updates.type;
      if (updates.status) updateData.estado = updates.status;
      if (updates.data) updateData.data = updates.data;

      const { data, error } = await supabase
        .from('proyectos')
        .update(updateData)
        .eq('id', projectId)
        .select()
        .single();

      if (error) {
        console.error('Error updating project:', error);
        throw new Error('No se pudo actualizar el proyecto');
      }

      return {
        id: data.id,
        title: data.nombre,
        type: data.tipo || 'mindmap',
        ownerId: data.user_id,
        user_id: data.user_id,
        status: data.estado || 'active',
        created_at: data.created_at,
        updated_at: data.updated_at,
        data: data.data
      };
    } catch (error) {
      console.error('Error in updateProject:', error);
      throw error;
    }
  },

  /**
   * Actualizar título del proyecto
   */
  async updateProjectTitle(projectId: string, title: string): Promise<Project | null> {
    return this.updateProject(projectId, { title });
  },

  /**
   * Eliminar proyecto con refresco optimista
   */
  async deleteProject(projectId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('proyectos')
        .delete()
        .eq('id', projectId);

      if (error) {
        console.error('Error deleting project:', error);
        throw new Error('No se pudo eliminar el proyecto');
      }

      return true;
    } catch (error) {
      console.error('Error in deleteProject:', error);
      throw error;
    }
  },

  /**
   * Suscribirse a cambios en tiempo real de los proyectos de un usuario
   */
  subscribeToProjects(userId: string, callback: (projects: Project[]) => void) {
    const subscription = supabase
      .channel(`projects_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Escuchar todos los eventos (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'proyectos',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          console.log('Project change detected:', payload);
          
          // Refrescar la lista completa cuando haya cambios
          try {
            const updatedProjects = await this.getProjects(userId);
            callback(updatedProjects);
          } catch (error) {
            console.error('Error refreshing projects after change:', error);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
};

export default projectServiceSupabase;
