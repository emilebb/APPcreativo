"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authProvider";
import { useProfile } from "@/lib/useProfile";
import { uploadAvatar } from "@/lib/uploadAvatar";
import type { CreativeMode } from "@/types/profile";
import { ArrowLeft, ChevronDown } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import SettingsLayout from "@/components/SettingsLayout";
import GeneralSettings from "./general";
import AppearanceSettings from "./appearance";

export default function SettingsPage() {
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, error: profileError, updateProfile } = useProfile();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState("general");

  // Redirigir si no hay sesión
  useEffect(() => {
    if (!authLoading && !session) {
      router.push("/");
    }
  }, [authLoading, session, router]);

  useEffect(() => {
    setAvatarError(false);
    setAvatarLoaded(false);
  }, [profile?.avatar_url]);

  if (authLoading || profileLoading) {
    return (
      <main className="mx-auto max-w-md p-8">
        {/* SEO h1 - hidden but accessible */}
        <h1 className="sr-only">Configuración de Perfil - Ajustes de Cuenta en CreationX</h1>
        
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-neutral-700">Cargando configuración...</div>
        </div>
      </main>
    );
  }

  if (profileError) {
    return (
      <main className="mx-auto max-w-md p-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌ Error al cargar configuración</div>
          <div className="text-neutral-600 text-sm mb-4">{profileError}</div>
          <button 
            onClick={() => router.refresh()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
          >
            Reintentar
          </button>
          <button 
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700"
          >
            Inicio
          </button>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-md p-8">
        <div className="text-center">
          <div className="text-neutral-600 mb-4">No se encontró el perfil de usuario</div>
          <div className="text-neutral-500 text-sm mb-4">
            {session ? "El perfil está siendo creado..." : "Debes iniciar sesión para acceder a la configuración"}
          </div>
          {!session && (
            <button 
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Iniciar Sesión
            </button>
          )}
        </div>
      </main>
    );
  }

  const handleModeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMode = e.target.value as CreativeMode;
    setSaving(true);

    try {
      await updateProfile({ creative_mode: selectedMode });

      const message = selectedMode === "direct"
        ? "Vale. Voy a ir más al grano."
        : "De acuerdo. Vamos despacio.";

      handleSaveSettings(message);
    } catch (err) {
      console.error("Error updating mode:", err);
      setSaving(false);
    }
  };

  const handleSaveSettings = (message: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("settings_feedback", message);
    }
    
    // Redirigir al chat inmediatamente
    router.push("/");
  };

  const initial = profile.email?.[0]?.toUpperCase() || "?";
  const showImage = Boolean(profile.avatar_url) && !avatarError;
  const hideInitial = showImage && avatarLoaded;

  return (
    <SettingsLayout>
      <div className="settings-content space-y-8">
        <header>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-1.5 text-sm text-[#9ca3af] hover:text-white transition-colors mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#16171a] rounded"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden />
            Volver
          </button>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Ajustes
          </h1>
          <p className="text-[#9ca3af] text-sm mt-1">
            Cambios pequeños. Efecto inmediato.
          </p>
        </header>

        {/* Avatar card */}
        <section className="rounded-xl bg-white/5 border border-white/10 p-5 shadow-sm">
          <div className="flex items-center gap-5">
            <div
              className="h-16 w-16 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 relative ring-2 ring-white/10"
              style={{ backgroundColor: profile.avatar_color || "#374151" }}
            >
              <span
                className="text-xl font-semibold text-white"
                style={{ opacity: hideInitial ? 0 : 1 }}
              >
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
            <div className="min-w-0">
              <label className="text-sm font-medium text-white cursor-pointer hover:text-[#93c5fd] transition-colors">
                Cambiar imagen
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 1024 * 1024) {
                      alert("La imagen es demasiado grande.");
                      return;
                    }
                    try {
                      setSaving(true);
                      await uploadAvatar(file, profile.id);
                      router.refresh();
                    } catch (err) {
                      console.error("Error uploading avatar:", err);
                    } finally {
                      setSaving(false);
                    }
                  }}
                />
              </label>
              <p className="text-xs text-[#6b7280] mt-0.5">
                Esto es solo para reconocer tu espacio.
              </p>
            </div>
          </div>
        </section>

        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-medium text-[#d1d5db] mb-3">
              Tema de la interfaz
            </h2>
            <ThemeToggle />
          </section>

          <section>
            <label className="block text-sm font-medium text-[#d1d5db] mb-3">
              Ritmo
            </label>
            <div className="relative">
              <select
                value={profile.creative_mode}
                onChange={handleModeChange}
                disabled={saving}
                className="w-full appearance-none px-4 py-3 pl-4 pr-10 bg-white/95 text-[#111827] rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6] disabled:opacity-50 transition shadow-sm"
              >
                <option value="calm">Calmado</option>
                <option value="direct">Directo</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280] pointer-events-none"
                aria-hidden
              />
            </div>
          </section>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveCategory("general")}
            className="text-sm font-medium rounded-lg px-4 py-2.5 bg-white text-[#111827] shadow-sm hover:bg-[#f3f4f6] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#16171a]"
          >
            General
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("appearance")}
            className="text-sm font-medium rounded-lg px-4 py-2.5 border border-white/20 text-white hover:bg-white/5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#16171a]"
          >
            Apariencia
          </button>
        </div>

        {saving && (
          <p className="text-sm text-[#9ca3af] flex items-center gap-2">
            <span className="inline-block w-3 h-3 border-2 border-[#9ca3af] border-t-transparent rounded-full animate-spin" />
            Guardando...
          </p>
        )}
      </div>
    </SettingsLayout>
  );
}
