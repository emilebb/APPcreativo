"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/authProvider';
import { Send, Sparkles, Loader2, User, Bot, Image, Copy, Check } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageData?: string;
  isAnalysis?: boolean;
}

interface AnalysisResult {
  description: string;
  colors: string[];
  style: string;
  mood: string;
  suggestions: string[];
  elements: string[];
}

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! 👋 Soy tu Coach Creativo con IA. Estoy aquí para ayudarte a superar bloqueos creativos, generar ideas increíbles y llevar tus proyectos al siguiente nivel.\n\n💡 Puedes escribirme o **pegar una imagen** para que la analice.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ============================================================================
  // MANEJO DE PEGADO DE IMÁGENES
  // ============================================================================
  
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) {
      console.log('No clipboard data available');
      return;
    }

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        
        try {
          const file = item.getAsFile();
          if (!file) {
            console.log('Could not get file from clipboard');
            continue;
          }

          const imageData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Error reading image'));
            reader.readAsDataURL(file);
          });
          
          if (!imageData) {
            console.log('No image data from reader');
            continue;
          }

          const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: '📷 Imagen pegada',
            timestamp: new Date(),
            imageData,
          };

          setMessages(prev => [...prev, userMessage]);
          setIsAnalyzing(true);

          const response = await fetch('/api/analyze-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageData }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} - ${errorText}`);
          }

          const analysis: AnalysisResult = await response.json();
          const analysisContent = formatAnalysisResult(analysis);
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: analysisContent,
            timestamp: new Date(),
            isAnalysis: true,
          };

          setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
          console.error('Error analyzing image:', error);
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `❌ No pude analizar la imagen.\n\nPosibles razones:\n• La imagen es muy grande\n• El formato no es compatible\n• Error del servidor\n\nIntenta con otra imagen o usa el botón "Subir" en el panel lateral.`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
        } finally {
          setIsAnalyzing(false);
        }
        
        break;
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const formatAnalysisResult = (analysis: AnalysisResult): string => {
    return `📊 **Análisis de Imagen**

**Descripción:** ${analysis.description}

🎨 **Paleta de Colores:**
${analysis.colors.map(c => `• \`${c}\``).join('\n')}

**Estilo:** ${analysis.style}
**Mood:** ${analysis.mood}

✨ **Sugerencias:**
${analysis.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

🏷️ **Elementos:** ${analysis.elements.join(', ')}`;
  };

  const copyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (err) {
      console.error('Error copying color:', err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })).concat([{ role: 'user', content: input }])
        })
      });

      if (!response.ok) throw new Error('Error en la respuesta');

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || 'Lo siento, no pude generar una respuesta.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [input]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,transparent_40%,rgba(255,255,255,0.015)_40%)] bg-[length:20px_20px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-white/5 backdrop-blur-xl bg-white/5 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-2xl blur-lg opacity-50" />
            <div className="relative w-12 h-12 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-violet-200 to-cyan-200 bg-clip-text text-transparent">
              Coach Creativo IA
            </h1>
            <p className="text-sm text-neutral-400">
              Siempre listo para ayudarte
            </p>
          </div>
          <div className="ml-auto">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-500/30 text-violet-300">
              Premium
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl blur-md opacity-50" />
                    <div className="relative w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="max-w-[80%]">
                {/* Image paste preview */}
                {message.imageData && (
                  <div className="mb-3">
                    <img 
                      src={message.imageData} 
                      alt="Imagen pegada"
                      className="max-w-full max-h-64 rounded-xl object-contain border border-white/10"
                    />
                  </div>
                )}
                
                {/* Message bubble with gradient for assistant */}
                <div
                  className={`relative ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                      : 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10'
                  } rounded-2xl px-5 py-4 ${!message.imageData ? '' : 'rounded-tl-sm'}`}
                >
                  {/* Gradient glow for assistant messages */}
                  {message.role === 'assistant' && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/5 to-cyan-500/5 pointer-events-none" />
                  )}
                  
                  <div className="relative z-10">
                    {/* Analysis with colors */}
                    {message.isAnalysis && message.content.includes('🎨 **Paleta de Colores:**') ? (
                      <div className="space-y-4">
                        {message.content.split('\n\n').map((paragraph, i) => {
                          if (paragraph.includes('🎨 **Paleta de Colores:**')) {
                            const colors = paragraph.match(/`#[A-Fa-f0-9]{6}`/g) || [];
                            return (
                              <div key={i}>
                                <p className="text-sm text-white/90 mb-3 whitespace-pre-wrap leading-relaxed">{paragraph.split('🎨')[0]}</p>
                                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                                  <p className="text-xs font-medium text-violet-300 mb-3 uppercase tracking-wider">Paleta de colores</p>
                                  <div className="flex flex-wrap gap-3">
                                    {colors.map((color) => {
                                      const cleanColor = color.replace(/`/g, '');
                                      return (
                                        <button
                                          key={color}
                                          onClick={() => copyColor(cleanColor)}
                                          className="group flex items-center gap-2 px-3 py-2 backdrop-blur-xl bg-white/5 rounded-lg border border-white/10 hover:border-violet-500/50 transition-all"
                                          title={`Copiar ${cleanColor}`}
                                        >
                                          <div 
                                            className="w-6 h-6 rounded-lg shadow-lg"
                                            style={{ backgroundColor: cleanColor }}
                                          />
                                          <span className="text-sm font-mono text-white/80 group-hover:text-white transition-colors">
                                            {cleanColor}
                                          </span>
                                          {copiedColor === cleanColor ? (
                                            <Check className="w-4 h-4 text-emerald-400" />
                                          ) : (
                                            <Copy className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                                {paragraph.split('🎨')[1]?.replace('**Paleta de Colores:**', '')}
                              </div>
                            );
                          }
                          return (
                            <p key={i} className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-white/90">
                              {paragraph}
                            </p>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-white/90">
                        {message.content}
                      </p>
                    )}
                    
                    <p className={`text-xs mt-3 ${
                      message.role === 'user' ? 'text-white/60' : 'text-white/40'
                    }`}>
                      {message.timestamp.toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 mt-2">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-white/70" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading state */}
          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl blur-md opacity-50" />
                  <div className="relative w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-white/60 italic">
                    Pensando...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Image analysis loading */}
          {isAnalyzing && (
            <div className="flex gap-4 justify-start">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl blur-md opacity-50" />
                  <div className="relative w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                  <span className="text-sm text-white/60">
                    Analizando imagen...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="relative z-10 border-t border-white/5 backdrop-blur-xl bg-white/5 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl focus-within:border-violet-500/50 transition-colors">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje o pega una imagen..."
                  className="w-full bg-transparent px-5 py-4 text-white placeholder-white/40 resize-none outline-none max-h-32"
                  rows={1}
                  disabled={isLoading || isAnalyzing}
                />
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={(!input.trim() || isLoading || isAnalyzing)}
              className="relative group flex-shrink-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-12 h-12 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all group-hover:scale-105">
                {isLoading || isAnalyzing ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </div>
            </button>
          </div>
          <div className="flex items-center justify-between mt-3 px-1">
            <p className="text-xs text-white/40">
              Enter para enviar • Ctrl+V para pegar imagen
            </p>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Image className="w-3.5 h-3.5" />
              <span>Pega imágenes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
