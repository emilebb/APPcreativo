"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authProvider";
import { useProfile } from "@/lib/useProfile";
import { useUserStats } from "@/lib/useUserStats";
import { supabase } from "@/lib/supabaseClient";
import ProfileEdit from "@/components/ProfileEdit";
import type { Profile } from "@/types/profile";

export default function ProfilePage() {
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, error: profileError, updateProfile } = useProfile();
  const { stats, loading: statsLoading, error: statsError } = useUserStats();
  const router = useRouter();
  const [avatarError, setAvatarError] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setAvatarError(false);
    setAvatarLoaded(false);
  }, [profile?.avatar_url]);

  if (authLoading || profileLoading || statsLoading) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <div className="text-neutral-500">Cargando perfil...</div>
        {/* Debug info */}
        <div className="mt-4 text-xs text-neutral-400">
          <div>Auth loading: {authLoading ? 'true' : 'false'}</div>
          <div>Profile loading: {profileLoading ? 'true' : 'false'}</div>
          <div>Stats loading: {statsLoading ? 'true' : 'false'}</div>
          <div>Session: {session ? 'exists' : 'null'}</div>
        </div>
      </main>
    );
  }

  // Mostrar errores si existen
  if (profileError || statsError) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <div className="text-red-500">Error al cargar el perfil</div>
        <div className="mt-2 text-sm text-neutral-600">
          {profileError || statsError}
        </div>
        <button
          onClick={() => {
            router.refresh();
          }}
          className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
        >
          Reintentar
        </button>
      </main>
    );
  }

  // Si no hay sesión, redirigir inmediatamente
  if (!session) {
    router.push("/");
    return null;
  }

  if (!profile) return null;

  const handleProfileUpdate = async (updates: Partial<Profile>) => {
    await updateProfile(updates);
    setIsEditing(false);
  };

  const initial = profile.email?.[0]?.toUpperCase() || "?";
  const showImage = Boolean(profile.avatar_url) && !avatarError;
  const hideInitial = showImage && avatarLoaded;

  if (isEditing) {
    return (
      <main className="mx-auto max-w-2xl p-8 space-y-8">
        <div>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-neutral-500 hover:text-neutral-900 transition mb-4"
          >
            ← Volver
          </button>
          <h1 className="text-2xl font-medium text-neutral-900">Editar Perfil</h1>
          <p className="text-neutral-500 mt-2">
            Modifica tu información personal
          </p>
        </div>
        
        <ProfileEdit
          profile={profile}
          onUpdate={handleProfileUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-8 space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push("/")}
          className="text-sm text-neutral-500 hover:text-neutral-900 transition mb-4"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-medium text-neutral-900">Tu Perfil</h1>
        <p className="text-neutral-500 mt-2">
          Información de tu cuenta y actividad
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6">
        {/* Avatar y基本信息 */}
        <div className="flex items-center gap-6">
          <div
            className="h-20 w-20 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center flex-shrink-0 relative"
            style={{ backgroundColor: profile.avatar_color }}
          >
            <span className="text-2xl font-medium text-white" style={{ opacity: hideInitial ? 0 : 1 }}>
              {initial}
            </span>
            {showImage ? (
              <img
                src={profile.avatar_url || ""}
                alt="Avatar"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ opacity: avatarLoaded ? 1 : 0 }}
                onLoad={() => setAvatarLoaded(true)}
                onError={() => {
                  setAvatarError(true);
                  setAvatarLoaded(false);
                }}
              />
            ) : null}
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-medium text-neutral-900">
              {profile.email}
            </h2>
            <p className="text-neutral-500 mt-1">
              Miembro desde {stats.memberSince}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                profile.creative_mode === 'direct' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {profile.creative_mode === 'direct' ? 'Ritmo Directo' : 'Ritmo Calmado'}
              </span>
              {profile.onboarding_completed && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Perfil Completo
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-neutral-200">
          <div className="text-center">
            <div className="text-2xl font-medium text-neutral-900">{stats.totalSessions}</div>
            <div className="text-sm text-neutral-500">Sesiones</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-medium text-neutral-900">{stats.totalProjects}</div>
            <div className="text-sm text-neutral-500">Proyectos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-medium text-neutral-900">{stats.totalMindMaps}</div>
            <div className="text-sm text-neutral-500">Mind Maps</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-medium text-neutral-900">{stats.totalMoodBoards}</div>
            <div className="text-sm text-neutral-500">Mood Boards</div>
          </div>
        </div>

        {/* Estadísticas adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-neutral-200">
          <div className="text-center">
            <div className="text-xl font-medium text-neutral-900">{stats.currentStreak}</div>
            <div className="text-sm text-neutral-500">Racha actual</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-medium text-neutral-900">{stats.longestStreak}</div>
            <div className="text-sm text-neutral-500">Mejor racha</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-medium text-neutral-900">{profile.preferred_language}</div>
            <div className="text-sm text-neutral-500">Idioma preferido</div>
          </div>
        </div>

        {/* Última actividad */}
        {stats.lastActive && (
          <div className="pt-4 border-t border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-700 mb-2">Última actividad</h3>
            <p className="text-sm text-neutral-500">
              {stats.lastActive}
            </p>
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-4">Acciones rápidas</h3>
        <div className="space-y-3">
          <button
            onClick={() => setIsEditing(true)}
            className="w-full px-4 py-3 text-left text-sm text-neutral-700 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition flex items-center justify-between group"
          >
            <span className="flex items-center gap-3">
              <span className="text-lg">✏️</span>
              Editar perfil
            </span>
            <span className="text-neutral-400 group-hover:text-neutral-600">→</span>
          </button>
          
          <button
            onClick={() => router.push("/settings")}
            className="w-full px-4 py-3 text-left text-sm text-neutral-700 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition flex items-center justify-between group"
          >
            <span className="flex items-center gap-3">
              <span className="text-lg">⚙️</span>
              Configuración de cuenta
            </span>
            <span className="text-neutral-400 group-hover:text-neutral-600">→</span>
          </button>
          
          <button
            onClick={async () => {
              if (supabase) {
                await supabase.auth.signOut();
                window.location.href = "/api/auth/signout";
              }
            }}
            className="w-full px-4 py-3 text-left text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition flex items-center justify-between group"
          >
            <span className="flex items-center gap-3">
              <span className="text-lg">🚪</span>
              Cerrar sesión
            </span>
            <span className="text-red-400 group-hover:text-red-600">→</span>
          </button>
        </div>
      </div>
    </main>
  );
}
