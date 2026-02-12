"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { ChevronDown } from "lucide-react";

export default function AppearanceContent() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white tracking-tight">
          Apariencia
        </h1>
        <p className="text-neutral-500 dark:text-[#9ca3af] text-sm mt-1">
          Tema, densidad y animaciones de la interfaz.
        </p>
      </header>

      <section className="rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-5">
        <h2 className="text-sm font-medium text-neutral-700 dark:text-[#d1d5db] mb-3">
          Tema
        </h2>
        <p className="text-xs text-neutral-500 dark:text-[#6b7280] mb-4">
          Elige entre modo claro u oscuro. También puedes usar el interruptor rápido abajo.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              document.documentElement.setAttribute("data-theme", "light");
              document.documentElement.classList.remove("dark");
              localStorage.setItem("theme", "light");
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/5 text-neutral-700 dark:text-[#e5e7eb] hover:bg-neutral-50 dark:hover:bg-white/10 transition text-sm font-medium"
          >
            <Sun className="w-4 h-4" />
            Claro
          </button>
          <button
            type="button"
            onClick={() => {
              document.documentElement.setAttribute("data-theme", "dark");
              document.documentElement.classList.add("dark");
              localStorage.setItem("theme", "dark");
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/5 text-neutral-700 dark:text-[#e5e7eb] hover:bg-neutral-50 dark:hover:bg-white/10 transition text-sm font-medium"
          >
            <Moon className="w-4 h-4" />
            Oscuro
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500 dark:text-[#6b7280]">Interruptor:</span>
            <ThemeToggle />
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-5">
        <label className="block text-sm font-medium text-neutral-700 dark:text-[#d1d5db] mb-3">
          Densidad de interfaz
        </label>
        <p className="text-xs text-neutral-500 dark:text-[#6b7280] mb-3">
          Más compacta para ver más contenido; más cómoda para lectura.
        </p>
        <div className="relative">
          <select className="w-full appearance-none px-4 py-3 bg-white dark:bg-white/95 text-neutral-900 dark:text-[#111827] rounded-xl border border-neutral-200 dark:border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
            <option>Compacta</option>
            <option>Cómoda</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-[#6b7280] pointer-events-none" />
        </div>
      </section>

      <section className="rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium text-neutral-700 dark:text-[#d1d5db]">
              Animaciones activas
            </h2>
            <p className="text-xs text-neutral-500 dark:text-[#6b7280] mt-0.5">
              Transiciones y micro-interacciones en la interfaz.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={true}
            className="relative w-11 h-6 rounded-full bg-blue-500 transition-colors flex-shrink-0"
          >
            <span className="absolute top-1 left-6 w-4 h-4 rounded-full bg-white shadow transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
}
