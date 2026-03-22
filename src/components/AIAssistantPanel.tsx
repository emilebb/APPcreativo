"use client";

import { useState } from 'react';
import { Sparkles, Palette, Lightbulb, Image as ImageIcon, Loader2, ChevronDown, ChevronUp, Scan } from 'lucide-react';
import { generateCreativeIdeas, generateColorPalette, suggestLayouts } from '@/lib/aiDesignAssistant';
import type { ColorPalette } from '@/lib/aiDesignAssistant';
import { analyzeImage, imageToBase64 } from '@/lib/imageAnalysis';
import type { ImageAnalysisResult } from '@/lib/imageAnalysis';
import ImageUploader from './ImageUploader';

interface AIAssistantPanelProps {
  projectType: 'canvas' | 'moodboard' | 'mindmap';
  onApplyIdea?: (idea: string) => void;
  onApplyPalette?: (colors: string[]) => void;
  onImageUpload?: (imageData: string, file: File) => void;
}

export default function AIAssistantPanel({
  projectType,
  onApplyIdea,
  onApplyPalette,
  onImageUpload
}: AIAssistantPanelProps) {
  const [activeTab, setActiveTab] = useState<'ideas' | 'colors' | 'images' | 'analyze'>('ideas');
  const [prompt, setPrompt] = useState('');
  const [ideas, setIdeas] = useState<string[]>([]);
  const [palette, setPalette] = useState<ColorPalette | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    ideas: true,
    colors: true,
    layouts: false,
    images: true
  });

  const handleGenerateIdeas = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      const generatedIdeas = await generateCreativeIdeas(prompt, projectType);
      setIdeas(generatedIdeas);
    } catch (error) {
      console.error('Error generating ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePalette = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      const generatedPalette = await generateColorPalette(prompt);
      setPalette(generatedPalette);
    } catch (error) {
      console.error('Error generating palette:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeImage = async (file: File) => {
    setAnalyzingImage(true);
    try {
      const base64 = await imageToBase64(file);
      const analysis = await analyzeImage(base64);
      setImageAnalysis(analysis);
      
      // Aplicar colores automáticamente si hay callback
      if (analysis.colors.length > 0 && onApplyPalette) {
        onApplyPalette(analysis.colors);
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setAnalyzingImage(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const layouts = suggestLayouts(projectType);

  return (
    <div className="w-80 sm:w-96 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 overflow-y-auto max-h-screen">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Asistente IA
          </h2>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveTab('ideas')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'ideas'
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Lightbulb className="w-4 h-4 mx-auto mb-1" />
            Ideas
          </button>
          <button
            onClick={() => setActiveTab('colors')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'colors'
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Palette className="w-4 h-4 mx-auto mb-1" />
            Colores
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'images'
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <ImageIcon className="w-4 h-4 mx-auto mb-1" />
            Subir
          </button>
          <button
            onClick={() => setActiveTab('analyze')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'analyze'
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Scan className="w-4 h-4 mx-auto mb-1" />
            Analizar
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Ideas Tab */}
        {activeTab === 'ideas' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                ¿Qué quieres crear?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej: Un logo minimalista para una cafetería"
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <button
              onClick={handleGenerateIdeas}
              disabled={loading || !prompt.trim()}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generar Ideas
                </>
              )}
            </button>

            {ideas.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Ideas Generadas
                </h3>
                {ideas.map((idea, index) => (
                  <div
                    key={index}
                    className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg group hover:bg-purple-100 dark:hover:bg-purple-900/30 transition cursor-pointer"
                    onClick={() => onApplyIdea?.(idea)}
                  >
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      {idea}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Layouts Sugeridos */}
            {layouts.length > 0 && (
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
                <button
                  onClick={() => toggleSection('layouts')}
                  className="w-full flex items-center justify-between text-sm font-semibold text-neutral-900 dark:text-white mb-2"
                >
                  <span>Layouts Sugeridos</span>
                  {expandedSections.layouts ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                
                {expandedSections.layouts && (
                  <div className="space-y-2">
                    {layouts.map((layout, index) => (
                      <div
                        key={index}
                        className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700"
                      >
                        <h4 className="font-medium text-sm text-neutral-900 dark:text-white mb-1">
                          {layout.name}
                        </h4>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          {layout.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Concepto o mood
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej: Océano tranquilo, energía vibrante"
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleGeneratePalette}
              disabled={loading || !prompt.trim()}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Palette className="w-4 h-4" />
                  Generar Paleta
                </>
              )}
            </button>

            {palette && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
                    {palette.name}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                    {palette.mood}
                  </p>
                </div>

                <div className="flex gap-2">
                  {palette.colors.map((color, index) => (
                    <div
                      key={index}
                      className="flex-1 group cursor-pointer"
                      onClick={() => navigator.clipboard.writeText(color)}
                      title={`Copiar ${color}`}
                    >
                      <div
                        className="w-full h-16 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 group-hover:scale-105 transition"
                        style={{ backgroundColor: color }}
                      />
                      <p className="text-xs text-center mt-1 text-neutral-600 dark:text-neutral-400 font-mono">
                        {color}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onApplyPalette?.(palette.colors)}
                  className="w-full px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition"
                >
                  Aplicar Paleta
                </button>

                <p className="text-xs text-neutral-500 dark:text-neutral-500 italic">
                  {palette.usage}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Images Tab */}
        {activeTab === 'images' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                Subir desde Galería
              </h3>
              <ImageUploader
                onImageSelect={(imageData, file) => {
                  onImageUpload?.(imageData, file);
                }}
                maxSizeMB={5}
              />
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                💡 <strong>Tip:</strong> Sube imágenes de referencia para inspirarte o úsalas directamente en tu diseño.
              </p>
            </div>
          </div>
        )}

        {/* Analyze Tab */}
        {activeTab === 'analyze' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                Analizar Imagen con IA
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                Sube una imagen y la IA te dará insights sobre colores, estilo, mood y sugerencias creativas.
              </p>
              <ImageUploader
                onImageSelect={(imageData, file) => {
                  handleAnalyzeImage(file);
                }}
                maxSizeMB={5}
              />
            </div>

            {analyzingImage && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Analizando imagen...</p>
                </div>
              </div>
            )}

            {imageAnalysis && !analyzingImage && (
              <div className="space-y-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
                    📸 Análisis Completo
                  </h4>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300">
                    {imageAnalysis.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                    🎨 Colores Dominantes
                  </h4>
                  <div className="flex gap-2">
                    {imageAnalysis.colors.map((color, index) => (
                      <div
                        key={index}
                        className="flex-1 cursor-pointer group"
                        onClick={() => navigator.clipboard.writeText(color)}
                        title={`Copiar ${color}`}
                      >
                        <div
                          className="w-full h-12 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 group-hover:scale-105 transition"
                          style={{ backgroundColor: color }}
                        />
                        <p className="text-xs text-center mt-1 text-neutral-600 dark:text-neutral-400 font-mono">
                          {color.slice(0, 7)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 mb-1">Estilo</p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {imageAnalysis.style}
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 mb-1">Mood</p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {imageAnalysis.mood}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                    💡 Sugerencias Creativas
                  </h4>
                  <div className="space-y-2">
                    {imageAnalysis.suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-xs text-neutral-700 dark:text-neutral-300"
                      >
                        {index + 1}. {suggestion}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                    🔍 Elementos Detectados
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {imageAnalysis.elements.map((element, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium"
                      >
                        {element}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onApplyPalette?.(imageAnalysis.colors)}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
                >
                  Aplicar Colores al Proyecto
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
