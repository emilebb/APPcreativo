"use client";

import { useState } from "react";
import { useProfile } from "@/lib/useProfile";
import type { CreativeMode } from "@/types/profile";

type SettingsProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Settings({ isOpen, onClose }: SettingsProps) {
  const { profile, loading, updateProfile } = useProfile();
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleToggleLanguage = async () => {
    if (!profile || saving) return;
    setSaving(true);
    try {
      const newLang = profile.preferred_language === "es" ? "en" : "es";
      await updateProfile({ preferred_language: newLang });
    } catch (err) {
      console.error("Error updating language:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMode = async () => {
    if (!profile || saving) return;
    setSaving(true);
    try {
      const newMode: CreativeMode = profile.creative_mode === "calm" ? "direct" : "calm";
      await updateProfile({ creative_mode: newMode });
    } catch (err) {
      console.error("Error updating mode:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 pointer-events-auto">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">
            Configuración
          </h2>

          {loading ? (
            <div className="text-gray-500">Cargando...</div>
          ) : !profile ? (
            <div className="text-gray-500">No se encontró perfil</div>
          ) : (
            <div className="space-y-6">
              {/* Language Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma
                </label>
                <button
                  onClick={handleToggleLanguage}
                  disabled={saving}
                  className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left transition-colors disabled:opacity-50"
                >
                  {profile.preferred_language === "es" ? "🇪🇸 Español" : "🇬🇧 English"}
                </button>
              </div>

              {/* Creative Mode Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modo creativo
                </label>
                <button
                  onClick={handleToggleMode}
                  disabled={saving}
                  className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left transition-colors disabled:opacity-50"
                >
                  {profile.creative_mode === "calm" ? (
                    <div>
                      <div className="font-medium">🌙 Modo Calma</div>
                      <div className="text-sm text-gray-600">
                        Ritmo pausado y reflexivo
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium">⚡ Modo Directo</div>
                      <div className="text-sm text-gray-600">
                        Ritmo rápido y enfocado
                      </div>
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-8 w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </>
  );
}
