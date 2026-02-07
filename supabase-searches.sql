
-- Habilita extensión para UUID aleatorio si no existe
create extension if not exists pgcrypto;

-- Tabla para historial de búsquedas
create table if not exists public.searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  query text not null,
  created_at timestamptz not null default (now() at time zone 'utc')
);

-- Índice para búsquedas recientes por usuario
create index if not exists idx_searches_user_created_at on public.searches(user_id, created_at desc);

-- RLS: Solo el usuario puede ver/insertar sus búsquedas
alter table public.searches enable row level security;
drop policy if exists searches_select on public.searches;
create policy searches_select on public.searches for select using (auth.uid() = user_id);
drop policy if exists searches_insert on public.searches;
create policy searches_insert on public.searches for insert with check (auth.uid() = user_id);