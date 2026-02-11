"use client";

import { useState } from "react";

const categories = [
  { id: "general", name: "General" },
  { id: "appearance", name: "Apariencia" },
  { id: "experience", name: "Experiencia Creativa" },
  { id: "notifications", name: "Notificaciones" },
  { id: "security", name: "Seguridad" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const [activeCategory, setActiveCategory] = useState("general");

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <nav className="w-1/4 bg-gray-100 dark:bg-zinc-800 p-4">
        <ul className="space-y-4">
          {categories.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => setActiveCategory(category.id)}
                className={`w-full text-left p-2 rounded-lg transition ${
                  activeCategory === category.id
                    ? "bg-gray-200 dark:bg-zinc-700 font-bold"
                    : "hover:bg-gray-200 dark:hover:bg-zinc-700"
                }`}
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Content Panel */}
      <div className="w-3/4 p-6 bg-white dark:bg-zinc-900">
        {children}
      </div>
    </div>
  );
}