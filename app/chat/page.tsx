'use client';

export const dynamic = 'force-dynamic';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import {
  Sparkles,
  User,
  Zap,
  ArrowUp,
} from 'lucide-react';

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
// HELPER: Extract text from message parts
// ============================================================================

type MessagePart = { type: string; text?: string };
type ChatMessage = { id: string; role: string; parts: MessagePart[] };

function getMessageText(message: ChatMessage): string {
  const textPart = message.parts.find(p => p.type === 'text');
  return textPart?.text ?? '';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function ChatContent() {
  const { user, isLoading: authLoading, isAuthChecking } = useAuth();
  const router = useRouter();
  const [input, setInput] = useState('');
  const promptSentRef = useRef(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthChecking && !user) {
      router.push('/login');
    }
  }, [user, isAuthChecking, router]);

  // Mostrar pantalla de carga mientras verificamos autenticación
  if (isAuthChecking) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/50">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/50">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }
  
  const { messages, status, sendMessage } = useChat({
    transport: new TextStreamChatTransport({
      api: '/api/chat',
    }),
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

  // ... rest of the component code (I'll need to find the rest)

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage({ text: input });
      setInput('');
    }
  };
  
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

  // Handle prompt from URL (e.g., from Mindmap)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const prompt = urlParams.get('prompt');
    if (prompt && !promptSentRef.current) {
      promptSentRef.current = true;
      const decodedPrompt = decodeURIComponent(prompt);
      // Small delay to ensure chat is ready
      setTimeout(() => {
        sendMessage({ text: decodedPrompt });
      }, 500);
    }
  }, [sendMessage]);

  // Auto resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

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
            {(messages as ChatMessage[]).map((message) => (
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
                    <p className="text-white/90 text-sm whitespace-pre-wrap">{getMessageText(message)}</p>
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
                      dangerouslySetInnerHTML={{ 
                        __html: getMessageText(message)
                          .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                          .replace(/\*(.+?)\*/g, '<em class="text-white/70">$1</em>')
                          .replace(/\n\n/g, '</p><p class="mt-2 text-white/70">')
                          .replace(/\n/g, '<br/>') 
                      }}
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
            {isLoading && (messages[messages.length - 1] as ChatMessage)?.role === 'user' && (
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
                    if (input.trim() && !isLoading) {
                      const event = new Event('submit', { cancelable: true }) as any;
                      handleSubmit(event);
                    }
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

export default ChatContent;
