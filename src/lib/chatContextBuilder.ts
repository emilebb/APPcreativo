import { chatSupabaseService, type UserProfile, type ProtocolProgress, type UserMemory } from "./chatSupabaseService";

export interface ChatContext {
  user_id: string;
  profile?: UserProfile;
  activeProtocol?: ProtocolProgress;
  memory?: UserMemory;
  recentSessions?: any[];
}

export class ChatContextBuilder {
  private context: ChatContext;

  constructor(userId: string) {
    this.context = { user_id: userId };
  }

  async loadUserData(): Promise<this> {
    try {
      // Cargar todo en paralelo para mejor performance
      const [profile, activeProtocol, memory, recentSessions] = await Promise.all([
        chatSupabaseService.getUserProfile(this.context.user_id),
        chatSupabaseService.getActiveProtocol(this.context.user_id),
        chatSupabaseService.getUserMemory(this.context.user_id),
        chatSupabaseService.getRecentSessions(this.context.user_id, 3)
      ]);

      this.context.profile = profile || undefined;
      this.context.activeProtocol = activeProtocol || undefined;
      this.context.memory = memory || undefined;
      this.context.recentSessions = recentSessions || [];

      return this;
    } catch (error) {
      console.error("Error loading chat context:", error);
      return this;
    }
  }

  buildSystemPrompt(): string {
    const { profile, activeProtocol, memory, recentSessions } = this.context;

    let prompt = `Eres CreationX, un coach creativo que habla en español latino, cercano y motivador.`;

    // Información del perfil
    if (profile) {
      prompt += `\n\n- Perfil del usuario:`;
      prompt += `\n  * Modo creativo: ${profile.creative_mode === 'direct' ? 'directo (3x más rápido)' : 'calm (ritmo estándar)'}`;
      if (profile.username) prompt += `\n  * Username: ${profile.username}`;
      if (profile.full_name) prompt += `\n  * Nombre: ${profile.full_name}`;
      if (profile.preferences) {
        prompt += `\n  * Preferencias: ${JSON.stringify(profile.preferences)}`;
      }
    }

    // Protocolo activo
    if (activeProtocol) {
      prompt += `\n\n- Protocolo activo:`;
      prompt += `\n  * Nombre: ${activeProtocol.protocol_id}`;
      prompt += `\n  * Paso actual: ${activeProtocol.current_step + 1}`;
      prompt += `\n  * Completado: ${activeProtocol.is_complete ? 'Sí' : 'No'}`;
      if (activeProtocol.project_title) {
        prompt += `\n  * Proyecto: "${activeProtocol.project_title}"`;
      }
      if (activeProtocol.user_responses.length > 0) {
        prompt += `\n  * Respuestas anteriores: ${activeProtocol.user_responses.join(', ')}`;
      }
    }

    // Memoria y estadísticas
    if (memory?.data) {
      prompt += `\n\n- Historial y estadísticas:`;
      const data = memory.data;
      
      if (data.blockage_counts) {
        prompt += `\n  * Bloqueos frecuentes: ${Object.entries(data.blockage_counts)
          .map(([blockage, count]) => `${blockage} (${count} veces)`)
          .join(', ')}`;
      }
      
      if (data.protocol_scores) {
        prompt += `\n  * Protocolos efectivos: ${Object.entries(data.protocol_scores)
          .map(([protocol, score]) => `${protocol} (puntaje: ${score})`)
          .join(', ')}`;
      }
      
      if (data.total_sessions) {
        prompt += `\n  * Total de sesiones: ${data.total_sessions}`;
      }
      
      if (data.success_rate) {
        prompt += `\n  * Tasa de éxito: ${Math.round(data.success_rate * 100)}%`;
      }
    }

    // Sesiones recientes
    if (recentSessions && recentSessions.length > 0) {
      prompt += `\n\n- Sesiones recientes:`;
      recentSessions.slice(0, 2).forEach((session, index) => {
        prompt += `\n  * Sesión ${index + 1}: ${session.blockage_id || 'General'} (${new Date(session.started_at).toLocaleDateString('es-ES')})`;
      });
    }

    // Instrucciones específicas del protocolo "primeros_7_dias"
    if (activeProtocol?.protocol_id === 'primeros_7_dias') {
      prompt += `\n\n- Instrucciones para protocolo "primeros_7_dias":`;
      prompt += `\n  * Estás en el día ${activeProtocol.current_step + 1} de 7`;
      prompt += `\n  * Cada día tiene un ejercicio específico`;
      prompt += `\n  * Los ejercicios son de 1-5 minutos`;
      prompt += `\n  * Guarda las respuestas breves con bullets`;
      prompt += `\n  * Al finalizar cada día, actualiza el progreso`;
      
      // Pasos específicos del protocolo
      const protocolSteps = [
        "Definir propósito del proyecto",
        "Esbozar 3 ideas rápidas", 
        "Elegir paleta mínima",
        "Definir estilo (minimalista, ilustración, tipográfico, etc.)",
        "Comparar 3 variantes",
        "Seleccionar una",
        "Escribir 1-2 frases sobre por qué funciona"
      ];
      
      const currentStepIndex = activeProtocol.current_step;
      if (currentStepIndex < protocolSteps.length) {
        prompt += `\n  * Ejercicio del día: ${protocolSteps[currentStepIndex]}`;
      }
    }

    // Reglas generales
    prompt += `\n\n- Reglas generales:`;
    prompt += `\n  * Propon siempre ejercicios de 1-5 minutos`;
    prompt += `\n  * Habla en tono motivador y empático`;
    prompt += `\n  * Si estás en un protocolo, sigue el día actual`;
    prompt += `\n  * Detecta automáticamente el tipo de bloqueo`;
    prompt += `\n  * Adapta tu ritmo al modo del usuario (calm/direct)`;
    prompt += `\n  * Usa emojis moderadamente para hacer más cercana la conversación`;

    return prompt;
  }

