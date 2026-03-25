import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User, Bot, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CreativeCoach = ({ projectContext }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy CreativoX, tu Coach inteligente. ¿En qué proyecto trabajamos hoy?' }
  ]);
  const [input, setInput] = useState(""); // ESTADO DEL INPUT
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll al recibir mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault(); // EVITA RECARGA DE PÁGINA
    
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput(""); // LIMPIEZA INMEDIATA: Desbloquea el input para el siguiente mensaje
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Llamada a API Route en lugar de Edge Function
      const response = await fetch('/api/creative-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage, 
          projectContext: projectContext // Le pasamos lo que hay en el Mindmap/Moodboard
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Creative Coach');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Lo siento, tuve un hipo técnico. ¿Podemos intentar de nuevo?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d10] border-l border-white/10 w-80 shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-[#16161a] flex items-center gap-2">
        <Sparkles className="text-purple-500 w-5 h-5" />
        <h2 className="font-bold text-white tracking-tight">Creative Coach</h2>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-purple-600 text-white rounded-tr-none' 
                : 'bg-[#1c1c21] text-gray-200 border border-white/5 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-[#1c1c21] p-3 rounded-2xl rounded-tl-none border border-white/5">
              <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area - EL FIX CRUCIAL */}
      <form onSubmit={handleSendMessage} className="p-4 bg-[#16161a] border-t border-white/5">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input} // Enlazado al estado
            onChange={(e) => setInput(e.target.value)} // Permite escribir libremente
            placeholder="Escribe tu idea..."
            className="w-full bg-[#0d0d10] border border-white/10 rounded-xl py-3 px-4 pr-12 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
            disabled={isLoading}
          />
          <button 
            type="submit"
            className="absolute right-2 p-2 text-purple-500 hover:text-purple-400 disabled:opacity-50"
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreativeCoach;
