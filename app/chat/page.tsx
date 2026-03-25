'use client';

import { useState, useRef, useCallback, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { ArrowUp, User, Zap } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import { useAuth } from "@/lib/authProvider";

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
      <span className="text-sm text-white/50 font-light">CreativoX está pensando...</span>
    </div>
  );
}

function ChatContent() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, status, sendMessage } = useChat({
    transport: new TextStreamChatTransport({ api: '/api/chat' }),
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        parts: [{ type: 'text', text: `¡Hola! 👋 Soy **CreativoX AI**, tu Coach Creativo Inteligente.

Estoy aquí para ayudarte a:
- 🎨 Diseñar y crear con claridad
- 💡 Generar ideas innovadoras
- 🧠 Superar bloqueos creativos
- 📊 Estructurar tus proyectos

¿Cómo puedo ayudarte hoy?` }],
      },
    ],
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  // Auto-scroll mejorado
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Placeholder dinámico
  const getPlaceholder = () => {
    if (isLoading) return "CreativoX está analizando tu mensaje...";
    if (messages.length > 1) return "Continúa la conversación...";
    return "Pregúntale algo a CreativoX...";
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageToSend = input.trim();
    
    // 1. LIMPIAR INPUT INMEDIATAMENTE
    setInput("");
    
    // 2. ENVIAR MENSAJE
    sendMessage({ text: messageToSend });
    
    // 3. ENFOCAR INPUT DESPUÉS DE ENVIAR
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [input, isLoading, sendMessage]);

  // Auto-resize del textarea
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, []);

  return (
    <div className="h-screen bg-[#050505] flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white">CreativoX AI</h1>
              <p className="text-xs text-white/40">Coach Creativo Inteligente</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-white/40">En línea</span>
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-6 px-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 mb-6 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-white/[0.04] border border-white/[0.06]'
                    : 'bg-transparent'
                }`}
              >
                <p className="text-white/90 text-sm whitespace-pre-wrap">
                  {message.parts?.[0]?.text || ''}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white/70" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-4 mb-6">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="bg-transparent rounded-2xl">
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-white/[0.06] bg-[#050505]">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-end bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden focus-within:border-violet-500/30 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                placeholder={getPlaceholder()}
                rows={1}
                className="flex-1 bg-transparent text-white placeholder:text-white/30 resize-none outline-none py-3 px-4 max-h-48 text-sm"
                style={{ minHeight: '48px' }}
              />

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`m-2 p-2 rounded-lg transition-all flex-shrink-0 ${
                  input.trim()
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'bg-white/10 text-white/30'
                } disabled:cursor-not-allowed`}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </form>
          <p className="text-xs text-white/20 text-center mt-3">
            CreativoX AI puede cometer errores. Considera verificar información importante.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <AuthGuard requireAuth={true}>
      <ChatContent />
    </AuthGuard>
  );
}
