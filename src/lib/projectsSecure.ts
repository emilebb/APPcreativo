import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export interface ProjectData {
  id: string;
  nombre: string;
  tipo: string;
  user_id: string;
  estado: string;
  descripcion?: string;
  data?: any;
  created_at: string;
  updated_at: string;
}

export const createSecureProject = async (
  userId: string, 
  name: string, 
  type: 'moodboard' | 'mindmap' | 'canvas' = 'moodboard'
): Promise<{ data: ProjectData | null; error: any }> => {
  try {
    // Validación previa
    if (!userId) {
      throw new Error("Se requiere ID de usuario");
    }

    if (!name || name.trim() === '') {
      throw new Error("Se requiere nombre del proyecto");
    }

    // Preparar datos con estructura correcta
    const projectData = {
      nombre: name.trim() || `Nuevo ${type}`,
      tipo: type,
      user_id: userId,
      estado: 'active',
      descripcion: '',
      data: null
    };

    console.log('Creating project:', projectData);

    const { data, error } = await supabase
      .from('proyectos')
      .insert([projectData])
      .select() // IMPORTANTE: Para obtener el ID generado
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data || !data.id) {
      throw new Error("No se pudo obtener el ID del proyecto creado");
    }

    console.log('Project created successfully:', data);
    return { data, error: null };

  } catch (err) {
    console.error('Error creating project:', err);
    return { data: null, error: err };
  }
};

export const getSecureProjects = async (userId: string): Promise<{ data: ProjectData[] | null; error: any }> => {
  try {
    if (!userId) {
      throw new Error("Se requiere ID de usuario");
    }

    const { data, error } = await supabase
      .from('proyectos')
      .select('*')
      .eq('user_id', userId)
      .eq('estado', 'active')
      .not('nombre', 'is', null) // Filtra nulos
      .neq('nombre', '')         // Filtra vacíos
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data || [], error: null };

  } catch (err) {
    console.error('Error fetching projects:', err);
    return { data: null, error: err };
  }
};

export const deleteSecureProject = async (projectId: string, userId: string): Promise<{ error: any }> => {
  try {
    if (!projectId) {
      throw new Error("Se requiere ID del proyecto");
    }

    if (!userId) {
      throw new Error("Se requiere ID de usuario");
    }

    const { error } = await supabase
      .from('proyectos')
      .update({ estado: 'deleted' })
      .eq('id', projectId)
      .eq('user_id', userId); // Seguridad: solo el dueño puede borrar

    if (error) throw error;

    return { error: null };

  } catch (err) {
    console.error('Error deleting project:', err);
    return { error: err };
  }
};
