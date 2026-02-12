"use client";

import { useState } from "react";
import { Settings, Palette, Sparkles, Bell, Shield } from "lucide-react";

const categories = [
  { id: "general", name: "General", icon: Settings },
  { id: "appearance", name: "Apariencia", icon: Palette },
  { id: "experience", name: "Experiencia Creativa", icon: Sparkles },
  { id: "notifications", name: "Notificaciones", icon: Bell },
  { id: "security", name: "Seguridad", icon: Shield },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const [activeCategory, setActiveCategory] = useState("general");

  return (
    <div className="flex h-full min-h-0">
      {/* Sidebar */}
      <nav
        className="w-52 lg:w-56 flex-shrink-0 border-r border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-[#1c1e22] py-5 px-3"
        aria-label="Configuración"
      >
        <ul className="space-y-0.5">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <li key={category.id}>
                <button
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={`
                    relative w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 dark:focus-visible:ring-offset-[#1c1e22]
                    ${isActive
                      ? "bg-neutral-200 dark:bg-white/10 text-neutral-900 dark:text-white"
                      : "text-neutral-600 dark:text-[#9ca3af] hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-[#e5e7eb]"
                    }
                  `}
                >
                  {isActive && (
                    <span
                      className="absolute left-0 top-1 bottom-1 w-0.5 bg-blue-500 dark:bg-[#3b82f6] rounded-r"
                      aria-hidden
                    />
                  )}
                  <Icon
                    className="w-4 h-4 flex-shrink-0 opacity-80"
                    aria-hidden
                  />
                  <span>{category.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Content Panel */}
      <div className="flex-1 min-w-0 overflow-auto bg-white dark:bg-[#16171a] text-neutral-900 dark:text-[#e5e7eb]">
        <div className="max-w-2xl mx-auto py-8 px-6 sm:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
