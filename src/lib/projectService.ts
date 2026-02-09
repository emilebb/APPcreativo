import { supabase } from './supabaseClient';

// Debug environment variables
console.log("SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("ANON length", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length);

// Global guard against double creation
let creating = false;

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
    // Global guard against double creation
    if (creating) {
      // Return a fallback project if already creating
      const fallbackProject: Project = {
        id: Date.now().toString(),
        title: 'Sin título',
        user_id: userId,
        type,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return fallbackProject;
    }
    creating = true;

    try {
      // Check if offline - use localStorage only if truly offline
      if (!navigator.onLine) {
        console.log('Browser is offline - using localStorage fallback');
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
        const newProject: Project = {
          id: Date.now().toString(),
          title: 'Sin título',
          user_id: userId,
          type,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        projects.push(newProject);
        localStorage.setItem('projects', JSON.stringify(projects));
        
        console.log('Project created with localStorage fallback (offline):', newProject);
        return newProject;
      }

      // Try Supabase when online
      if (supabase) {
      try {
        const projectData = {
          id: crypto.randomUUID(),
          title: 'Sin título',
          user_id: userId,
          type,
          status: 'active'
        };

        console.log('Attempting Supabase insert with data:', projectData);
        
        const { error } = await supabase
          .from('projects')
          .insert([projectData]);

        if (error) {
          console.error("Insert failed:", error);
          throw error;
        }
        
        console.log("Insert OK");
        
        // Return the project with the ID we generated
        const createdProject: Project = {
          id: projectData.id,
          title: projectData.title,
          user_id: projectData.user_id,
          type: projectData.type,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        return createdProject;
      } catch (supabaseError) {
        console.log('Supabase failed, using localStorage fallback:', supabaseError);
      }
    }

    // Fallback to localStorage
    console.log('Creating project with localStorage fallback for userId:', userId);
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
    
    console.log('Project created with localStorage fallback:', newProject);
    return newProject;
    } finally {
      creating = false;
    }
  },

  async getProjects(userId: string, limit: number = 5): Promise<Project[]> {
    // Try Supabase first, then fallback to localStorage
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('updated_at', { ascending: false })
          .limit(limit);

        if (!error && data) {
          console.log('Supabase getProjects success:', data);
          return data || [];
        }
        
        console.error("Supabase error for getProjects:", {
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          code: error?.code,
        });
      } catch (supabaseError) {
        console.log('Supabase failed, using localStorage fallback:', supabaseError);
      }
    }

    // Fallback to localStorage
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const userProjects = projects.filter((p: Project) => p.user_id === userId);
    console.log('Projects loaded from localStorage:', userProjects);
    return userProjects;
  }
};

export default projectService;
