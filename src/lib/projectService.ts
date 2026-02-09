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

// Project Services
export const projectService = {
  async createProject(userId: string, type: Project['type'] = 'canvas'): Promise<Project> {
    if (!supabase) throw new Error('Supabase not available');
    
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
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
};

export default projectService;
