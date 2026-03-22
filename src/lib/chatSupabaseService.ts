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
  // Cargar perfil del usuario - DESHABILITADO (sin Supabase)
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return null;
  },

  // Crear o actualizar perfil - DESHABILITADO (sin Supabase)
  async upsertUserProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    // Retornar perfil mock
    return {
      id: 'mock-profile',
      user_id: userId,
      creative_mode: 'calm',
      preferences: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...profile
    } as UserProfile;
  },

  // Cargar protocolo activo - DESHABILITADO (sin Supabase)
  async getActiveProtocol(userId: string): Promise<ProtocolProgress | null> {
    return null;
  },

  // Actualizar progreso del protocolo - DESHABILITADO (sin Supabase)
  async updateProtocolProgress(
    protocolId: string, 
    updates: Partial<ProtocolProgress>
  ): Promise<ProtocolProgress> {
    return {
      id: protocolId,
      user_id: 'mock-user',
      protocol_id: 'mock-protocol',
      current_step: 0,
      user_responses: [],
      is_complete: false,
      started_at: new Date().toISOString(),
      ...updates
    } as ProtocolProgress;
  },

  // Crear nuevo protocolo - DESHABILITADO (sin Supabase)
  async createProtocolProgress(
    userId: string,
    protocolId: string,
    projectTitle?: string
  ): Promise<ProtocolProgress> {
    return {
      id: 'mock-progress',
      user_id: userId,
      protocol_id: protocolId,
      current_step: 0,
      user_responses: [],
      is_complete: false,
      project_title: projectTitle,
      started_at: new Date().toISOString()
    } as ProtocolProgress;
  },

  // Cargar memoria del usuario - DESHABILITADO (sin Supabase)
  async getUserMemory(userId: string): Promise<UserMemory | null> {
    return null;
  },

  // Actualizar memoria del usuario - DESHABILITADO (sin Supabase)
  async updateUserMemory(
    userId: string,
    memoryData: Record<string, any>
  ): Promise<UserMemory> {
    return {
      id: 'mock-memory',
      user_id: userId,
      memory_type: 'session_stats',
      data: memoryData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as UserMemory;
  },

  // Crear nueva sesión de chat - DESHABILITADO (sin Supabase)
  async createChatSession(
    userId: string,
    sessionData: Partial<ChatSession>
  ): Promise<ChatSession> {
    return {
      id: 'mock-session',
      user_id: userId,
      started_at: new Date().toISOString(),
      messages: [],
      metadata: {},
      ...sessionData
    } as ChatSession;
  },

  // Actualizar sesión de chat - DESHABILITADO (sin Supabase)
  async updateChatSession(
    sessionId: string,
    updates: Partial<ChatSession>
  ): Promise<ChatSession> {
    return {
      id: sessionId,
      user_id: 'mock-user',
      started_at: new Date().toISOString(),
      messages: [],
      metadata: {},
      ...updates
    } as ChatSession;
  },

  // Cargar últimas sesiones - DESHABILITADO (sin Supabase)
  async getRecentSessions(userId: string, limit = 3): Promise<ChatSession[]> {
    return [];
  }
};

export default chatSupabaseService;
