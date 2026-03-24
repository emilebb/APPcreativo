'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  User,
  Zap,
  ArrowUp,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

// ============================================================================
// TYPEWRITER COMPONENT
// ============================================================================

function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 10); // Velocidad de escritura
      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, isComplete, onComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  // Render markdown simple
  const renderMarkdown = (content: string) => {
    let html = content;
    
    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold text-white mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-white mt-4 mb-2">$1</h2>');
    
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
    
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em class="text-white/70">$1</em>');
    
    // Lists
    html = html.replace(/^- (.+)$/gm, '<li class="ml-4 text-white/70 list-disc my-1">$1</li>');
    html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-white/70 list-decimal my-1">$1</li>');
    
    // Code inline
    html = html.replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 bg-white/10 rounded text-violet-300 font-mono text-sm">$1</code>');
    
    // Arrow bullets
    html = html.replace(/^→ (.+)$/gm, '<div class="flex items-center gap-2 ml-4 my-1"><span class="text-violet-400">→</span><span class="text-white/70">$1</span></div>');
    
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p class="mt-2">');
    html = html.replace(/\n/g, '<br/>');
    
    return html;
  };

  return (
    <div 
      className="prose prose-invert prose-sm max-w-none
        [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-4 [&_h2]:mb-2
        [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-4 [&_h3]:mb-2
        [&_strong]:text-white [&_strong]:font-semibold
        [&_em]:text-white/70
        [&_li]:text-white/70 [&_li]:my-1
        [&_p]:text-white/70 [&_p]:my-1
        [&_code]:bg-white/10 [&_code]:text-violet-300 [&_code]:font-mono [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(displayedText) }}
    />
  );
}

// ============================================================================
// TYPING INDICATOR
// ============================================================================

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 bg-violet-400/60 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
      <span className="text-sm text-white/40 ml-2">CreativoX está pensando...</span>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CreativeCoachChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `¡Hola! 👋 Soy **CreativoX AI**, tu Coach Creativo Inteligente.

Estoy aquí para ayudarte a:
- 🎨 Diseñar y crear con claridad
- 💡 Generar ideas innovadoras
- 🧠 Superar bloqueos creativos
- 📊 Estructurar tus proyectos

¿Cómo puedo ayudarte hoy?`,
      timestamp: new Date(),
    },
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Send message
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

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
        isStreaming: true,
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

  // Handle stream complete
  const handleStreamComplete = (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, isStreaming: false } : m
    ));
  };

  return (
    <div className="h-screen bg-[#050505] flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
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
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto"
      >
        <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-4 mb-6 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* AI Avatar */}
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Message Content */}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-white/[0.04] border border-white/[0.06]'
                      : 'bg-transparent'
                  }`}
                >
                  {message.role === 'user' ? (
                    <p className="text-white/90 text-sm whitespace-pre-wrap">{message.content}</p>
                  ) : message.isStreaming ? (
                    <TypewriterText 
                      text={message.content} 
                      onComplete={() => handleStreamComplete(message.id)}
                    />
                  ) : (
                    <div 
                      className="prose prose-invert prose-sm max-w-none
                        [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-4 [&_h2]:mb-2
                        [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-4 [&_h3]:mb-2
                        [&_strong]:text-white [&_strong]:font-semibold
                        [&_em]:text-white/70
                        [&_li]:text-white/70 [&_li]:my-1
                        [&_p]:text-white/70 [&_p]:my-1
                        [&_code]:bg-white/10 [&_code]:text-violet-300 [&_code]:font-mono [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded"
                      dangerouslySetInnerHTML={{ __html: message.content.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>').replace(/\*(.+?)\*/g, '<em class="text-white/70">$1</em>').replace(/\n\n/g, '</p><p class="mt-2">').replace(/\n/g, '<br/>') }}
                    />
                  )}
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
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-4 mb-6"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="bg-transparent rounded-2xl">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-white/[0.06] bg-[#050505]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-end bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden focus-within:border-violet-500/30 transition-colors">
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
                placeholder="Pregúntale algo a CreativoX..."
                rows={1}
                className="flex-1 bg-transparent text-white placeholder:text-white/30 
                           resize-none outline-none py-3 px-4 max-h-48
                           text-sm"
                style={{ minHeight: '48px' }}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`m-2 p-2 rounded-lg transition-all flex-shrink-0
                  ${input.trim() 
                    ? 'bg-white text-black hover:bg-white/90' 
                    : 'bg-white/10 text-white/30'
                  }
                  disabled:cursor-not-allowed`}
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
