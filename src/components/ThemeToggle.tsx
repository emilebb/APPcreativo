"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const defaultTheme = prefersDark ? "dark" : "light";
      setTheme(defaultTheme);
      document.documentElement.setAttribute("data-theme", defaultTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <button
      id="themeToggle"
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Usar tema oscuro" : "Usar tema claro"}
      className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 border border-white/10 text-[#e5e7eb] hover:bg-white/15 hover:border-white/15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#16171a]"
    >
      {theme === "light" ? (
        <Sun className="w-5 h-5 text-amber-400/90" aria-hidden />
      ) : (
        <Moon className="w-5 h-5 text-indigo-300" aria-hidden />
      )}
    </button>
  );
}
