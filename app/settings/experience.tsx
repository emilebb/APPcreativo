"use client";

import { useProfile } from "@/lib/useProfile";
import type { CreativeMode } from "@/types/profile";
import { Sparkles, ChevronDown, Zap, Wind } from "lucide-react";
import { useState } from "react";

export default function ExperienceSettings() {
  const { profile, updateProfile } = useProfile();
  const [saving, setSaving] = useState(false);

  const handleModeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as CreativeMode;
    setSaving(true);
    try {
      await updateProfile({ creative_mode: value });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white tracking-tight">
          Experiencia Creativa
        </h1>
        <p className="text-neutral-500 dark:text-[#9ca3af] text-sm mt-1">
          Ajusta cómo quieres trabajar: ritmo, herramientas por defecto y enfoque.
        </p>
      </header>

      <section className="rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-5">
        <h2 className="text-sm font-medium text-neutral-700 dark:text-[#d1d5db] mb-3">
          Ritmo de trabajo
        </h2>
        <p className="text-xs text-neutral-500 dark:text-[#6b7280] mb-4">
          Define si prefieres respuestas más directas o un tono más calmado del Coach.
        </p>
        <div className="relative">
          <select
            value={profile?.creative_mode ?? "direct"}
            onChange={handleModeChange}
            disabled={saving}
            className="w-full appearance-none px-4 py-3 bg-white dark:bg-white/95 text-neutral-900 dark:text-[#111827] rounded-xl border border-neutral-200 dark:border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition"
          >
            <option value="direct">Directo — Ir al grano</option>
            <option value="calm">Calmado — Con más contexto</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-[#6b7280] pointer-events-none" />
        </div>
      </section>

      <section className="rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-5">
        <h2 className="text-sm font-medium text-neutral-700 dark:text-[#d1d5db] mb-3">
          Herramienta de inicio
        </h2>
        <p className="text-xs text-neutral-500 dark:text-[#6b7280] mb-4">
          Elige qué ver primero al entrar (próximamente guardado en tu perfil).
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            { id: "canvas", label: "Canvas", icon: Zap },
            { id: "moodboard", label: "Moodboard", icon: Sparkles },
            { id: "mindmap", label: "Mindmap", icon: Wind },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-[#e5e7eb] hover:bg-neutral-100 dark:hover:bg-white/10 transition text-sm font-medium"
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
