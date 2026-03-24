'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  User,
  Bot,
  Target,
  Lightbulb,
  Rocket,
  AlertTriangle,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  prompt: string;
  color: string;
}

// ============================================================================
// QUICK ACTIONS DATA
// ============================================================================

const quickActions: QuickAction[] = [
  {
    id: 'block',
    icon: <Target className="w-5 h-5" />,
    label: 'Superar Bloqueo',
    prompt: 'Estoy experimentando un bloqueo creativo y necesito ayuda para superarlo. ¿Qué técnicas me recomiendas?',
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 'ideas',
    icon: <Lightbulb className="w-5 h-5" />,
    label: 'Generar 5 Ideas',
    prompt: 'Necesito generar 5 ideas creativas rápidas para mi proyecto. Ayúdame con brainstorming.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'structure',
    icon: <Rocket className="w-5 h-5" />,
    label: 'Estructurar Proyecto',
    prompt: 'Ayúdame a estructurar mi proyecto creativo. Necesito un plan claro con pasos accionables.',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'feedback',
    icon: <AlertTriangle className="w-5 h-5" />,
    label: 'Feedback Crítico',
    prompt: 'Quiero feedback honesto y directo sobre mi trabajo. No necesitos halagos, necesito mejoras concretas.',
    color: 'from-rose-500 to-pink-600',
  },
];

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const messageVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CreativeCoachPro() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `## ¡Bienvenido a Creative Coach Pro! 👋

Soy **CreativoX AI**, tu coach creativo personal. Estoy aquí para:

- 🎯 **Superar bloqueos creativos** - Detecto el tipo de bloqueo y te doy la solución
- 💡 **Generar ideas frescas** - Brainstorming estructurado y efectivo
- 📊 **Estructurar proyectos** - Planes de acción claros y ejecutables
- 🔬 **Feedback honesto** - Críticas constructivas para mejorar rápido

### ¿Cómo puedo ayudarte hoy?

Escribe tu pregunta o usa un **acceso rápido** del panel izquierdo.

💡 *Tip: Puedes preguntarme sobre cualquier cosa creativa - colores, logos, estructura, inspiración...*`,
      timestamp: new Date(),
    },
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Send message
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message || 'Lo siento, hubo un error. Intenta de nuevo.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ Hubo un problema de conexión. Pero no te preocupes, intenta de nuevo.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Handle quick action
  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt);
  };

  // Render markdown simple
  const renderContent = (content: string) => {
    let html = content;
    
    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-white mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-4 mb-2">$1</h2>');
    
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
    
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em class="text-white/80">$1</em>');
    
    // Lists
    html = html.replace(/^- (.+)$/gm, '<li class="ml-4 text-white/80 list-disc">$1</li>');
    html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-white/80 list-decimal">$1</li>');
    
    // Code inline
    html = html.replace(/`(.+?)`/g, '<code class="px-2 py-0.5 bg-white/10 rounded text-violet-300 font-mono text-sm">$1</code>');
    
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p class="mt-2">');
    html = html.replace(/\n/g, '<br/>');
    
    return `<p class="text-white/80">${html}</p>`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden">
      {/* Background Radial Gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-violet-900/20 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      {/* ============================================================================
          SIDEBAR - Quick Actions
          ============================================================================ */}
      <aside className="w-72 border-r border-white/10 bg-white/[0.02] backdrop-blur-xl p-5 flex flex-col relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg">CreativoX AI</h2>
            <p className="text-xs text-white/40">Creative Coach Pro</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-400">Motor local activo</span>
        </div>

        {/* Quick Actions Header */}
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
          Accesos Rápidos
        </h3>

        {/* Quick Actions List */}
        <div className="space-y-3">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleQuickAction(action)}
              disabled={isLoading}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl
                         bg-white/[0.03] border border-white/10
                         hover:bg-white/[0.06] hover:border-white/20
                         transition-all duration-200 group
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} 
                              flex items-center justify-center shadow-lg
                              group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <span className="text-sm font-medium text-white/80 group-hover:text-white">
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Info Card */}
        <div className="mt-auto p-4 bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-500/20 rounded-xl">
          <p className="text-xs text-white/60">
            💡 <strong className="text-white/80">Tip:</strong> Este coach funciona sin internet. 
            Respuestas instantáneas, sin límites.
          </p>
        </div>
      </aside>

      {/* ============================================================================
          MAIN CHAT AREA
          ============================================================================ */}
      <main className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <header className="px-6 py-4 border-b border-white/10 bg-white/[0.02] backdrop-blur-sm">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#050505]" />
              </div>
              <div>
                <h1 className="font-semibold text-white">Creative Coach Pro</h1>
                <p className="text-xs text-white/40">Respuestas predefinidas de alta calidad</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
              <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
              <span className="text-xs text-white/50">Online</span>
            </div>
          </div>
        </header>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto space-y-6"
          >
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex gap-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* AI Avatar */}
                  {message.role === 'assistant' && (
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}

                  {/* Message Bubble - Glassmorphism */}
                  <div
                    className={`max-w-[75%] rounded-2xl px-5 py-4 relative
                      ${message.role === 'user'
                        ? 'bg-white/[0.05] border border-white/10'
                        : 'bg-indigo-500/[0.08] border border-indigo-400/20'
                      }
                      backdrop-blur-sm shadow-xl`}
                  >
                    <div 
                      className="prose prose-invert prose-sm max-w-none
                        [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-4 [&_h2]:mb-2
                        [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-4 [&_h3]:mb-2
                        [&_strong]:text-white [&_strong]:font-semibold
                        [&_em]:text-white/80
                        [&_li]:text-white/80 [&_li]:ml-4
                        [&_p]:text-white/80 [&_p]:my-2
                        [&_code]:bg-white/10 [&_code]:text-violet-300 [&_code]:font-mono [&_code]:px-2 [&_code]:py-0.5 [&_code]:rounded"
                      dangerouslySetInnerHTML={{ __html: renderContent(message.content) }}
                    />
                    
                    {/* Timestamp */}
                    <div className={`text-[10px] mt-3 ${
                      message.role === 'user' ? 'text-white/30' : 'text-white/20'
                    }`}>
                      {message.timestamp.toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {message.role === 'user' && (
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10">
                      <User className="w-5 h-5 text-white/70" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-indigo-500/[0.08] border border-indigo-400/20 backdrop-blur-sm rounded-2xl px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-white/60 mr-2">Escribiendo</span>
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-2 h-2 bg-violet-400 rounded-full"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.15,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </motion.div>
        </div>

        {/* Input Area - Floating Capsule */}
        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Gradient Border Effect */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500 rounded-2xl opacity-50 blur-sm" />
              
              {/* Input Container */}
              <div className="relative flex items-end gap-3 bg-[#0a0a0a] rounded-2xl border border-white/10 p-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Pregúntame sobre creatividad, diseño, bloqueos..."
                  rows={1}
                  className="flex-1 bg-transparent text-white placeholder:text-white/30 
                             resize-none outline-none py-3 px-4 max-h-32
                             focus:ring-0 focus:outline-none"
                  style={{ minHeight: '48px' }}
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 
                             hover:from-violet-500 hover:to-blue-500
                             disabled:opacity-30 disabled:cursor-not-allowed
                             transition-all shadow-lg shadow-violet-500/20
                             hover:shadow-violet-500/40 hover:scale-105"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <p className="text-xs text-white/20 text-center mt-3">
              Enter para enviar · Shift+Enter para nueva línea · Powered by CreativoX AI Engine
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
