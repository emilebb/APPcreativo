"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/authProvider";
import { chatSupabaseService, type UserProfile, type ProtocolProgress, type UserMemory } from "@/lib/chatSupabaseService";
import { ChatContextBuilder } from "@/lib/chatContextBuilder";

export interface ChatState {
  isLoading: boolean;
  profile?: UserProfile;
  activeProtocol?: ProtocolProgress;
  memory?: UserMemory;
  systemPrompt?: string;
  error?: string;
}

export function useChatSupabase() {
  const { user } = useAuth();
  const [state, setState] = useState<ChatState>({ isLoading: true });
  const [contextBuilder, setContextBuilder] = useState<ChatContextBuilder | null>(null);

  // Cargar datos iniciales cuando el usuario está disponible
  useEffect(() => {
    if (!user?.id) {
      setState({ isLoading: false });
      return;
    }

    const loadChatData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: undefined }));

        const builder = new ChatContextBuilder(user.id);
        await builder.loadUserData();
        
        const systemPrompt = builder.buildSystemPrompt();
        const context = builder.getContext();

        setContextBuilder(builder);
        setState({
          isLoading: false,
          profile: context.profile,
          activeProtocol: context.activeProtocol,
          memory: context.memory,
          systemPrompt
        });
      } catch (error) {
        console.error("Error loading chat data:", error);
        setState({
          isLoading: false,
          error: "Error cargando datos del chat"
        });
      }
    };

    loadChatData();
  }, [user?.id]);

  // Función para crear perfil si no existe
  const ensureProfile = useCallback(async () => {
    if (!user?.id || state.profile) return;

    try {
      const defaultProfile = {
        creative_mode: 'calm' as const,
        preferences: {
          preferred_blockages: [],
          favorite_protocols: [],
          notification_settings: true
        }
      };

      const profile = await chatSupabaseService.upsertUserProfile(user.id, defaultProfile);
      setState(prev => ({ ...prev, profile }));
      
      // Recargar el contexto con el nuevo perfil
      if (contextBuilder) {
        await contextBuilder.loadUserData();
        const systemPrompt = contextBuilder.buildSystemPrompt();
        setState(prev => ({ ...prev, systemPrompt }));
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      setState(prev => ({ ...prev, error: "Error creando perfil" }));
    }
  }, [user?.id, state.profile, contextBuilder]);

  // Función para avanzar en el protocolo
  const advanceProtocol = useCallback(async (userResponse: string) => {
    if (!contextBuilder) return;

    try {
      await contextBuilder.advanceProtocol(userResponse);
      
      // Recargar datos para actualizar el estado
      await contextBuilder.loadUserData();
      const systemPrompt = contextBuilder.buildSystemPrompt();
      const context = contextBuilder.getContext();

      setState(prev => ({
        ...prev,
        activeProtocol: context.activeProtocol,
        memory: context.memory,
        systemPrompt
      }));
    } catch (error) {
      console.error("Error advancing protocol:", error);
      setState(prev => ({ ...prev, error: "Error avanzando protocolo" }));
    }
  }, [contextBuilder]);

  // Función para iniciar un nuevo protocolo
  const startProtocol = useCallback(async (protocolId: string, projectTitle?: string) => {
    if (!contextBuilder) return;

    try {
      await contextBuilder.startProtocol(protocolId, projectTitle);
      
      // Recargar datos para actualizar el estado
      await contextBuilder.loadUserData();
      const systemPrompt = contextBuilder.buildSystemPrompt();
      const context = contextBuilder.getContext();

      setState(prev => ({
        ...prev,
        activeProtocol: context.activeProtocol,
        systemPrompt
      }));
    } catch (error) {
      console.error("Error starting protocol:", error);
      setState(prev => ({ ...prev, error: "Error iniciando protocolo" }));
    }
  }, [contextBuilder]);

  // Función para actualizar memoria
  const updateMemory = useCallback(async (newData: Record<string, any>) => {
    if (!contextBuilder) return;

    try {
      await contextBuilder.updateMemory(newData);
      
      // Recargar datos para actualizar el estado
      await contextBuilder.loadUserData();
      const systemPrompt = contextBuilder.buildSystemPrompt();
      const context = contextBuilder.getContext();

      setState(prev => ({
        ...prev,
        memory: context.memory,
        systemPrompt
      }));
    } catch (error) {
      console.error("Error updating memory:", error);
      setState(prev => ({ ...prev, error: "Error actualizando memoria" }));
    }
  }, [contextBuilder]);

  // Función para refrescar todos los datos
  const refresh = useCallback(async () => {
    if (!contextBuilder) return;

    try {
      await contextBuilder.loadUserData();
      const systemPrompt = contextBuilder.buildSystemPrompt();
      const context = contextBuilder.getContext();

      setState(prev => ({
        ...prev,
        profile: context.profile,
        activeProtocol: context.activeProtocol,
        memory: context.memory,
        systemPrompt,
        error: undefined
      }));
    } catch (error) {
      console.error("Error refreshing chat data:", error);
      setState(prev => ({ ...prev, error: "Error refrescando datos" }));
    }
  }, [contextBuilder]);

  // Crear perfil automáticamente si no existe
  useEffect(() => {
    if (!state.isLoading && !state.profile && user?.id) {
      ensureProfile();
    }
  }, [state.isLoading, state.profile, user?.id, ensureProfile]);

  return {
    ...state,
    // Funciones disponibles
    advanceProtocol,
    startProtocol,
    updateMemory,
    refresh,
    ensureProfile,
    
    // Datos del contexto
    context: contextBuilder?.getContext(),
    
    // Estado del protocolo
    isInProtocol: !!state.activeProtocol && !state.activeProtocol.is_complete,
    currentProtocolDay: state.activeProtocol ? state.activeProtocol.current_step + 1 : 0,
    protocolProgress: state.activeProtocol ? 
      Math.round((state.activeProtocol.current_step / 7) * 100) : 0
  };
}

export default useChatSupabase;
