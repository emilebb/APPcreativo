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
    // Force localStorage only - no Supabase connection
    console.log('Creating project with localStorage only');
    
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const newProject: Project = {
      id: Date.now().toString(),
      title: 'Sin título',
      user_id: userId,
      type,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    projects.push(newProject);
    localStorage.setItem('projects', JSON.stringify(projects));
    
    console.log('Project created successfully with localStorage:', newProject);
    console.log('Project data being sent to Supabase:', {
      title: 'Sin título',
      user_id: userId,
      type: type,
      status: 'active'
    });
    
    return newProject;
  },

  async getProjects(userId: string, limit: number = 5): Promise<Project[]> {
    // Force localStorage only - no Supabase connection
    console.log('Loading projects from localStorage only');
    
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const userProjects = projects.filter((p: Project) => p.user_id === userId);
    console.log('Projects loaded from localStorage:', userProjects);
    return userProjects;
  },

  // Try to create project in Supabase for debugging
  async createProjectInSupabase(userId: string, type: Project['type'] = 'canvas'): Promise<Project> {
    if (!supabase) {
      console.log('Supabase client not available');
      throw new Error('Supabase not available');
    }

    const projectData = {
      title: 'Sin título',
      user_id: userId,
      type,
      status: 'active'
    };

    console.log('Sending to Supabase:', projectData);
    console.log('Supabase client available:', !!supabase);
    console.log('User ID:', userId);

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Supabase success:', data);
      return data;
    } catch (err) {
      console.error('Unexpected error:', err);
      throw err;
    }
  }
};

export default projectService;
