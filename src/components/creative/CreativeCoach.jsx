"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CreativeCoach({ projectId, projectType, projectData }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `¡Hola! Soy tu **Creative Coach** 🎨

Estoy aquí para ayudarte a:
• 💡 Generar ideas innovadoras
• 🎯 Superar bloqueos creativos
• 📊 Optimizar tu proyecto actual
• 🚀 Llevar tu visión al siguiente nivel

¿En qué puedo inspirarte hoy?`,
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll al final del chat
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Manejar envío de mensaje
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isTyping) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    // 1. Añadir mensaje del usuario inmediatamente
    setMessages(prev => [...prev, userMessage]);
    
    // 2. Limpiar input ANTES de cualquier await (liberar hilo de UI)
    setInputValue('');
    
    // 3. Enfocar input para seguir escribiendo
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    // 4. Activar estado de typing
    setIsTyping(true);

    try {
      // 5. Llamar a API Route en lugar de Edge Function
      const response = await fetch('/api/creative-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          projectContext: {
            id: projectId,
            type: projectType,
            data: projectData
          },
          conversationHistory: messages.slice(-5) // Últimos 5 mensajes para contexto
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Creative Coach');
      }

      const data = await response.json();

      // 6. Añadir respuesta de la IA
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Lo siento, no pude procesar tu mensaje. Intenta de nuevo.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error calling creative coach:', error);
      
      // Mensaje de error
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ **Error de conexión**

No pude comunicarme con el servidor. Por favor:
1. Verifica tu conexión a internet
2. Intenta recargar la página
3. Contacta a soporte si el problema persiste

Mientras tanto, ¿hay algo más en lo que pueda ayudarte?`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // 7. Desactivar estado de typing
      setIsTyping(false);
    }
  }, [inputValue, isTyping, messages, projectId, projectType, projectData]);

  // Manejar input change con auto-resize
  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
    
    // Auto-resize del textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, []);

  // Placeholder dinámico
  const getPlaceholder = () => {
    if (isTyping) return "Creative Coach está pensando...";
    if (messages.length > 1) return "Continúa la conversación...";
    return "Pregúntale algo a tu Creative Coach...";
  };

  return (
    <div className="h-full bg-[#0d0d10] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-white/[0.06] bg-[#16161a]/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#a855f7] to-[#9333ea] rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-semibold">Creative Coach</h2>
            <p className="text-white/60 text-sm">Asistente creativo inteligente</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isTyping ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
            <span className="text-white/40 text-xs">
              {isTyping ? 'Escribiendo...' : 'En línea'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-6 px-6">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-4 mb-6 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Avatar */}
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#a855f7] to-[#9333ea] rounded-lg flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Message Content */}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-[#a855f7]/20 border border-[#a855f7]/30'
                      : 'bg-transparent'
                  }`}
                >
                  <div 
                    className="text-white/90 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: message.content
                        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                        .replace(/\*(.+?)\*/g, '<em class="text-white/70">$1</em>')
                        .replace(/• (.+)/g, '• $1')
                        .replace(/\n\n/g, '</p><p class="mt-2">')
                        .replace(/\n/g, '<br/>') 
                    }}
                  />
                </div>

                {/* User Avatar */}
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white/70" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-4 mb-6"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#a855f7] to-[#9333ea] rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-transparent rounded-2xl">
                  <div className="flex items-center gap-2 px-4 py-3">
                    <Loader2 className="w-4 h-4 text-[#a855f7] animate-spin" />
                    <span className="text-white/60 text-sm">Creative Coach está escribiendo...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-white/[0.06] bg-[#16161a]/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-end bg-[#0d0d10] border border-white/[0.08] rounded-xl overflow-hidden focus-within:border-[#a855f7]/30 transition-colors">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder={getPlaceholder()}
                rows={1}
                className="flex-1 bg-transparent text-white placeholder:text-white/30 resize-none outline-none py-3 px-4 max-h-32 text-sm"
                style={{ minHeight: '48px' }}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className={`m-2 p-2 rounded-lg transition-all flex-shrink-0 ${
                  inputValue.trim() && !isTyping
                    ? 'bg-[#a855f7] text-white hover:bg-[#9333ea]'
                    : 'bg-white/10 text-white/30'
                } disabled:cursor-not-allowed`}
              >
                {isTyping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-3 flex items-center justify-center gap-2 text-white/40 text-xs">
            <Sparkles className="w-3 h-3" />
            <span>Powered by CreacionX AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
