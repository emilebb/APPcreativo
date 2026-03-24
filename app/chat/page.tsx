'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  Loader2,
  User,
  Bot,
  Image as ImageIcon,
  Copy,
  Check,
  AlertTriangle,
  X,
  Wand2,
} from 'lucide-react';
import QuickPrompts from '@/components/chat/QuickPrompts';
import CodeBlock from '@/components/chat/CodeBlock';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

interface CodePart {
  type: 'text' | 'code';
  content: string;
  language?: string;
}

export default function ChatPage() {
  const [hardFeedback, setHardFeedback] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll al final
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Manejar selección de imagen
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setSelectedImage(base64);
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Eliminar imagen seleccionada
  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Enviar mensaje
  const sendMessage = async (content: string, imageData?: string | null) => {
    if (!content.trim() && !imageData) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim() || 'Analiza esta imagen:',
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    removeSelectedImage();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            {
              role: 'user',
              content: content.trim() || 'Analiza esta imagen:',
              ...(imageData && { imageData }),
            },
          ],
          hardFeedback,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || data.error || 'Error al obtener respuesta',
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input, selectedImage);
  };

  // Manejar prompt rápido
  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  // Copiar mensaje
  const copyMessage = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Detectar bloques de código
  const detectCodeBlocks = (content: string): CodePart[] => {
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: CodePart[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
      }
      parts.push({
        type: 'code',
        content: match[2].trim(),
        language: match[1] || 'text',
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({ type: 'text', content: content.slice(lastIndex) });
    }

    return parts.length > 0 ? parts : [{ type: 'text', content }];
  };

  // Renderizar contenido del mensaje
  const renderMessageContent = (content: string) => {
    const parts = detectCodeBlocks(content);

    return parts.map((part, idx) => {
      if (part.type === 'code') {
        return (
          <div key={idx} className="my-3">
            <CodeBlock language={part.language || 'text'} code={part.content} />
          </div>
        );
      }

      let text = part.content;
      text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
      text = text.replace(/^\d+\.\s/gm, '<br/>$&');
      text = text.replace(/^-\s/gm, '<br/>• ');

      return (
        <span
          key={idx}
          className="whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar de Prompts Rápidos */}
      <aside className="w-72 border-r border-white/10 bg-white/[0.02] p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white">Creative Coach</h2>
            <p className="text-xs text-white/50">Coach Creativo IA</p>
          </div>
        </div>

        {/* Toggle Feedback Duro */}
        <div className="mb-6">
          <button
            onClick={() => setHardFeedback(!hardFeedback)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 ${
              hardFeedback
                ? 'bg-red-500/20 border-red-500/40 text-red-300'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${hardFeedback ? 'text-red-400' : ''}`} />
              <span className="text-sm font-medium">Feedback Duro</span>
            </div>
            <div
              className={`w-10 h-5 rounded-full transition-colors duration-300 relative ${
                hardFeedback ? 'bg-red-500' : 'bg-white/20'
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                  hardFeedback ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </div>
          </button>
          {hardFeedback && (
            <p className="text-xs text-red-400/70 mt-2 px-1">
              ⚠️ El Coach será más exigente y directo
            </p>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="flex-1">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
            Prompts Rápidos
          </h3>
          <QuickPrompts onSelectPrompt={handleQuickPrompt} isDisabled={isLoading} />
        </div>

        {/* Info */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-white/30 text-center">
            💡 Pega una imagen para análisis visual
          </p>
        </div>
      </aside>

      {/* Área principal del chat */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="px-6 py-4 border-b border-white/10 bg-white/[0.02] backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#050505]" />
            </div>
            <div>
              <h1 className="font-bold text-white">CreativoX AI</h1>
              <p className="text-sm text-white/50">
                {hardFeedback ? '🔥 Modo Feedback Duro activo' : 'Coach Creativo Inteligente'}
              </p>
            </div>
          </div>
        </header>

        {/* Contenedor de mensajes con efecto de brillo */}
        <div
          className={`flex-1 overflow-y-auto p-6 relative transition-all duration-500 ${
            isLoading ? 'shadow-[inset_0_0_60px_-15px_rgba(139,92,246,0.3)]' : ''
          }`}
        >
          {/* Efecto de brillo animado durante carga */}
          {isLoading && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/5 to-transparent animate-pulse" />
            </div>
          )}

          {/* Mensajes */}
          <div className="max-w-4xl mx-auto space-y-6">
            <AnimatePresence mode="popLayout">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-violet-500/20 to-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                    <Sparkles className="w-10 h-10 text-violet-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    ¡Hola! Soy CreativoX AI 👋
                  </h2>
                  <p className="text-white/50 max-w-md mx-auto">
                    Tu coach creativo con IA. Estoy aquí para ayudarte a superar bloqueos,
                    generar ideas increíbles y llevar tus proyectos al siguiente nivel.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 mt-8">
                    {[
                      '🧠 Superar bloqueos',
                      '💡 Generar ideas',
                      '📊 Estructurar proyectos',
                      '🎨 Feedback visual',
                    ].map((item, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-white/5 rounded-full text-sm text-white/60 border border-white/10"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-4 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {/* Avatar IA */}
                    {message.role === 'assistant' && (
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}

                    {/* Contenido del mensaje */}
                    <div
                      className={`max-w-[70%] rounded-2xl px-5 py-4 relative group ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-violet-600 to-blue-600 text-white'
                          : 'bg-white/5 border border-white/10 backdrop-blur-sm text-white/90'
                      }`}
                    >
                      {renderMessageContent(message.content)}

                      {/* Botón copiar */}
                      <button
                        onClick={() => copyMessage(message.content, message.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg 
                                   opacity-0 group-hover:opacity-100 transition-opacity
                                   hover:bg-white/10"
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-white/40" />
                        )}
                      </button>
                    </div>

                    {/* Avatar Usuario */}
                    {message.role === 'user' && (
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white/70" />
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>

            {/* Indicador de escritura */}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl px-5 py-4">
                  <div className="flex items-center gap-2 text-white/50">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">
                      {hardFeedback ? 'Analizando críticamente...' : 'Pensando...'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Preview de imagen seleccionada */}
        <AnimatePresence>
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 py-3 border-t border-white/10 bg-white/[0.02]"
            >
              <div className="max-w-4xl mx-auto flex items-center gap-4">
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-20 w-auto rounded-lg border border-white/10"
                  />
                  <button
                    onClick={removeSelectedImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                <p className="text-sm text-white/50">📎 Imagen lista para enviar</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input del chat */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] backdrop-blur-sm">
          <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto">
            <div className="relative flex items-end gap-3 bg-white/5 rounded-2xl border border-white/10 p-2 focus-within:border-violet-500/50 focus-within:bg-white/[0.07] transition-all">
              {/* Botón de imagen */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-3 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <ImageIcon className="w-5 h-5 text-white/60" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              {/* Input de texto */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleFormSubmit(e);
                  }
                }}
                placeholder={
                  hardFeedback
                    ? 'Pregúntame algo y prepara tu ego...'
                    : 'Escribe tu mensaje o pega una imagen...'
                }
                rows={1}
                className="flex-1 bg-transparent text-white placeholder:text-white/30 
                           resize-none outline-none py-3 px-2 max-h-32"
                style={{ minHeight: '48px' }}
              />

              {/* Botón enviar */}
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && !selectedImage)}
                className="p-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 
                           hover:from-violet-500 hover:to-blue-500
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all shadow-lg shadow-violet-500/20"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            <p className="text-xs text-white/30 text-center mt-2">
              Enter para enviar · Shift+Enter para nueva línea · Adjunta imágenes con el botón
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
