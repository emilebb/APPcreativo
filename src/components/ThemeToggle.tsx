"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Sparkles } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="theme-toggle flex gap-2 p-1 rounded-full w-fit bg-gray-100 dark:bg-zinc-800">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-full transition ${
          theme === "light" ? "bg-white shadow-sm" : ""}
        `}
        aria-label="Tema claro"
      >
        <Sun size={18} className="text-orange-500" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-full transition ${
          theme === "dark" ? "bg-zinc-700 shadow-sm" : ""}
        `}
        aria-label="Tema oscuro"
      >
        <Moon size={18} className="text-blue-400" />
      </button>
      <button
        onClick={() => setTheme("night")}
        className={`p-2 rounded-full transition ${
          theme === "night" ? "bg-night-bg shadow-sm" : ""}
        `}
        aria-label="Tema noche"
      >
        <Sparkles size={18} className="text-purple-400" />
      </button>
    </div>
  );
}
