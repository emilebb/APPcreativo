"use client";

import { useState, useRef, useEffect } from "react";
import { useChatSupabase } from "@/hooks/useChatSupabase";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import ChatOptions from "@/components/chat/ChatOptions";
import MentalStateIndicator from "@/components/chat/MentalStateIndicator";
import { Send, Brain, CheckCircle, AlertCircle } from "lucide-react";

interface Message {
  role: "user" | "system";
  content: string;
  timestamp?: string;
}

export default function SupabaseChatContainer() {
  const {
    isLoading,
    profile,
    activeProtocol,
    memory,
    systemPrompt,
    error,
    advanceProtocol,
    startProtocol,
    updateMemory,
    isInProtocol,
    currentProtocolDay,
    protocolProgress
  } = useChatSupabase();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [currentStep, setCurrentStep] = useState<'welcome' | 'protocol' | 'free_chat'>('welcome');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mensaje de bienvenida inicial
  useEffect(() => {
    if (!isLoading && !error) {
      const welcomeMessage = isInProtocol 
        ? `¡Hola de nuevo! 👋\n\nVeo que estás en el día ${currentProtocolDay} del protocolo "primeros_7_días".${activeProtocol?.project_title ? ` Trabajando en: "${activeProtocol.project_title}"` : ''}\n\n¿Continuamos con el ejercicio de hoy?`
        : `¡Hola! Soy tu Creative Coach 🧠✨\n\nEstoy aquí para ayudarte a superar cualquier bloqueo creativo y desbloquear tu potencial.\n\n¿En qué puedo ayudarte hoy?`;

      setMessages([{
        role: "system",
        content: welcomeMessage,
        timestamp: new Date().toISOString()
      }]);

      setCurrentStep(isInProtocol ? 'protocol' : 'free_chat');
    }
  }, [isLoading, error, isInProtocol, currentProtocolDay, activeProtocol?.project_title]);

  // Enviar mensaje a la API
  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      role: "user",
      content,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsThinking(true);

    try {
      const response = await fetch('/api/chat/supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          systemPrompt: systemPrompt,
          context: {
            isInProtocol,
            currentProtocolDay,
            protocolProgress,
            profile,
            activeProtocol,
            memory
          }
        })
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();
      
      const systemMessage: Message = {
        role: "system",
        content: data.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, systemMessage]);

      // Si estamos en un protocolo y la respuesta indica avanzar
      if (isInProtocol && data.shouldAdvanceProtocol) {
        await advanceProtocol(content);
      }

      // Actualizar memoria si hay nueva información
      if (data.memoryUpdate) {
        await updateMemory(data.memoryUpdate);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        role: "system",
        content: "Lo siento, tuve un problema procesando tu mensaje. ¿Podemos intentarlo de nuevo?",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  // Iniciar protocolo "primeros_7_dias"
  const startSevenDayProtocol = async (projectTitle: string) => {
    await startProtocol('primeros_7_dias', projectTitle);
    
    const protocolMessage = {
      role: "system" as const,
      content: `¡Excelente elección! 🎯\n\nIniciamos el protocolo "Primeros 7 días" para tu proyecto: "${projectTitle}".\n\nEste protocolo te ayudará a construir tu proyecto paso a paso, con ejercicios diarios de 1-5 minutos.\n\n**Día 1: Definir propósito del proyecto**\n\nPara empezar, dime: ¿Cuál es el propósito principal de este proyecto? ¿Qué problema resuelve o qué necesidad satisface?`,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, protocolMessage]);
    setCurrentStep('protocol');
  };

  // Renderizado de loading
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando tu Creative Coach...</p>
        </div>
      </div>
    );
  }

  // Renderizado de error
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Error en el Chat</h2>
          <p className="text-neutral-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Creative Coach
            </div>
            <div className="text-base font-semibold text-neutral-800">
              {isInProtocol 
                ? `Protocolo: Día ${currentProtocolDay}/7` 
                : "Vamos paso a paso."
              }
            </div>
            
            {/* Indicador de progreso del protocolo */}
            {isInProtocol && (
              <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${protocolProgress}%` }}
                ></div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {profile?.creative_mode === 'direct' && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                Rápido
              </span>
            )}
            <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs uppercase tracking-[0.15em] text-white">
              Beta
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {messages.map((message, index) => (
            <ChatMessage
              key={`${message.role}-${index}`}
              role={message.role}
              content={message.content}
            />
          ))}
          {isThinking && (
            <div className="flex items-center gap-2 text-neutral-400">
              <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <span className="text-sm italic">Pensando...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-neutral-100 px-6 py-4">
          {currentStep === 'welcome' && !isInProtocol && (
            <ChatOptions
              options={[
                { id: 'start_protocol', label: 'Iniciar protocolo de 7 días' },
                { id: 'free_chat', label: 'Hablar de un bloqueo específico' },
                { id: 'get_ideas', label: 'Necesito ideas para un proyecto' }
              ]}
              onSelect={async (choice) => {
                if (choice === 'start_protocol') {
                  const projectTitle = prompt('¿Para qué proyecto quieres iniciar el protocolo?');
                  if (projectTitle) {
                    await startSevenDayProtocol(projectTitle);
                  }
                } else {
                  setCurrentStep('free_chat');
                }
              }}
            />
          )}

          {currentStep === 'free_chat' && (
            <ChatInput
              placeholder="Escribe lo que te bloquea o necesitas ayuda..."
              onSend={sendMessage}
            />
          )}

          {currentStep === 'protocol' && isInProtocol && (
            <ChatInput
              placeholder="Responde al ejercicio del día..."
              onSend={sendMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