  getContext(): ChatContext {
    return this.context;
  }

  // Métodos de ayuda para protocolos
  async advanceProtocol(userResponse: string): Promise<void> {
    if (!this.context.activeProtocol) return;

    try {
      const updatedResponses = [...this.context.activeProtocol.user_responses, userResponse];
      const nextStep = this.context.activeProtocol.current_step + 1;
      const isComplete = nextStep >= 7; // "primeros_7_dias" tiene 7 días

      await chatSupabaseService.updateProtocolProgress(
        this.context.activeProtocol.id,
        {
          user_responses: updatedResponses,
          current_step: nextStep,
          is_complete: isComplete,
          completed_at: isComplete ? new Date().toISOString() : undefined
        }
      );

      // Actualizar contexto local
      if (this.context.activeProtocol) {
        this.context.activeProtocol.user_responses = updatedResponses;
        this.context.activeProtocol.current_step = nextStep;
        this.context.activeProtocol.is_complete = isComplete;
      }
    } catch (error) {
      console.error("Error advancing protocol:", error);
    }
  }

  async startProtocol(protocolId: string, projectTitle?: string): Promise<void> {
    try {
      const newProtocol = await chatSupabaseService.createProtocolProgress(
        this.context.user_id,
        protocolId,
        projectTitle
      );

      this.context.activeProtocol = newProtocol;
    } catch (error) {
      console.error("Error starting protocol:", error);
    }
  }

  async updateMemory(newData: Record<string, any>): Promise<void> {
    try {
      const currentData = this.context.memory?.data || {};
      const updatedData = { ...currentData, ...newData };

      await chatSupabaseService.updateUserMemory(this.context.user_id, updatedData);

      if (this.context.memory) {
        this.context.memory.data = updatedData;
      }
    } catch (error) {
      console.error("Error updating memory:", error);
    }
  }
}

export default ChatContextBuilder;
