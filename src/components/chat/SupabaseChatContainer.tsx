"use client";

import { useState, useRef, useEffect } from "react";
import { useChatSupabase } from "@/hooks/useChatSupabase";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import ChatOptions from "@/components/chat/ChatOptions";
import { Brain, AlertCircle } from "lucide-react";

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isLoading && !error) {
      const welcomeMessage = isInProtocol 
        ? `Día ${currentProtocolDay} del protocolo.${activeProtocol?.project_title ? ` Proyecto: "${activeProtocol.project_title}"` : ''}\n\n¿Listo para continuar?`
        : `Hola 👋 Soy tu Coach Creativo.\n\nDetecto bloqueos, te doy acciones claras.\n\n¿Qué necesitas hoy?`;

      setMessages([{
        role: "system",
        content: welcomeMessage,
        timestamp: new Date().toISOString()
      }]);

      setCurrentStep(isInProtocol ? 'protocol' : 'free_chat');
    }
  }, [isLoading, error, isInProtocol, currentProtocolDay, activeProtocol?.project_title]);

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

      if (isInProtocol && data.shouldAdvanceProtocol) {
        await advanceProtocol(content);
      }

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[150px]" />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-400">Cargando tu Creative Coach...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[150px]" />
        </div>
        <div className="relative z-10 text-center max-w-md mx-auto p-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error en el Chat</h2>
          <p className="text-neutral-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] relative overflow-hidden px-4 py-10">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,transparent_40%,rgba(255,255,255,0.015)_40%)] bg-[length:20px_20px]" />
      </div>

      <div className="relative z-10 flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl blur-md opacity-50" />
              <div className="relative w-11 h-11 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-[0.2em] text-violet-400">
                Creative Coach
              </div>
              <div className="text-base font-semibold text-white">
                {isInProtocol 
                  ? `Protocolo: Día ${currentProtocolDay}/7` 
                  : "Vamos paso a paso."
                }
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {profile?.creative_mode === 'direct' && (
              <span className="text-xs bg-orange-500/20 border border-orange-500/30 text-orange-400 px-2 py-1 rounded-full">
                Rápido
              </span>
            )}
            <span className="rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-500/30 px-3 py-1 text-xs uppercase tracking-[0.15em] text-violet-300">
              Premium
            </span>
          </div>
        </div>

        {/* Protocol progress bar */}
        {isInProtocol && (
          <div className="px-6 py-3 border-b border-white/5">
            <div className="w-full bg-white/5 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-violet-500 to-cyan-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${protocolProgress}%` }}
              />
            </div>
          </div>
        )}

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
              <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="text-sm italic text-white/50">Pensando...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/5 px-6 py-4">
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
