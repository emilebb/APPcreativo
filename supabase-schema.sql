-- ========================================
-- SCHEMA PARA CREATIONX - SUPABASE
-- Tablas: perfiles, proyectos, moodboard_items, chat_history
-- ========================================

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. TABLA PERFILES
-- ========================================
CREATE TABLE IF NOT EXISTS perfiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para perfiles
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON perfiles;
CREATE POLICY "Usuarios pueden ver su propio perfil"
ON perfiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios pueden insertar su propio perfil" ON perfiles;
CREATE POLICY "Usuarios pueden insertar su propio perfil"
ON perfiles FOR INSERT
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON perfiles;
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
ON perfiles FOR UPDATE
USING (auth.uid() = id);

-- ========================================
-- 2. TABLA PROYECTOS
-- ========================================
CREATE TABLE IF NOT EXISTS proyectos (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre text NOT NULL,
    tipo text NOT NULL CHECK (tipo IN ('moodboard', 'mindmap', 'canvas', 'chat')),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_proyectos_user_id ON proyectos(user_id);
CREATE INDEX IF NOT EXISTS idx_proyectos_tipo ON proyectos(tipo);

-- Habilitar RLS
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para proyectos
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios proyectos" ON proyectos;
CREATE POLICY "Usuarios pueden ver sus propios proyectos"
ON proyectos FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios pueden insertar sus propios proyectos" ON proyectos;
CREATE POLICY "Usuarios pueden insertar sus propios proyectos"
ON proyectos FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propios proyectos" ON proyectos;
CREATE POLICY "Usuarios pueden actualizar sus propios proyectos"
ON proyectos FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propios proyectos" ON proyectos;
CREATE POLICY "Usuarios pueden eliminar sus propios proyectos"
ON proyectos FOR DELETE
USING (auth.uid() = user_id);

-- ========================================
-- 3. TABLA MOODBOARD_ITEMS
-- ========================================
CREATE TABLE IF NOT EXISTS moodboard_items (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    posicion_x numeric NOT NULL DEFAULT 0,
    posicion_y numeric NOT NULL DEFAULT 0,
    url_imagen text NOT NULL,
    proyecto_id uuid REFERENCES proyectos(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_moodboard_items_proyecto_id ON moodboard_items(proyecto_id);

-- Habilitar RLS
ALTER TABLE moodboard_items ENABLE ROW LEVEL SECURITY;

-- Política RLS: solo accesible si el proyecto pertenece al usuario
DROP POLICY IF EXISTS "Usuarios pueden ver items de sus proyectos" ON moodboard_items;
CREATE POLICY "Usuarios pueden ver items de sus proyectos"
ON moodboard_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM proyectos
        WHERE proyectos.id = moodboard_items.proyecto_id
        AND proyectos.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Usuarios pueden insertar items en sus proyectos" ON moodboard_items;
CREATE POLICY "Usuarios pueden insertar items en sus proyectos"
ON moodboard_items FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM proyectos
        WHERE proyectos.id = moodboard_items.proyecto_id
        AND proyectos.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Usuarios pueden actualizar items de sus proyectos" ON moodboard_items;
CREATE POLICY "Usuarios pueden actualizar items de sus proyectos"
ON moodboard_items FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM proyectos
        WHERE proyectos.id = moodboard_items.proyecto_id
        AND proyectos.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Usuarios pueden eliminar items de sus proyectos" ON moodboard_items;
CREATE POLICY "Usuarios pueden eliminar items de sus proyectos"
ON moodboard_items FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM proyectos
        WHERE proyectos.id = moodboard_items.proyecto_id
        AND proyectos.user_id = auth.uid()
    )
);

-- ========================================
-- 4. TABLA CHAT_HISTORY
-- ========================================
CREATE TABLE IF NOT EXISTS chat_history (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    role text NOT NULL CHECK (role IN ('user', 'assistant')),
    content text NOT NULL,
    proyecto_id uuid REFERENCES proyectos(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_chat_history_proyecto_id ON chat_history(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at);

-- Habilitar RLS
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Política RLS: solo accesible si el proyecto pertenece al usuario
DROP POLICY IF EXISTS "Usuarios pueden ver chat de sus proyectos" ON chat_history;
CREATE POLICY "Usuarios pueden ver chat de sus proyectos"
ON chat_history FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM proyectos
        WHERE proyectos.id = chat_history.proyecto_id
        AND proyectos.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Usuarios pueden insertar chat en sus proyectos" ON chat_history;
CREATE POLICY "Usuarios pueden insertar chat en sus proyectos"
ON chat_history FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM proyectos
        WHERE proyectos.id = chat_history.proyecto_id
        AND proyectos.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Usuarios pueden actualizar chat de sus proyectos" ON chat_history;
CREATE POLICY "Usuarios pueden actualizar chat de sus proyectos"
ON chat_history FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM proyectos
        WHERE proyectos.id = chat_history.proyecto_id
        AND proyectos.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Usuarios pueden eliminar chat de sus proyectos" ON chat_history;
CREATE POLICY "Usuarios pueden eliminar chat de sus proyectos"
ON chat_history FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM proyectos
        WHERE proyectos.id = chat_history.proyecto_id
        AND proyectos.user_id = auth.uid()
    )
);

-- ========================================
-- FUNCIONES ÚTILES
-- ========================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_perfiles_updated_at ON perfiles;
CREATE TRIGGER update_perfiles_updated_at
BEFORE UPDATE ON perfiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_proyectos_updated_at ON proyectos;
CREATE TRIGGER update_proyectos_updated_at
BEFORE UPDATE ON proyectos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_moodboard_items_updated_at ON moodboard_items;
CREATE TRIGGER update_moodboard_items_updated_at
BEFORE UPDATE ON moodboard_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- VERIFICACIÓN
-- ========================================
-- Para verificar que todo se creó correctamente:
-- SELECT * FROM perfiles LIMIT 1;
-- SELECT * FROM proyectos LIMIT 1;
-- SELECT * FROM moodboard_items LIMIT 1;
-- SELECT * FROM chat_history LIMIT 1;

-- ¡Listo! Tu base de datos de CreationX está configurada.