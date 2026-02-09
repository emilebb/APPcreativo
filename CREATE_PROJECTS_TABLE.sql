-- ========================================
-- CREAR TABLA PROJECTS EN SUPABASE
-- ========================================

-- Ejecuta este SQL en tu dashboard de Supabase:
-- 1. Ve a supabase.com
-- 2. Selecciona tu proyecto
-- 3. Ve a "SQL Editor"
-- 4. Pega y ejecuta este código

-- Crear la tabla projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('moodboard', 'mindmap', 'canvas', 'chat')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);

-- Crear política de seguridad (RLS - Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Permitir que los usuarios solo vean sus propios proyectos
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

-- Permitir que los usuarios solo inserten sus propios proyectos
CREATE POLICY "Users can insert own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permitir que los usuarios solo actualicen sus propios proyectos
CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

-- Permitir que los usuarios solo eliminen sus propios proyectos
CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- VERIFICACIÓN
-- ========================================

-- Para verificar que todo se creó correctamente, ejecuta:
SELECT * FROM projects LIMIT 1;

-- Deberías ver la estructura de la tabla sin errores.

-- ========================================
-- NOTAS IMPORTANTES
-- ========================================

-- 1. Reemplaza 'your-project-id' con el ID real de tu proyecto en auth.users
-- 2. Si ya tienes datos en projects, considera hacer un backup primero
-- 3. Esta tabla incluye Row Level Security para mayor seguridad
-- 4. Los índices mejoran el rendimiento de consultas

-- ========================================
-- TROUBLESHOOTING
-- ========================================

-- Si obtienes errores de permisos, ejecuta:
-- DROP POLICY IF EXISTS "Users can view own projects" ON projects;
-- DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
-- DROP POLICY IF EXISTS "Users can update own projects" ON projects;
-- DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
-- Luego vuelve a ejecutar las políticas CREATE POLICY arriba

-- ========================================
-- LISTO PARA USAR LA APP
-- ========================================

-- Una vez creada la tabla, la aplicación debería:
-- ✅ Crear proyectos sin errores
-- ✅ Guardar en Supabase automáticamente
-- ✅ Mostrar proyectos en el sidebar
-- ✅ Permitir edición y eliminación

-- ¡Tu aplicación CreationX estará completamente funcional! 🚀
