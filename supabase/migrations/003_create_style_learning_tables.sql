-- =====================================================
-- FASE 1: SISTEMA DE APRENDIZAJE DE ESTILO CREATIVO
-- =====================================================
-- Este sistema NO hace el trabajo del usuario, sino que
-- aprende de sus patrones, colores y estética para
-- ofrecer sugerencias personalizadas.

-- Habilitar extensión de vectores para embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- 1. TABLA: project_style_patterns
-- Almacena "patrones de estilo" extraídos de proyectos
-- NO guarda imágenes completas, solo características
-- =====================================================
CREATE TABLE IF NOT EXISTS project_style_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Metadatos del proyecto
  project_type TEXT NOT NULL, -- 'canvas', 'moodboard', 'mindmap'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Patrones de color (JSON con paleta dominante)
  color_palette JSONB, -- { "dominant": ["#FF5733", "#3498DB"], "accent": ["#E74C3C"], "distribution": {...} }
  
  -- Patrones de composición
  composition_data JSONB, -- { "balance": "asymmetric", "density": 0.7, "focal_points": [...] }
  
  -- Patrones de trazo (para canvas)
  stroke_patterns JSONB, -- { "avg_width": 2.5, "pressure_variance": 0.3, "smoothness": 0.8 }
  
  -- Patrones de forma
  shape_patterns JSONB, -- { "geometric": 0.6, "organic": 0.4, "complexity": 0.5 }
  
  -- Embedding vectorial (para búsqueda semántica)
  style_embedding vector(1536), -- Vector de 1536 dimensiones (compatible con OpenAI embeddings)
  
  -- Metadatos adicionales
  tags TEXT[], -- Tags del proyecto para contexto
  confidence_score FLOAT DEFAULT 1.0, -- Qué tan representativo es este patrón
  
  CONSTRAINT valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 1)
);

-- Índices para búsqueda eficiente
CREATE INDEX idx_style_patterns_user ON project_style_patterns(user_id);
CREATE INDEX idx_style_patterns_project ON project_style_patterns(project_id);
CREATE INDEX idx_style_patterns_type ON project_style_patterns(project_type);
CREATE INDEX idx_style_patterns_created ON project_style_patterns(created_at DESC);

-- Índice HNSW para búsqueda vectorial rápida
CREATE INDEX idx_style_embedding ON project_style_patterns 
USING hnsw (style_embedding vector_cosine_ops);

-- =====================================================
-- 2. TABLA: user_style_profile
-- Perfil agregado del estilo del usuario
-- Se actualiza periódicamente basándose en project_style_patterns
-- =====================================================
CREATE TABLE IF NOT EXISTS user_style_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Perfil de estilo agregado
  dominant_colors JSONB, -- Colores que el usuario usa más frecuentemente
  preferred_composition JSONB, -- Patrones de composición favoritos
  stroke_signature JSONB, -- "Firma" de trazo del usuario
  shape_preferences JSONB, -- Preferencias de formas
  
  -- Embedding promedio del estilo del usuario
  avg_style_embedding vector(1536),
  
  -- Metadatos
  total_projects_analyzed INTEGER DEFAULT 0,
  last_analysis_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsqueda por usuario
CREATE INDEX idx_user_style_profile_user ON user_style_profile(user_id);

-- =====================================================
-- 3. TABLA: style_suggestions
-- Sugerencias generadas basadas en el estilo del usuario
-- Para el panel lateral de "Inspiración"
-- =====================================================
CREATE TABLE IF NOT EXISTS style_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Contexto de la sugerencia
  context_type TEXT NOT NULL, -- 'color_palette', 'composition', 'shape', 'complete_design'
  based_on_patterns UUID[] DEFAULT '{}', -- IDs de project_style_patterns usados
  
  -- Datos de la sugerencia
  suggestion_data JSONB NOT NULL, -- Datos específicos de la sugerencia
  thumbnail_url TEXT, -- URL de miniatura generada (si aplica)
  
  -- Feedback del usuario
  user_feedback TEXT, -- 'liked', 'disliked', 'used', 'ignored'
  feedback_at TIMESTAMPTZ,
  
  -- Metadatos
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days', -- Sugerencias temporales
  
  CONSTRAINT valid_context_type CHECK (context_type IN ('color_palette', 'composition', 'shape', 'complete_design')),
  CONSTRAINT valid_feedback CHECK (user_feedback IS NULL OR user_feedback IN ('liked', 'disliked', 'used', 'ignored'))
);

