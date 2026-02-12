"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  const applyTheme = (newTheme: string) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", newTheme);
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const defaultTheme = prefersDark ? "dark" : "light";
      setTheme(defaultTheme);
      applyTheme(defaultTheme);
      localStorage.setItem("theme", defaultTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <button
      id="themeToggle"
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Usar tema oscuro" : "Usar tema claro"}
      className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-neutral-100 dark:bg-white/10 border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-[#e5e7eb] hover:bg-neutral-200 dark:hover:bg-white/15 hover:border-neutral-300 dark:hover:border-white/15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#16171a]"
    >
      {theme === "light" ? (
        <Sun className="w-5 h-5 text-amber-500 dark:text-amber-400/90" aria-hidden />
      ) : (
        <Moon className="w-5 h-5 text-indigo-500 dark:text-indigo-300" aria-hidden />
      )}
    </button>
  );
}
