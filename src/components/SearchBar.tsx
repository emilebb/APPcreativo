"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Search, History } from "lucide-react"

export default function SearchBar({ userId }: { userId: string }) {
  const [query, setQuery] = useState("")
  const [history, setHistory] = useState<any[]>([])
  // Usa el cliente supabase compartido

  const fetchHistory = async () => {
    if (!supabase) return;
    const { data } = await supabase!.from('searches').select('query').eq('user_id', userId).order('created_at', { ascending: false }).limit(5)
    if (data) setHistory(data)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query || !supabase) return
    await supabase!.from('searches').insert({ user_id: userId, query })
    setQuery("")
    fetchHistory()
  }

  useEffect(() => { fetchHistory() }, [])

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      <form onSubmit={handleSearch} className="relative">
        <input 
          value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca ideas o recursos..."
          className="w-full p-3 pl-10 rounded-xl border dark:bg-zinc-900 dark:border-zinc-700"
        />
        <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
      </form>
      <div className="flex gap-2 flex-wrap">
        {history.map((h, i) => (
          <span key={i} className="text-xs bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded-full flex items-center gap-1">
            <History size={10} /> {h.query}
          </span>
        ))}
      </div>
    </div>
  )
}
