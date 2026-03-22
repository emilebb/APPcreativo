"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-neutral-100 dark:bg-white/10 border border-neutral-200 dark:border-white/10" />
    );
  }

  return (
    <button
      id="themeToggle"
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={theme === "light" ? "Cambiar a tema oscuro" : "Cambiar a tema claro"}
      className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-neutral-100 dark:bg-white/10 border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-[#e5e7eb] hover:bg-neutral-200 dark:hover:bg-white/15 hover:border-neutral-300 dark:hover:border-white/15 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#16171a]"
    >
      {theme === "light" ? (
        <Sun className="w-5 h-5 text-amber-500 transition-transform hover:rotate-45 duration-300" aria-hidden />
      ) : (
        <Moon className="w-5 h-5 text-indigo-400 transition-transform hover:rotate-12 duration-300" aria-hidden />
      )}
    </button>
  );
}
