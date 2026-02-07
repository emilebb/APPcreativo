-- Crear tabla de perfiles de usuario
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE,
  email text,
  preferred_language text DEFAULT 'es',
  creative_mode text DEFAULT 'calm',
  onboarding_completed boolean DEFAULT false,
  last_seen timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Activar Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politica: usuarios pueden leer su propio perfil
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Politica: usuarios pueden crear su propio perfil
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Politica: usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Crear tabla de sesiones para persistencia
CREATE TABLE sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Activar RLS para sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Politica: usuarios gestionan sus propias sesiones
CREATE POLICY "Users manage own sessions"
ON sessions FOR ALL
USING (auth.uid() = user_id);
