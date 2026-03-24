import { supabase } from './supabase';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  proyecto_id: string;
  created_at: string;
}

/**
 * Guarda un mensaje en la tabla chat_history
 */
export async function saveMessage(
  proyectoId: string,
  role: ChatRole,
  content: string
): Promise<ChatMessage | null> {
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .insert({
        proyecto_id: proyectoId,
        role,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving chat message:', error);
      return null;
    }

    return data as ChatMessage;
  } catch (error) {
    console.error('Unexpected error saving chat message:', error);
    return null;
  }
}

/**
 * Obtiene todos los mensajes de un proyecto, ordenados por fecha
 */
export async function getMessages(proyectoId: string): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }

    return data as ChatMessage[];
  } catch (error) {
    console.error('Unexpected error fetching chat messages:', error);
    return [];
  }
}

/**
 * Elimina todos los mensajes de un proyecto (útil al eliminar proyecto)
 */
export async function clearMessages(proyectoId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chat_history')
      .delete()
      .eq('proyecto_id', proyectoId);

    if (error) {
      console.error('Error clearing chat messages:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error clearing chat messages:', error);
    return false;
  }
}

/**
 * Obtiene el último mensaje de un proyecto (para mostrar última respuesta de IA)
 */
export async function getLastMessage(proyectoId: string): Promise<ChatMessage | null> {
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // No hay mensajes aún, no es error
      return null;
    }

    return data as ChatMessage;
  } catch (error) {
    console.error('Unexpected error fetching last message:', error);
    return null;
  }
}