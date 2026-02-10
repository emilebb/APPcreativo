"use client";

import ChatContainer from "@/components/chat/ChatContainer";

export default function ChatBloqueo() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Creative Coach
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Tu asistente personal para superar el bloqueo creativo y desbloquear tu potencial
          </p>
        </div>
        <ChatContainer />
      </div>
    </main>
  );
}
