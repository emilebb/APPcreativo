import { getSupabaseClient } from "./supabaseClient";

export interface UserProfile {
  id: string;
  user_id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  creative_mode: 'calm' | 'direct';
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  blockage_id?: string;
  protocol_id?: string;
  outcome?: 'helpful' | 'not_helpful' | 'unknown';
  messages: Array<{ role: 'user' | 'system'; content: string }>;
  metadata: Record<string, any>;
}

export interface UserMemory {
  id: string;
  user_id: string;
  memory_type: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProtocolProgress {
  id: string;
  user_id: string;
  protocol_id: string;
  current_step: number;
  user_responses: string[];
  is_complete: boolean;
  project_title?: string;
  started_at: string;
  completed_at?: string;
}

export const chatSupabaseService = {
  // Cargar perfil del usuario
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error loading user profile:", error);
      return null;
    }

    return data;
  },

  // Crear o actualizar perfil
  async upsertUserProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase not available");

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert({
        user_id: userId,
        ...profile,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Cargar protocolo activo
  async getActiveProtocol(userId: string): Promise<ProtocolProgress | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("protocol_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("is_complete", false)
      .order("started_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Error loading active protocol:", error);
      return null;
    }

    return data;
  },

  // Actualizar progreso del protocolo
  async updateProtocolProgress(
    protocolId: string, 
    updates: Partial<ProtocolProgress>
  ): Promise<ProtocolProgress> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase not available");

    const { data, error } = await supabase
      .from("protocol_progress")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", protocolId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Crear nuevo protocolo
  async createProtocolProgress(
    userId: string,
    protocolId: string,
    projectTitle?: string
  ): Promise<ProtocolProgress> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase not available");

    const { data, error } = await supabase
      .from("protocol_progress")
      .insert({
        user_id: userId,
        protocol_id: protocolId,
        current_step: 0,
        user_responses: [],
        is_complete: false,
        project_title: projectTitle,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Cargar memoria del usuario
  async getUserMemory(userId: string): Promise<UserMemory | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("user_memory")
      .select("*")
      .eq("user_id", userId)
      .eq("memory_type", "session_stats")
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error loading user memory:", error);
      return null;
    }

    return data;
  },

  // Actualizar memoria del usuario
  async updateUserMemory(
    userId: string,
    memoryData: Record<string, any>
  ): Promise<UserMemory> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase not available");

    const { data, error } = await supabase
      .from("user_memory")
      .upsert({
        user_id: userId,
        memory_type: "session_stats",
        data: memoryData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Crear nueva sesión de chat
  async createChatSession(
    userId: string,
    sessionData: Partial<ChatSession>
  ): Promise<ChatSession> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase not available");

    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: userId,
        messages: [],
        metadata: {},
        started_at: new Date().toISOString(),
        ...sessionData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Actualizar sesión de chat
  async updateChatSession(
    sessionId: string,
    updates: Partial<ChatSession>
  ): Promise<ChatSession> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase not available");

    const { data, error } = await supabase
      .from("chat_sessions")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Cargar últimas sesiones
  async getRecentSessions(userId: string, limit = 3): Promise<ChatSession[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error loading recent sessions:", error);
      return [];
    }

    return data || [];
  }
};

export default chatSupabaseService;
