/**
 * Hook React para el Sistema de Aprendizaje de Estilo
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/authProvider';
import styleLearningService, { 
  ProjectStylePattern, 
  StyleSuggestion 
} from '@/lib/styleLearningService';

export function useStyleLearning(projectId?: string) {
  const { user } = useAuth();
  const [patterns, setPatterns] = useState<ProjectStylePattern[]>([]);
  const [suggestions, setSuggestions] = useState<StyleSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Cargar patrones del usuario
  const loadPatterns = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const userPatterns = await getStylePatterns(user.id);
      setPatterns(userPatterns);
    } catch (error) {
      console.error('Error loading patterns:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Analizar y guardar proyecto
  const analyzeProject = useCallback(async (
    projectType: 'canvas' | 'moodboard' | 'mindmap',
    projectData: any
  ) => {
    if (!user?.id || !projectId) return null;

    setAnalyzing(true);
    try {
      const pattern = await analyzeProjectStyle(user.id, projectType, projectData);
      const pattern = await styleLearningService.analyzeAndSaveProject(
        session.user.id,
        projectId,
        projectType,
        projectData
      );

      if (pattern) {
        setPatterns(prev => [pattern, ...prev]);
        console.log('🎨 Proyecto analizado y patrón guardado');
      }

      return pattern;
    } catch (error) {
      console.error('Error analyzing project:', error);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, [session?.user?.id, projectId]);

  // Generar sugerencias
  const generateSuggestions = useCallback(async (
    contextType: 'color_palette' | 'composition' | 'shape'
  ) => {
    if (!session?.user?.id || !projectId) return [];

    try {
      const newSuggestions = await styleLearningService.generateSuggestions(
        session.user.id,
        projectId,
        contextType
      );

      setSuggestions(prev => [...newSuggestions, ...prev]);
      return newSuggestions;
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
  }, [session?.user?.id, projectId]);

  // Registrar feedback
  const recordFeedback = useCallback(async (
    suggestionId: string,
    feedback: 'liked' | 'disliked' | 'used' | 'ignored'
  ) => {
    const success = await styleLearningService.recordSuggestionFeedback(
      suggestionId,
      feedback
    );

    if (success) {
      setSuggestions(prev =>
        prev.map(s =>
          s.id === suggestionId
            ? { ...s, user_feedback: feedback }
            : s
        )
      );
    }

    return success;
  }, []);

  // Cargar patrones al montar
  useEffect(() => {
    if (session?.user?.id) {
      loadPatterns();
    }
  }, [session?.user?.id, loadPatterns]);

  return {
    patterns,
    suggestions,
    loading,
    analyzing,
    analyzeProject,
    generateSuggestions,
    recordFeedback,
    reload: loadPatterns
  };
}
