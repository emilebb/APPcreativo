"use client";

import { useState } from "react";
import { Send } from "lucide-react";

type ChatInputProps = {
  onSend: (text: string) => void;
  placeholder: string;
};

export default function ChatInput({ onSend, placeholder }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="mt-3 flex gap-3 items-end">
      <div className="flex-1 relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSend();
          }}
          className="relative w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-white/40 outline-none focus:border-violet-500/50 transition-colors"
          placeholder={placeholder}
        />
      </div>
      <button
        onClick={handleSend}
        className="relative group flex-shrink-0"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
        <div className="relative w-11 h-11 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center transition-all group-hover:scale-105">
          <Send className="w-4 h-4 text-white" />
        </div>
      </button>
    </div>
  );
}
