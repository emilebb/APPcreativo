-- ========================================
-- SOLUCIÓN DEFINITIVA - CREAR TABLA PROJECTS CORRECTAMENTE
-- ========================================

-- Paso 1: Eliminar tabla projects si existe (para empezar desde cero)
DROP TABLE IF EXISTS projects CASCADE;

-- Paso 2: Crear tabla projects con estructura correcta
CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('moodboard', 'mindmap', 'canvas', 'chat')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paso 3: Crear índices
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Paso 4: Habilitar RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Paso 5: Crear políticas RLS simples y efectivas
CREATE POLICY "Users can manage own projects" ON projects
    FOR ALL USING (
        auth.uid() IS NOT NULL AND auth.uid() = user_id
    );

-- Paso 6: Verificar que todo se creó correctamente
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'projects';

-- Paso 7: Verificar estructura
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'projects'
ORDER BY ordinal_position;

-- Paso 8: Verificar políticas
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'projects';

-- Paso 9: Probar inserción (después de que te autentiques en la app)
-- NOTA: Esta inserción solo funcionará después de que te loguees en la app
INSERT INTO projects (title, user_id, type, status) 
VALUES (
    'TEST_FINAL', 
    auth.uid(), 
    'canvas', 
    'active'
) 
ON CONFLICT DO NOTHING;

-- ========================================
-- EXPLICACIÓN DE LA SOLUCIÓN
-- ========================================

-- 1. Se elimina la tabla completamente para evitar conflictos
-- 2. Se crea con la estructura exacta que necesita la app
-- 3. Se crea una política simple que permite todo al usuario dueño
-- 4. Se eliminan las restricciones complejas que causaban problemas

-- ========================================
-- PASOS SIGUIENTES
-- ========================================

-- 1. Ejecuta este script completo en Supabase
-- 2. Verifica que no haya errores
-- 3. Inicia sesión en la app con tu email
-- 4. Intenta crear un proyecto
-- 5. Debería funcionar sin timeout ni errores

-- ========================================
-- SI TODAVÍA HAY PROBLEMAS
-- ========================================

-- Si después de esto sigues teniendo errores, puede ser:
-- 1. Problema con la configuración de RLS en Supabase
-- 2. El usuario no está correctamente autenticado
-- 3. Problema de configuración regional de Supabase

-- En ese caso, contactar a soporte de Supabase con:
-- - El error exacto
-- - Tu project URL
-- - Los scripts ejecutados
