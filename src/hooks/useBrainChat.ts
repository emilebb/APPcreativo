/**
 * useBrainChat - Hook que integra BrainSystem + Firebase + Auto-Mindmap
 * 🔥 El corazón de la integración completa
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import Brain, { type BrainResponse } from '@/lib/brainSystem';
import { 
  saveMessage, 
  createChatSession, 
  updateChatMetadata,
  subscribeToChatMessages,
  type ChatMessage 
} from '@/lib/firebaseChat';
import { createNodeFromChat } from '@/lib/firebaseMindmap';
import { useAuth } from '@/lib/authProvider';

interface UseBrainChatOptions {
  chatId: string;
  mapId?: string; // ID del mapa mental asociado
  mode?: 'directo' | 'calmado';
  autoCreateNodes?: boolean; // Auto-crear nodos en mapa mental
}

interface UseBrainChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (message: string) => Promise<void>;
  brain: Brain;
  lastNodeId: string | null;
}

export function useBrainChat(options: UseBrainChatOptions): UseBrainChatReturn {
  const { chatId, mapId, mode = 'directo', autoCreateNodes = true } = options;
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastNodeId, setLastNodeId] = useState<string | null>(null);
  
  const brainRef = useRef(new Brain(mode));
  const brain = brainRef.current;

  // Inicializar sesión de chat
  useEffect(() => {
    if (!user?.id) return;

    createChatSession(user.id, chatId);
  }, [user?.id, chatId]);

  // Suscribirse a mensajes en tiempo real
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToChatMessages(
      user.id,
      chatId,
      (firebaseMessages) => {
        setMessages(firebaseMessages);
      }
    );

    return unsubscribe;
  }, [user?.id, chatId]);

  // Actualizar modo del brain
  useEffect(() => {
    brain.setMode(mode);
  }, [mode, brain]);

  /**
   * Envía un mensaje y procesa la respuesta
   */
  const sendMessage = useCallback(async (messageText: string) => {
    if (!user?.id || !messageText.trim()) return;

    setIsLoading(true);

    try {
      // 1. Guardar mensaje del usuario
      const userMessage: ChatMessage = {
        role: 'user',
        content: messageText,
        timestamp: Date.now(),
      };

      await saveMessage(user.id, chatId, userMessage);

      // 2. Procesar con BrainSystem
      const brainResponse: BrainResponse = brain.processMessage(messageText);

      // 3. Guardar respuesta del coach
      const systemMessage: ChatMessage = {
        role: 'system',
        content: formatBrainResponse(brainResponse),
        timestamp: Date.now(),
        actionType: brainResponse.actionType,
        hasAction: !!brainResponse.action,
      };

      await saveMessage(user.id, chatId, systemMessage);

      // 4. Actualizar metadata del chat
      const brainContext = brain.getContext();
      await updateChatMetadata(user.id, chatId, {
        lastIntent: brainContext.currentIntent || undefined,
        lastBlockage: brainContext.currentBlockage || undefined,
        momentum: brainContext.momentum,
      });

      // 5. 🔥 CREAR NODO AUTOMÁTICO EN MAPA MENTAL
      if (autoCreateNodes && mapId && brainResponse.createNode) {
        const nodeId = await createNodeFromChat(
          user.id,
          mapId,
          messageText, // Texto del usuario como nodo
          chatId,
          lastNodeId || undefined
        );

        if (nodeId) {
          setLastNodeId(nodeId);
        }
      }

    } catch (error) {
      console.error('Error enviando mensaje:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, chatId, mapId, brain, autoCreateNodes, lastNodeId]);

  return {
    messages,
    isLoading,
    sendMessage,
    brain,
    lastNodeId,
  };
}

/**
 * Formatea la respuesta del Brain para mostrar en el chat
 */
function formatBrainResponse(response: BrainResponse): string {
  let formatted = response.message;

  if (response.action) {
    formatted += `\n\n💡 **Acción:** ${response.action}`;
  }

  formatted += `\n\n❓ ${response.question}`;

  return formatted;
}