-- Índices
CREATE INDEX idx_style_suggestions_user ON style_suggestions(user_id);
CREATE INDEX idx_style_suggestions_project ON style_suggestions(project_id);
CREATE INDEX idx_style_suggestions_generated ON style_suggestions(generated_at DESC);
CREATE INDEX idx_style_suggestions_expires ON style_suggestions(expires_at);

-- =====================================================
-- 4. TABLA: lora_training_queue
-- Cola de trabajos para entrenamiento de modelos LoRA
-- (Fase 2 - preparación)
-- =====================================================
CREATE TABLE IF NOT EXISTS lora_training_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Estado del entrenamiento
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  
  -- Datos del entrenamiento
  training_data_ids UUID[] NOT NULL, -- IDs de project_style_patterns a usar
  model_version TEXT, -- Versión del modelo base
  lora_weights_url TEXT, -- URL donde se guardan los pesos entrenados
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Índices
CREATE INDEX idx_lora_queue_user ON lora_training_queue(user_id);
CREATE INDEX idx_lora_queue_status ON lora_training_queue(status);
CREATE INDEX idx_lora_queue_created ON lora_training_queue(created_at DESC);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- project_style_patterns
ALTER TABLE project_style_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own style patterns"
  ON project_style_patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own style patterns"
  ON project_style_patterns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own style patterns"
  ON project_style_patterns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own style patterns"
  ON project_style_patterns FOR DELETE
  USING (auth.uid() = user_id);

-- user_style_profile
ALTER TABLE user_style_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own style profile"
  ON user_style_profile FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own style profile"
  ON user_style_profile FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own style profile"
  ON user_style_profile FOR UPDATE
  USING (auth.uid() = user_id);

-- style_suggestions
ALTER TABLE style_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own suggestions"
  ON style_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suggestions"
  ON style_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suggestions"
  ON style_suggestions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suggestions"
  ON style_suggestions FOR DELETE
  USING (auth.uid() = user_id);

-- lora_training_queue
ALTER TABLE lora_training_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own training jobs"
  ON lora_training_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own training jobs"
  ON lora_training_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCIONES ÚTILES
-- =====================================================

-- Función para limpiar sugerencias expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_suggestions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM style_suggestions
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para buscar patrones similares (búsqueda vectorial)
CREATE OR REPLACE FUNCTION find_similar_style_patterns(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  target_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  project_id uuid,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    psp.id,
    psp.user_id,
    psp.project_id,
    1 - (psp.style_embedding <=> query_embedding) AS similarity
  FROM project_style_patterns psp
  WHERE 
    (target_user_id IS NULL OR psp.user_id = target_user_id)
    AND (1 - (psp.style_embedding <=> query_embedding)) > match_threshold
  ORDER BY psp.style_embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE project_style_patterns IS 'Almacena patrones de estilo extraídos de proyectos del usuario. NO guarda imágenes completas, solo características vectoriales.';
COMMENT ON TABLE user_style_profile IS 'Perfil agregado del estilo creativo del usuario, actualizado periódicamente.';
COMMENT ON TABLE style_suggestions IS 'Sugerencias generadas basadas en el estilo del usuario para el panel de Inspiración.';
COMMENT ON TABLE lora_training_queue IS 'Cola de trabajos para entrenamiento de modelos LoRA personalizados (Fase 2).';

COMMENT ON COLUMN project_style_patterns.style_embedding IS 'Vector de 1536 dimensiones para búsqueda semántica de estilos similares.';
COMMENT ON COLUMN project_style_patterns.color_palette IS 'Paleta de colores dominantes extraída del proyecto.';
COMMENT ON COLUMN project_style_patterns.composition_data IS 'Datos de composición: balance, densidad, puntos focales.';
COMMENT ON COLUMN project_style_patterns.stroke_patterns IS 'Patrones de trazo: ancho promedio, varianza de presión, suavidad.';
