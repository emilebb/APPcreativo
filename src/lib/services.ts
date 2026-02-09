import { supabase } from './supabaseClient';

export interface Project {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  type: 'moodboard' | 'mindmap' | 'canvas' | 'chat';
  created_at: string;
  updated_at: string;
  status: 'active' | 'archived';
}

export interface Asset {
  id: string;
  project_id: string;
  type: 'image' | 'text' | 'drawing';
  url?: string;
  content?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface MindMap {
  id: string;
  project_id: string;
  nodes: any[];
  connections: any[];
  created_at: string;
  updated_at: string;
}

export interface Canvas {
  id: string;
  project_id: string;
  elements: any[];
  created_at: string;
  updated_at: string;
}

// Project Services
export const projectService = {
  async createProject(userId: string, type: Project['type'] = 'canvas'): Promise<Project> {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        title: 'Sin título',
        user_id: userId,
        type,
        status: 'active'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getProjects(userId: string, limit: number = 5): Promise<Project[]> {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProject(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Asset Services
export const assetService = {
  async getAssetsByProject(projectId: string): Promise<Asset[]> {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async uploadAsset(projectId: string, file: File, metadata?: any): Promise<Asset> {
    // Upload file to storage
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('assets')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('assets')
      .getPublicUrl(fileName);

    // Create asset record
    const { data, error } = await supabase
      .from('assets')
      .insert([{
        project_id: projectId,
        type: 'image',
        url: urlData.publicUrl,
        metadata
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAsset(id: string): Promise<void> {
    const { data: asset } = await supabase
      .from('assets')
      .select('url')
      .eq('id', id)
      .single();

    // Delete from storage if it's a file
    if (asset?.url) {
      const fileName = asset.url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('assets')
          .remove([fileName]);
      }
    }

    // Delete record
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// MindMap Services
export const mindMapService = {
  async getMindMapByProject(projectId: string): Promise<MindMap | null> {
    const { data, error } = await supabase
      .from('mindmaps')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async saveMindMap(projectId: string, nodes: any[], connections: any[]): Promise<MindMap> {
    const { data, error } = await supabase
      .from('mindmaps')
      .upsert({
        project_id: projectId,
        nodes,
        connections,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Canvas Services
export const canvasService = {
  async getCanvasByProject(projectId: string): Promise<Canvas | null> {
    const { data, error } = await supabase
      .from('canvases')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async saveCanvas(projectId: string, elements: any[]): Promise<Canvas> {
    const { data, error } = await supabase
      .from('canvases')
      .upsert({
        project_id: projectId,
        elements,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Profile Services
export const profileService = {
  async updateProfile(userId: string, updates: any): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
  },

  async getProfile(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
};
