"use client";

import { useState } from "react";

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
    <div className="mt-3 flex gap-2">
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") handleSend();
        }}
        className="flex-1 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-neutral-400"
        placeholder={placeholder}
      />
      <button
        onClick={handleSend}
        className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
      >
        Enviar
      </button>
    </div>
  );
}
