import type { Metadata } from "next";
import { Bricolage_Grotesque, Fraunces } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Sidebar from "@/components/Sidebar";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

const serif = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Creative Block",
  description: "Break creative block with fast AI prompts and ideas.",
};

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { 
          return cookieStore.get(name)?.value 
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <div className="flex h-screen bg-white dark:bg-[#212121]">
          <aside className="w-[260px] h-full hidden md:flex flex-col border-r dark:border-zinc-800">
            <Sidebar user={user} />
          </aside>
          <main className="flex-1 flex flex-col overflow-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
