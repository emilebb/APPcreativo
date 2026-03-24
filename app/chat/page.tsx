"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/authProvider';
import { Send, Sparkles, Loader2, User, Bot, Image, Copy, Check, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageData?: string; // Base64 image if pasted
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
    // Verificar si hay datos del portapapeles
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

          // Convertir imagen a base64
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

          // Mostrar imagen pegada en el chat
          const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: '📷 Imagen pegada',
            timestamp: new Date(),
            imageData,
          };

          setMessages(prev => [...prev, userMessage]);
          setIsAnalyzing(true);

          // Enviar a la API de análisis (que SÍ soporta imágenes)
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

          // Mostrar resultado del análisis
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

  // Registrar el handler de paste
  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  // ============================================================================
  // FORMATEAR RESULTADO DEL ANÁLISIS
  // ============================================================================
  
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

  // ============================================================================
  // COPIAR COLOR AL PORTAPAPELES
  // ============================================================================
  
  const copyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (err) {
      console.error('Error copying color:', err);
    }
  };

  // ============================================================================
  // ENVIAR MENSAJE DE TEXTO
  // ============================================================================
  
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

  // ============================================================================
  // AUTO-RESIZE DEL TEXTAREA
  // ============================================================================
  
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

  // ============================================================================
  // RENDERIZADO
  // ============================================================================
  
  return (
    <div className="flex flex-col h-screen bg-white dark:bg-[#1a1d29]">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-gray-800 bg-white dark:bg-[#252836] px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white">
              Coach Creativo IA
            </h1>
            <p className="text-sm text-neutral-600 dark:text-gray-400">
              Siempre listo para ayudarte
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className="max-w-[85%] rounded-2xl">
                {/* Imagen pegada */}
                {message.imageData && (
                  <div className="mb-2">
                    <img 
                      src={message.imageData} 
                      alt="Imagen pegada"
                      className="max-w-full max-h-64 rounded-lg object-contain"
                    />
                  </div>
                )}
                
                {/* Contenido del mensaje */}
                <div
                  className={`px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white'
                      : 'bg-neutral-100 dark:bg-[#252836] text-neutral-900 dark:text-white border border-neutral-200 dark:border-gray-700'
                  } rounded-2xl ${!message.imageData ? 'rounded-2xl' : 'rounded-tl-sm'}`}
                >
                  {/* Si es análisis con colores, renderizar especial */}
                  {message.isAnalysis && message.content.includes('🎨 **Paleta de Colores:**') ? (
                    <div className="space-y-3">
                      {message.content.split('\n\n').map((paragraph, i) => {
                        if (paragraph.includes('🎨 **Paleta de Colores:**')) {
                          const colors = paragraph.match(/`#[A-Fa-f0-9]{6}`/g) || [];
                          return (
                            <div key={i}>
                              <p className="text-sm mb-2 whitespace-pre-wrap">{paragraph.split('🎨')[0]}</p>
                              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">Paleta de colores:</p>
                                <div className="flex flex-wrap gap-2">
                                  {colors.map((color) => {
                                    const cleanColor = color.replace(/`/g, '');
                                    return (
                                      <button
                                        key={color}
                                        onClick={() => copyColor(cleanColor)}
                                        className="flex items-center gap-2 px-2 py-1 bg-white dark:bg-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-600 hover:scale-105 transition-transform"
                                        title={`Copiar ${cleanColor}`}
                                      >
                                        <div 
                                          className="w-5 h-5 rounded border border-neutral-300 dark:border-neutral-500"
                                          style={{ backgroundColor: cleanColor }}
                                        />
                                        <span className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
                                          {cleanColor}
                                        </span>
                                        {copiedColor === cleanColor ? (
                                          <Check className="w-3 h-3 text-green-500" />
                                        ) : (
                                          <Copy className="w-3 h-3 text-neutral-400" />
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
                          <p key={i} className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                            {paragraph}
                          </p>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  )}
                  
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-white/70' : 'text-neutral-500 dark:text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-neutral-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-neutral-600 dark:text-gray-300" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading para mensajes */}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-neutral-100 dark:bg-[#252836] rounded-2xl px-4 py-3 border border-neutral-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                  <span className="text-sm text-neutral-600 dark:text-gray-400">
                    Pensando...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Loading para análisis de imagen */}
          {isAnalyzing && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-neutral-100 dark:bg-[#252836] rounded-2xl px-4 py-3 border border-neutral-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                  <span className="text-sm text-neutral-600 dark:text-gray-400">
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
      <div className="border-t border-neutral-200 dark:border-gray-800 bg-white dark:bg-[#252836] px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 items-end">
            <div className="flex-1 bg-neutral-100 dark:bg-[#1a1d29] rounded-2xl border border-neutral-200 dark:border-gray-700 focus-within:border-violet-500 dark:focus-within:border-violet-500 transition-colors">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje o pega una imagen..."
                className="w-full bg-transparent px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-gray-500 resize-none outline-none max-h-32"
                rows={1}
                disabled={isLoading || isAnalyzing}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={(!input.trim() || isLoading || isAnalyzing)}
              className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading || isAnalyzing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-neutral-500 dark:text-gray-500">
              Enter para enviar • Ctrl+V para pegar imagen
            </p>
            <div className="flex items-center gap-1 text-xs text-neutral-400">
              <Image className="w-3 h-3" />
              <span>Pega imágenes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
