"use client";

import ChatContainer from "@/components/chat/ChatContainer";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16 text-neutral-900">
      <section id="chat" className="w-full">
        <ChatContainer />
      </section>
    </main>
  );
}
