-- ========================================
-- DIAGNÓSTICO DE SUPABASE
-- ========================================

-- Ejecuta este script en el SQL Editor de Supabase
-- para diagnosticar problemas de conexión y permisos

-- 1. Verificar si la tabla projects existe
SELECT 
    table_name,
    table_type,
    is_insertable_into,
    is_typed
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'projects';

-- 2. Verificar estructura de la tabla projects
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'projects'
ORDER BY ordinal_position;

-- 3. Verificar políticas RLS en la tabla projects
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'projects';

-- 4. Verificar si RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'projects';

-- 5. Verificar usuario actual y sus permisos
SELECT 
    auth.uid() as current_user_id,
    auth.jwt() ->> 'email' as current_email,
    auth.role() as current_role;

-- 6. Intentar inserción de prueba (debería funcionar)
INSERT INTO projects (title, user_id, type, status) 
VALUES (
    'TEST_DIAGNOSTIC', 
    auth.uid(), 
    'canvas', 
    'active'
) 
ON CONFLICT DO NOTHING;

-- 7. Verificar si la inserción de prueba funcionó
SELECT * FROM projects 
WHERE title = 'TEST_DIAGNOSTIC' AND user_id = auth.uid();

-- 8. Limpiar prueba
DELETE FROM projects 
WHERE title = 'TEST_DIAGNOSTIC' AND user_id = auth.uid();

-- ========================================
-- RESULTADOS ESPERADOS
-- ========================================

-- Si todo está correcto, deberías ver:
-- 1. La tabla projects existe
-- 2. Todas las columnas necesarias están presentes
-- 3. Las políticas RLS están configuradas
-- 4. rowsecurity = true
-- 5. El usuario actual tiene un ID válido
-- 6. La inserción de prueba funciona
-- 7. La consulta y eliminación funcionan

-- ========================================
-- PROBLEMAS COMUNES Y SOLUCIONES
-- ========================================

-- PROBLEMA 1: "Table projects doesn't exist"
-- SOLUCIÓN: Ejecuta el script CREATE_PROJECTS_TABLE.sql

-- PROBLEMA 2: "Permission denied for table projects"
-- SOLUCIÓN: Verifica que las políticas RLS estén creadas correctamente

-- PROBLEMA 3: "null value in column user_id violates not-null constraint"
-- SOLUCIÓN: El usuario no está autenticado correctamente

-- PROBLEMA 4: "timeout" o "connection refused"
-- SOLUCIÓN: Problemas de red o configuración de Supabase

-- ========================================
-- PASOS SIGUIENTES
-- ========================================

-- 1. Ejecuta este diagnóstico
-- 2. Revisa los resultados
-- 3. Si hay errores, corrige según las soluciones
-- 4. Vuelve a probar la aplicación
-- 5. Si persiste, contacta a soporte de Supabase
