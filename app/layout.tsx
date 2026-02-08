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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${display.variable} ${serif.variable} antialiased`}>
        <Providers>
          <div className="flex h-screen bg-white dark:bg-[#212121] text-zinc-900 dark:text-zinc-100">
            {/* Barra Lateral estilo ChatGPT */}
            <aside className="w-[260px] h-full bg-[#f9f9f9] dark:bg-[#171717] hidden md:flex flex-col border-r dark:border-zinc-800">
              <Sidebar />
            </aside>
            {/* Área de Contenido Principal (Chat/Proyectos) */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
