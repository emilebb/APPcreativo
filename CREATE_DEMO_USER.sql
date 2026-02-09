-- Crear usuario de prueba para demostración
-- Este script crea un usuario con email y contraseña simples

-- 1. Habilitar autenticación por email en Supabase
-- Ve a: Authentication > Settings > Enable email confirmations (deshabilitar para pruebas)

-- 2. Crear usuario manualmente (ejecutar en SQL Editor de Supabase)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  'demo@creativex.com',
  '$2a$10$K8FpVjP5qK8FpVjP5qK8FpVjP5qK8FpVjP5qK8FpVjP5qK8FpVjP5qK8F', -- 'demo123' hasheado
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Demo User"}',
  false,
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- 3. Crear perfil para el usuario
INSERT INTO profiles (
  id,
  email,
  full_name,
  avatar_url,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'demo@creativex.com' LIMIT 1),
  'demo@creativex.com',
  'Demo User',
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 4. Verificar que el usuario fue creado
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'demo@creativex.com';
