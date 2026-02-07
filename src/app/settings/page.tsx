"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authProvider";
import { useProfile } from "@/lib/useProfile";
import { uploadAvatar } from "@/lib/uploadAvatar";
import type { CreativeMode } from "@/types/profile";

export default function SettingsPage() {
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Redirigir si no hay sesión
  useEffect(() => {
    if (!authLoading && !session) {
      router.push("/");
    }
  }, [authLoading, session, router]);

  if (authLoading || profileLoading) {
    return (
      <main className="mx-auto max-w-md p-8">
        <div className="text-neutral-500">Cargando...</div>
      </main>
    );
  }

  if (!profile) return null;

  const handleModeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMode = e.target.value as CreativeMode;
    setSaving(true);
    
    try {
      await updateProfile({ creative_mode: selectedMode });
      
      // Guardar mensaje para mostrar en el chat
      const message = selectedMode === "direct" 
        ? "Vale. Voy a ir más al grano."
        : "De acuerdo. Vamos despacio.";
      
      localStorage.setItem("settings_feedback", message);
      
      // Redirigir al chat inmediatamente
      router.push("/");
    } catch (err) {
      console.error("Error updating mode:", err);
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-md p-8 space-y-8">
      <div>
        <button
          onClick={() => router.push("/")}
          className="text-sm text-neutral-500 hover:text-neutral-900 transition mb-4"
        >
          ← Volver
        </button>
        <h1 className="text-xl font-medium text-neutral-900">Ajustes</h1>
        <p className="text-neutral-500 mt-2">
          Cambios pequeños. Efecto inmediato.
        </p>
      </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <div
            className="h-14 w-14 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: profile.avatar_color }}
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg font-medium text-white">
                {profile.email?.[0]?.toUpperCase() || "?"}
              </span>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm text-neutral-600 cursor-pointer">
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
                    window.location.reload();
                  } catch (err) {
                    console.error("Error uploading avatar:", err);
                  } finally {
                    setSaving(false);
                  }
                }}
              />
            </label>
            <p className="text-xs text-neutral-500">
              Esto es solo para reconocer tu espacio.
            </p>
          </div>
        </div>

      <div className="space-y-6">
        {/* Ritmo */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700">
            Ritmo
          </label>
          <select
            value={profile.creative_mode}
            onChange={handleModeChange}
            disabled={saving}
            className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400 disabled:opacity-50 transition"
          >
            <option value="calm">Calmado</option>
            <option value="direct">Directo</option>
          </select>
        </div>
      </div>

      {saving && (
        <p className="text-sm text-neutral-500">Guardando...</p>
      )}
    </main>
  );
}
