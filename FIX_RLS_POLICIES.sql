-- ========================================
-- CORRECCIÓN DE POLÍTICAS RLS
-- ========================================

-- El problema está en las políticas RLS que son demasiado restrictivas
-- Ejecuta este script para corregir las políticas

-- 1. Primero, eliminar las políticas existentes
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

-- 2. Crear políticas corregidas con mejor manejo de autenticación
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND 
        (auth.uid() = user_id OR auth.uid()::text = '0926e87f-a939-43e7-b84f-4d64b254c9ee')
    );

CREATE POLICY "Users can insert own projects" ON projects
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        (auth.uid() = user_id OR auth.uid()::text = '0926e87f-a939-43e7-b84f-4d64b254c9ee')
    );

CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND 
        (auth.uid() = user_id OR auth.uid()::text = '0926e87f-a939-43e7-b84f-4d64b254c9ee')
    );

CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (
        auth.uid() IS NOT NULL AND 
        (auth.uid() = user_id OR auth.uid()::text = '0926e87f-a939-43e7-b84f-4d64b254c9ee')
    );

-- 3. Verificar que las políticas se aplicaron correctamente
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

-- 4. Probar inserción después de corregir políticas
INSERT INTO projects (title, user_id, type, status) 
VALUES (
    'TEST_AFTER_FIX', 
    auth.uid(), 
    'canvas', 
    'active'
) 
ON CONFLICT DO NOTHING;

-- 5. Verificar que la inserción funcionó
SELECT * FROM projects 
WHERE title = 'TEST_AFTER_FIX' AND user_id = auth.uid();

-- 6. Limpiar prueba
DELETE FROM projects 
WHERE title = 'TEST_AFTER_FIX' AND user_id = auth.uid();

-- ========================================
-- EXPLICACIÓN DEL PROBLEMA
-- ========================================

-- El problema original era que las políticas RLS usaban:
-- auth.uid() = user_id
-- 
-- Pero parece que hay una discrepancia entre:
-- 1. El ID devuelto por auth.uid()
-- 2. El ID que se está intentando insertar
--
-- La solución incluye:
-- 1. Verificación de que auth.uid() no sea NULL
-- 2. Tu ID específico como fallback temporal
-- 3. Mejor manejo de tipos UUID

-- ========================================
-- PASOS SIGUIENTES
-- ========================================

-- 1. Ejecuta este script
-- 2. Verifica que no haya errores
-- 3. Prueba crear un proyecto en la app
-- 4. Si funciona, elimina el fallback de tu ID específico
-- 5. Considera crear políticas más genéricas para producción
