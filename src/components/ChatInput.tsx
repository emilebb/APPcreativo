import { ArrowUp } from "lucide-react"

export const ChatInput = () => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-[var(--chat-bg)] via-[var(--chat-bg)] to-transparent pt-10 pb-6">
      <div className="max-w-3xl mx-auto px-4 relative">
        <div className="relative border border-[var(--border-subtle)] rounded-2xl shadow-sm bg-[var(--chat-ai-msg)] focus-within:ring-1 focus-within:ring-zinc-400 transition-all">
          <textarea 
            rows={1}
            placeholder="Envía un mensaje..."
            className="w-full p-4 pr-12 bg-transparent outline-none resize-none min-h-[56px] max-h-[200px]"
          />
          <button className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black hover:opacity-80 transition-opacity">
            <ArrowUp size={18} />
          </button>
        </div>
        <p className="text-[10px] text-center mt-3 text-zinc-500">
          CreativeBlock puede cometer errores. Considera verificar la información importante.
        </p>
      </div>
    </div>
  )
}
