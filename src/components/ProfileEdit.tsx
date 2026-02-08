"use client";

import { useState } from "react";
import { useProfile } from "@/lib/useProfile";
import type { Profile, CreativeMode } from "@/types/profile";

interface ProfileEditProps {
  profile: Profile;
  onUpdate: (updates: Partial<Profile>) => Promise<void>;
  onCancel: () => void;
}

export default function ProfileEdit({ profile, onUpdate, onCancel }: ProfileEditProps) {
  const { updateProfile } = useProfile();
  const [formData, setFormData] = useState({
    preferred_language: profile.preferred_language,
    creative_mode: profile.creative_mode,
  });
  const [saving, setSaving] = useState(false);

  const languages = [
    { code: "es", name: "Español" },
    { code: "en", name: "English" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "it", name: "Italiano" },
    { code: "pt", name: "Português" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateProfile(formData);
      await onUpdate(formData);
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-neutral-900">Editar perfil</h3>
        <p className="text-sm text-neutral-500 mt-1">
          Actualiza tu información personal
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Idioma preferido */}
        <div className="space-y-2">
          <label htmlFor="language" className="block text-sm font-medium text-neutral-700">
            Idioma preferido
          </label>
          <select
            id="language"
            value={formData.preferred_language}
            onChange={(e) => setFormData(prev => ({ ...prev, preferred_language: e.target.value }))}
            disabled={saving}
            className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400 disabled:opacity-50 transition"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ritmo creativo */}
        <div className="space-y-2">
          <label htmlFor="mode" className="block text-sm font-medium text-neutral-700">
            Ritmo de trabajo
          </label>
          <select
            id="mode"
            value={formData.creative_mode}
            onChange={(e) => setFormData(prev => ({ ...prev, creative_mode: e.target.value as CreativeMode }))}
            disabled={saving}
            className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400 disabled:opacity-50 transition"
          >
            <option value="calm">Calmado - Más reflexivo y pausado</option>
            <option value="direct">Directo - Más rápido y conciso</option>
          </select>
          <p className="text-xs text-neutral-500">
            Esto afecta cómo te respondo durante nuestras conversaciones
          </p>
        </div>

        {/* Email (solo lectura) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700">
            Correo electrónico
          </label>
          <div className="px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-600">
            {profile.email}
          </div>
          <p className="text-xs text-neutral-500">
            El correo electrónico no se puede cambiar
          </p>
        </div>

        {/* Información de la cuenta */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700">
            Información de la cuenta
          </label>
          <div className="px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-600 space-y-1">
            <div>Miembro desde: {new Date(profile.created_at).toLocaleDateString('es-ES')}</div>
            <div>ID: {profile.id}</div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 px-4 py-3 bg-white border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 disabled:opacity-50 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
