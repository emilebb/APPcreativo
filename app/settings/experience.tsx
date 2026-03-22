"use client";

import { useProfile } from "@/lib/useProfile";
import type { CreativeMode } from "@/types/profile";
import { Sparkles, ChevronDown, Zap, Wind } from "lucide-react";
import { useState } from "react";

import type { StartTool } from "@/types/profile";

export default function ExperienceSettings() {
  const { profile, updateProfile } = useProfile();
  const [saving, setSaving] = useState(false);
  const [savingTool, setSavingTool] = useState(false);

  const handleModeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as CreativeMode;
    setSaving(true);
    try {
      await updateProfile({ creative_mode: value });
    } finally {
      setSaving(false);
    }
  };

  const handleStartToolChange = async (tool: StartTool) => {
    setSavingTool(true);
    try {
      await updateProfile({ start_tool: tool });
    } finally {
      setSavingTool(false);
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
          Elige qué ver primero al entrar a la aplicación.
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            { id: "explore" as StartTool, label: "Explorar", icon: Zap },
            { id: "moodboard" as StartTool, label: "Moodboard", icon: Sparkles },
            { id: "mindmap" as StartTool, label: "Mindmap", icon: Wind },
          ].map(({ id, label, icon: Icon }) => {
            const isSelected = profile?.start_tool === id || (!profile?.start_tool && id === "explore");
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleStartToolChange(id)}
                disabled={savingTool}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border transition text-sm font-medium disabled:opacity-50 ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                    : 'border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-[#e5e7eb] hover:bg-neutral-100 dark:hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            );
          })}
        </div>
        {savingTool && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 flex items-center gap-2">
            <span className="inline-block w-3 h-3 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
            Guardando preferencia...
          </p>
        )}
      </section>
    </div>
  );
}
