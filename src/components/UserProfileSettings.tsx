// @ts-nocheck
"use client"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { Sun, Moon, Sparkles, Loader2 } from "lucide-react"

export default function UserProfileSettings({ userId }: { userId: string }) {
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(false)

  const updateTheme = async (newTheme: string) => {
    setLoading(true)
    setTheme(newTheme)
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error("Supabase client not initialized.");
      setLoading(false);
      return;
    }
    const { error } = await supabase
      .from('profiles')
      .update({ theme: newTheme } as any)
      .eq('id', userId);
    if (error) console.error("Error guardando tema:", error.message)
    setLoading(false)
  }

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border dark:border-zinc-800 shadow-sm">
      <h3 className="text-lg font-bold mb-4">Configuración de Apariencia</h3>
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
        <span className="text-sm font-medium">Tema de la interfaz</span>
        <div className="relative flex items-center bg-zinc-200 dark:bg-zinc-950 p-1 rounded-full w-40 h-12 shadow-inner">
          <div 
            className={`absolute w-10 h-10 bg-white dark:bg-zinc-700 rounded-full shadow-md transition-all duration-300 ease-in-out ${
              theme === 'light' ? 'left-1' : theme === 'dark' ? 'left-[46px]' : 'left-[91px]'
            }`}
          />
          <button 
            onClick={() => updateTheme('light')}
            className="relative z-10 flex-1 flex justify-center items-center"
            title="Modo Claro"
          >
            <Sun size={20} className={theme === 'light' ? 'text-orange-500' : 'text-zinc-500'} />
          </button>
          <button 
            onClick={() => updateTheme('dark')}
            className="relative z-10 flex-1 flex justify-center items-center"
            title="Modo Oscuro"
          >
            <Moon size={20} className={theme === 'dark' ? 'text-blue-400' : 'text-zinc-500'} />
          </button>
          <button 
            onClick={() => updateTheme('night')}
            className="relative z-10 flex-1 flex justify-center items-center"
            title="Modo Noche"
          >
            <Sparkles size={20} className={theme === 'night' ? 'text-purple-400' : 'text-zinc-500'} />
          </button>
        </div>
      </div>
      {loading && (
        <p className="text-[10px] text-zinc-500 mt-2 flex items-center gap-1">
          <Loader2 size={10} className="animate-spin" /> Guardando en tu perfil...
        </p>
      )}
    </div>
  )
}
