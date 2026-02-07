"use client";

import ChatContainer from "@/components/chat/ChatContainer";
import AuthButton from "@/components/AuthButton";

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full items-stretch px-4 py-4 text-neutral-900 sm:px-8 sm:py-8">
      <div className="absolute right-4 top-4 sm:right-8 sm:top-8">
        <AuthButton />
      </div>
      
      <section id="chat" className="w-full">
        <ChatContainer />
      </section>
    </main>
  );
}
