/**
 * Panel de Inspiración - Muestra sugerencias basadas en el estilo del usuario
 * 
 * Este panel NO hace el trabajo del usuario, sino que ofrece sugerencias
 * personalizadas basadas en su "ADN creativo".
 */

'use client';

import { useState } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, Check, X } from 'lucide-react';
import { useStyleLearning } from '@/hooks/useStyleLearning';

interface InspirationPanelProps {
  projectId: string;
  onApplySuggestion?: (suggestion: any) => void;
}

export function InspirationPanel({ projectId, onApplySuggestion }: InspirationPanelProps) {
  const { suggestions, loading, generateSuggestions, recordFeedback } = useStyleLearning(projectId);
  const [activeTab, setActiveTab] = useState<'colors' | 'composition' | 'shapes'>('colors');

  const handleGenerateSuggestions = async () => {
    const contextMap = {
      colors: 'color_palette' as const,
      composition: 'composition' as const,
      shapes: 'shape' as const
    };
    
    await generateSuggestions(contextMap[activeTab]);
  };

  const handleFeedback = async (suggestionId: string, feedback: 'liked' | 'disliked') => {
    await recordFeedback(suggestionId, feedback);
  };

  const handleApply = async (suggestion: any) => {
    await recordFeedback(suggestion.id, 'used');
    onApplySuggestion?.(suggestion);
  };

  const filteredSuggestions = suggestions.filter(s => {
    if (activeTab === 'colors') return s.context_type === 'color_palette';
    if (activeTab === 'composition') return s.context_type === 'composition';
    if (activeTab === 'shapes') return s.context_type === 'shape';
    return false;
  });

  return (
    <div className="w-80 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Inspiración
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sugerencias basadas en tu estilo único
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('colors')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'colors'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Colores
        </button>
        <button
          onClick={() => setActiveTab('composition')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'composition'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Composición
        </button>
        <button
          onClick={() => setActiveTab('shapes')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'shapes'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Formas
        </button>
      </div>

      {/* Generate Button */}
      <div className="p-4">
        <button
          onClick={handleGenerateSuggestions}
          disabled={loading}
          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generando...' : 'Generar Sugerencias'}
        </button>
      </div>

      {/* Suggestions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredSuggestions.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Haz click en "Generar Sugerencias" para ver ideas basadas en tu estilo
            </p>
          </div>
        ) : (
          filteredSuggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onLike={() => handleFeedback(suggestion.id!, 'liked')}
              onDislike={() => handleFeedback(suggestion.id!, 'disliked')}
              onApply={() => handleApply(suggestion)}
            />
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Las sugerencias se basan en tus proyectos anteriores
        </p>
      </div>
    </div>
  );
}

interface SuggestionCardProps {
  suggestion: any;
  onLike: () => void;
  onDislike: () => void;
  onApply: () => void;
}

function SuggestionCard({ suggestion, onLike, onDislike, onApply }: SuggestionCardProps) {
  const { context_type, suggestion_data, user_feedback } = suggestion;

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
      {/* Color Palette Suggestion */}
      {context_type === 'color_palette' && (
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {suggestion_data.description}
          </p>
          <div className="flex gap-2">
            {suggestion_data.palette?.map((color: string, index: number) => (
              <div
                key={index}
                className="w-10 h-10 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Composition Suggestion */}
      {context_type === 'composition' && (
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Composición sugerida
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {suggestion_data.description || 'Basado en tus proyectos anteriores'}
          </p>
        </div>
      )}

      {/* Shape Suggestion */}
      {context_type === 'shape' && (
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Formas sugeridas
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {suggestion_data.description || 'Formas que complementan tu estilo'}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={onApply}
          className="flex-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors flex items-center justify-center gap-1"
        >
          <Check className="w-4 h-4" />
          Aplicar
        </button>
        <button
          onClick={onLike}
          className={`p-1.5 rounded-md transition-colors ${
            user_feedback === 'liked'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          title="Me gusta"
        >
          <ThumbsUp className="w-4 h-4" />
        </button>
        <button
          onClick={onDislike}
          className={`p-1.5 rounded-md transition-colors ${
            user_feedback === 'disliked'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          title="No me gusta"
        >
          <ThumbsDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default InspirationPanel;
