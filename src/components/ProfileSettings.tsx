"use client"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { createClient } from "@/lib/supabaseClient"
import { Sun, Moon, Sparkles, Zap, Coffee } from "lucide-react"

export default function ProfileSettings({ userId }: { userId: string }) {
  const { theme, setTheme } = useTheme()
  const [pace, setPace] = useState('calm')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Cargar preferencias actuales del usuario
    const fetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('theme, pace').eq('id', userId).single()
      if (data) {
        if (data.theme) setTheme(data.theme)
        if (data.pace) setPace(data.pace)
      }
    }
    fetchProfile()
    // eslint-disable-next-line
  }, [userId])

  const updateProfile = async (updates: any) => {
    setSaving(true)
    await supabase.from('profiles').update(updates).eq('id', userId)
    setSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 bg-white dark:bg-zinc-900 rounded-3xl border dark:border-zinc-800">
      <section>
        <h2 className="text-xl font-bold mb-4">Apariencia</h2>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl">
          <span className="text-sm font-medium">Tema visual</span>
          <div className="relative flex items-center bg-zinc-200 dark:bg-zinc-950 p-1 rounded-full w-48 h-12">
            <div className={`absolute w-14 h-10 bg-white dark:bg-zinc-700 rounded-full shadow transition-all duration-300 ${
              theme === 'light' ? 'left-1' : theme === 'dark' ? 'left-[62px]' : 'left-[124px]'
            }`} />
            <button onClick={() => { setTheme('light'); updateProfile({ theme: 'light' }) }} className="flex-1 z-10 flex justify-center"><Sun size={20} className={theme === 'light' ? 'text-orange-500' : 'text-zinc-500'} /></button>
            <button onClick={() => { setTheme('dark'); updateProfile({ theme: 'dark' }) }} className="flex-1 z-10 flex justify-center"><Moon size={20} className={theme === 'dark' ? 'text-blue-400' : 'text-zinc-500'} /></button>
            <button onClick={() => { setTheme('night'); updateProfile({ theme: 'night' }) }} className="flex-1 z-10 flex justify-center"><Sparkles size={20} className={theme === 'night' ? 'text-purple-400' : 'text-zinc-500'} /></button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Personalidad de la IA</h2>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => { setPace('calm'); updateProfile({ pace: 'calm' }) }}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${pace === 'calm' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-gray-50 dark:bg-zinc-800'}`}
          >
            <Coffee size={24} className="text-blue-500" />
            <span className="font-bold">Calmado</span>
            <p className="text-[10px] text-center opacity-60">Explicaciones detalladas y pausadas.</p>
          </button>
          <button 
            onClick={() => { setPace('direct'); updateProfile({ pace: 'direct' }) }}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${pace === 'direct' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-transparent bg-gray-50 dark:bg-zinc-800'}`}
          >
            <Zap size={24} className="text-orange-500" />
            <span className="font-bold">Directo</span>
            <p className="text-[10px] text-center opacity-60">Respuestas rápidas y al grano.</p>
          </button>
        </div>
      </section>

      {saving && <div className="text-center text-[10px] animate-pulse">Sincronizando con la nube...</div>}
    </div>
  )
}
