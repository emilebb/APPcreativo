/**
 * SERVICIO DE APRENDIZAJE DE ESTILO CREATIVO
 * 
 * Este servicio NO hace el trabajo del usuario, sino que aprende
 * de sus patrones, colores y estética para ofrecer sugerencias personalizadas.
 */

import { getSupabaseClient } from './supabaseClient';

// =====================================================
// TIPOS DE DATOS
// =====================================================

export interface ColorPalette {
  dominant: string[];
  accent: string[];
  distribution: Record<string, number>;
}

export interface CompositionData {
  balance: 'symmetric' | 'asymmetric' | 'radial';
  density: number;
  focal_points: Array<{ x: number; y: number; strength: number }>;
  rule_of_thirds_alignment: number;
}

export interface StrokePatterns {
  avg_width: number;
  pressure_variance: number;
  smoothness: number;
  speed_variance: number;
}

export interface ShapePatterns {
  geometric: number;
  organic: number;
  complexity: number;
  symmetry: number;
}

export interface ProjectStylePattern {
  id?: string;
  user_id: string;
  project_id?: string;
  project_type: 'canvas' | 'moodboard' | 'mindmap';
  color_palette?: ColorPalette;
  composition_data?: CompositionData;
  stroke_patterns?: StrokePatterns;
  shape_patterns?: ShapePatterns;
  style_embedding?: number[];
  tags?: string[];
  confidence_score?: number;
  created_at?: string;
}

export interface StyleSuggestion {
  id?: string;
  user_id: string;
  project_id?: string;
  context_type: 'color_palette' | 'composition' | 'shape' | 'complete_design';
  based_on_patterns?: string[];
  suggestion_data: any;
  thumbnail_url?: string;
  user_feedback?: 'liked' | 'disliked' | 'used' | 'ignored';
  generated_at?: string;
}

// =====================================================
// UTILIDADES DE ANÁLISIS
// =====================================================

export function extractColorPalette(canvasData: any): ColorPalette {
  const colors: Record<string, number> = {};
  
  if (canvasData?.elements) {
    canvasData.elements.forEach((element: any) => {
      const color = element.color || element.stroke || '#000000';
      colors[color] = (colors[color] || 0) + 1;
    });
  }
  
  const sortedColors = Object.entries(colors)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .map(([color]) => color);
  
  return {
    dominant: sortedColors.slice(0, 3),
    accent: sortedColors.slice(3, 6),
    distribution: colors
  };
}

export function analyzeComposition(canvasData: any): CompositionData {
  const elements = canvasData?.elements || [];
  const totalArea = 800 * 600;
  let usedArea = 0;
  
  elements.forEach((element: any) => {
    if (element.width && element.height) {
      usedArea += element.width * element.height;
    }
  });
  
  const density = Math.min(usedArea / totalArea, 1);
  
  const focal_points = elements
    .filter((e: any) => e.x && e.y)
    .slice(0, 3)
    .map((e: any) => ({
      x: e.x,
      y: e.y,
      strength: 0.8
    }));
  
  return {
    balance: density > 0.5 ? 'symmetric' : 'asymmetric',
    density,
    focal_points,
    rule_of_thirds_alignment: 0.6
  };
}

export function analyzeStrokePatterns(canvasData: any): StrokePatterns {
  const elements = canvasData?.elements || [];
  
  const widths = elements
    .filter((e: any) => e.strokeWidth)
    .map((e: any) => e.strokeWidth);
  
  const avg_width = widths.length > 0
    ? widths.reduce((a: number, b: number) => a + b, 0) / widths.length
    : 2;
  
  return {
    avg_width,
    pressure_variance: 0.3,
    smoothness: 0.7,
    speed_variance: 0.4
  };
}

export function analyzeShapePatterns(canvasData: any): ShapePatterns {
  const elements = canvasData?.elements || [];
  
  let geometric = 0;
  let organic = 0;
  
  elements.forEach((element: any) => {
    if (element.type === 'rectangle' || element.type === 'circle') {
      geometric++;
    } else if (element.type === 'path') {
      organic++;
    }
  });
  
  const total = geometric + organic || 1;
  
  return {
    geometric: geometric / total,
    organic: organic / total,
    complexity: 0.5,
    symmetry: 0.6
  };
}

export async function generateStyleEmbedding(pattern: ProjectStylePattern): Promise<number[]> {
  return Array.from({ length: 1536 }, () => Math.random());
}

// =====================================================
// SERVICIO PRINCIPAL
// =====================================================

export const styleLearningService = {
  async analyzeAndSaveProject(
    userId: string,
    projectId: string,
    projectType: 'canvas' | 'moodboard' | 'mindmap',
    projectData: any
  ): Promise<ProjectStylePattern | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const pattern: ProjectStylePattern = {
        user_id: userId,
        project_id: projectId,
        project_type: projectType,
        color_palette: extractColorPalette(projectData),
        composition_data: analyzeComposition(projectData),
        stroke_patterns: projectType === 'canvas' ? analyzeStrokePatterns(projectData) : undefined,
        shape_patterns: analyzeShapePatterns(projectData),
        tags: projectData.tags || [],
        confidence_score: 0.8
      };

      const embedding = await generateStyleEmbedding(pattern);

      const { data, error } = await supabase
        .from('project_style_patterns')
        .insert({
          ...pattern,
          style_embedding: embedding
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving style pattern:', error);
        return null;
      }

      console.log('✅ Style pattern saved:', data.id);
      return data;
    } catch (error) {
      console.error('Error analyzing project:', error);
      return null;
    }
  },

  async getUserStylePatterns(userId: string, limit = 50): Promise<ProjectStylePattern[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('project_style_patterns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error loading style patterns:', error);
      return [];
    }

    return data || [];
  },

  async generateSuggestions(
    userId: string,
    projectId: string,
    contextType: 'color_palette' | 'composition' | 'shape'
  ): Promise<StyleSuggestion[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data: profile } = await supabase
        .from('user_style_profile')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!profile) {
        console.log('No style profile found');
        return [];
      }

      const suggestions: StyleSuggestion[] = [];

      if (contextType === 'color_palette' && profile.dominant_colors) {
        suggestions.push({
          user_id: userId,
          project_id: projectId,
          context_type: 'color_palette',
          suggestion_data: {
            palette: profile.dominant_colors.dominant,
            description: 'Basado en tus colores favoritos'
          }
        });
      }

      if (suggestions.length > 0) {
        const { data, error } = await supabase
          .from('style_suggestions')
          .insert(suggestions)
          .select();

        if (error) {
          console.error('Error saving suggestions:', error);
          return [];
        }

        return data || [];
      }

      return [];
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
  },

  async recordSuggestionFeedback(
    suggestionId: string,
    feedback: 'liked' | 'disliked' | 'used' | 'ignored'
  ): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from('style_suggestions')
      .update({
        user_feedback: feedback,
        feedback_at: new Date().toISOString()
      })
      .eq('id', suggestionId);

    if (error) {
      console.error('Error recording feedback:', error);
      return false;
    }

    console.log('✅ Feedback recorded:', feedback);
    return true;
  }
};

export default styleLearningService;
