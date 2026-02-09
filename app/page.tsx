"use client";

import ChatContainer from "@/components/chat/ChatContainer";
import QuickLogin from "@/components/QuickLogin";
import DiagnosticSupabase from "@/components/DiagnosticSupabase";

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full items-stretch px-4 py-4 text-neutral-900 sm:px-8 sm:py-8">
      <QuickLogin />
      <DiagnosticSupabase />
      <section id="chat" className="w-full">
        <ChatContainer />
      </section>
    </main>
  );
}
