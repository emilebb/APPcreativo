/**
 * moodboardService - usando Supabase (SQL)
 * Reemplaza localStorage con upsert a moodboard_items
 */

"use client";

import { supabase } from './supabase';

export interface MoodboardItem {
  id: string;
  posicion_x: number;
  posicion_y: number;
  url_imagen: string;
  url: string; // alias para compatibilidad, siempre igual a url_imagen
  proyecto_id: string;
  created_at: string;
  updated_at: string;
}

export interface MoodboardData {
  id: string; // projectId
  title: string;
  description?: string;
  layout?: string;
  images: MoodboardItem[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// Project ID management
let currentProjectId: string | null = null;
let currentUserId: string | null = null;

export function setProjectId(id: string, userId?: string) {
  currentProjectId = id;
  if (userId) currentUserId = userId;
}

export function getProjectId(): string | null {
  return currentProjectId;
}

const moodboardService = {
  async getMoodboard(projectId: string): Promise<MoodboardData | null> {
    try {
      // Obtener proyecto
      const { data: project, error: projectError } = await supabase
        .from('proyectos')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError || !project) {
        console.error('Error fetching project:', projectError);
        return null;
      }

      // Obtener items del moodboard
      const { data: itemsRaw, error: itemsError } = await supabase
        .from('moodboard_items')
        .select('*')
        .eq('proyecto_id', projectId)
        .order('created_at', { ascending: true });
      
      const items = itemsRaw?.map(item => ({
        ...item,
        url: item.url_imagen || '',
      })) as MoodboardItem[];

      if (itemsError) {
        console.error('Error fetching moodboard items:', itemsError);
        return null;
      }

      return {
        id: project.id,
        title: project.nombre,
        description: '', // La tabla proyectos no tiene description, podríamos agregarla
        layout: '',
        images: items || [],
        ownerId: project.user_id,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
      };
    } catch (error) {
      console.error('Unexpected error fetching moodboard:', error);
      return null;
    }
  },

  async getMoodboards(userId: string): Promise<MoodboardData[]> {
    try {
      // Obtener proyectos de tipo moodboard del usuario
      const { data: projects, error: projectsError } = await supabase
        .from('proyectos')
        .select('*')
        .eq('user_id', userId)
        .eq('tipo', 'moodboard');

      if (projectsError || !projects) {
        console.error('Error fetching projects:', projectsError);
        return [];
      }

      const moodboards: MoodboardData[] = [];
      
      for (const project of projects) {
        const { data: items } = await supabase
          .from('moodboard_items')
          .select('*')
          .eq('proyecto_id', project.id);

        moodboards.push({
          id: project.id,
          title: project.nombre,
          description: '',
          layout: '',
          images: items?.map(item => ({ ...item, url: item.url_imagen || '' })) || [],
          ownerId: project.user_id,
          createdAt: project.created_at,
          updatedAt: project.updated_at,
        });
      }

      return moodboards;
    } catch (error) {
      console.error('Unexpected error fetching moodboards:', error);
      return [];
    }
  },

  async createMoodboard(data: Omit<MoodboardData, "id" | "createdAt" | "updatedAt">): Promise<MoodboardData> {
    try {
      // Crear proyecto
      const { data: project, error: projectError } = await supabase
        .from('proyectos')
        .insert({
          nombre: data.title,
          tipo: 'moodboard',
          user_id: data.ownerId,
        })
        .select()
        .single();

      if (projectError || !project) {
        throw new Error(`Error creating project: ${projectError?.message}`);
      }

      // Insertar items si los hay
      const itemsToInsert = data.images.map((img: any) => ({
        posicion_x: img.posicion_x || img.x || 0,
        posicion_y: img.posicion_y || img.y || 0,
        url_imagen: img.url_imagen || img.url || img.src || '',
        proyecto_id: project.id,
      }));

      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabase
          .from('moodboard_items')
          .insert(itemsToInsert);

        if (itemsError) {
          console.error('Error inserting moodboard items:', itemsError);
        }
      }

      // Obtener items insertados
      const { data: items } = await supabase
        .from('moodboard_items')
        .select('*')
        .eq('proyecto_id', project.id);

      return {
        id: project.id,
        title: project.nombre,
        description: data.description,
        layout: data.layout,
        images: items?.map(item => ({ ...item, url: item.url_imagen || '' })) || [],
        ownerId: project.user_id,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
      };
    } catch (error) {
      console.error('Unexpected error creating moodboard:', error);
      // Fallback: crear moodboard mock
      return {
        id: `mood-${Date.now()}`,
        title: data.title,
        description: data.description,
        layout: data.layout,
        images: data.images,
        ownerId: data.ownerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  async updateMoodboard(moodboardId: string, updates: Partial<MoodboardData>): Promise<MoodboardData | null> {
    try {
      // Actualizar proyecto
      if (updates.title) {
        await supabase
          .from('proyectos')
          .update({ nombre: updates.title })
          .eq('id', moodboardId);
      }

      // Si hay nuevas imágenes, hacer upsert
      if (updates.images) {
        // Eliminar items existentes y reemplazar
        await supabase
          .from('moodboard_items')
          .delete()
          .eq('proyecto_id', moodboardId);

        const itemsToInsert = updates.images.map((img: any) => ({
          posicion_x: img.posicion_x || img.x || 0,
          posicion_y: img.posicion_y || img.y || 0,
          url_imagen: img.url_imagen || img.url || img.src || '',
          proyecto_id: moodboardId,
        }));

        if (itemsToInsert.length > 0) {
          await supabase
            .from('moodboard_items')
            .insert(itemsToInsert);
        }
      }

      // Obtener moodboard actualizado
      return await this.getMoodboard(moodboardId);
    } catch (error) {
      console.error('Unexpected error updating moodboard:', error);
      return null;
    }
  },

  async deleteMoodboard(moodboardId: string): Promise<boolean> {
    try {
      // Los items se eliminarán en cascade por la foreign key
      const { error } = await supabase
        .from('proyectos')
        .delete()
        .eq('id', moodboardId);

      if (error) {
        console.error('Error deleting moodboard:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error deleting moodboard:', error);
      return false;
    }
  },

  // Función para upsert de un item individual (para cuando se mueve un elemento)
  async upsertItem(
    projectId: string,
    imageUrl: string,
    x: number,
    y: number,
    itemId?: string
  ): Promise<MoodboardItem | null> {
    try {
      if (itemId) {
        // Actualizar item existente
        const { data, error } = await supabase
          .from('moodboard_items')
          .update({
            posicion_x: x,
            posicion_y: y,
            url_imagen: imageUrl,
          })
          .eq('id', itemId)
          .eq('proyecto_id', projectId)
          .select()
          .single();

        if (error) {
          console.error('Error updating moodboard item:', error);
          return null;
        }
        return data as MoodboardItem;
      } else {
        // Insertar nuevo item
        const { data, error } = await supabase
          .from('moodboard_items')
          .insert({
            proyecto_id: projectId,
            url_imagen: imageUrl,
            posicion_x: x,
            posicion_y: y,
          })
          .select()
          .single();

        if (error) {
          console.error('Error inserting moodboard item:', error);
          return null;
        }
        return data as MoodboardItem;
      }
    } catch (error) {
      console.error('Unexpected error upserting moodboard item:', error);
      return null;
    }
  },
};

export default moodboardService;