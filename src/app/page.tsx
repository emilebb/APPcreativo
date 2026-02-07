"use client";

import ChatContainer from "@/components/chat/ChatContainer";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full items-stretch px-4 py-4 text-neutral-900 sm:px-8 sm:py-8">
      <section id="chat" className="w-full">
        <ChatContainer />
      </section>
    </main>
  );
}
