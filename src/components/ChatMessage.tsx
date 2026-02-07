export const ChatMessage = ({ role, content }: { role: 'user' | 'assistant', content: string }) => {
  return (
    <div className={`w-full py-8 border-b border-[var(--border-subtle)] ${
      role === 'assistant' ? 'bg-[var(--chat-ai-msg)]' : 'bg-[var(--chat-user-msg)]'
    }`}>
      <div className="max-w-3xl mx-auto px-4 flex gap-6">
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 ${
          role === 'assistant' ? 'bg-emerald-600 text-white' : 'bg-zinc-500 text-white'
        }`}>
          {role === 'assistant' ? 'AI' : 'U'}
        </div>
        {/* Texto */}
        <div className="prose dark:prose-invert max-w-none leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  )
}
