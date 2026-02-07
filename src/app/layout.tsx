import type { Metadata } from "next";
import { Bricolage_Grotesque, Fraunces } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import ThemeToggle from "@/components/ThemeToggle";

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
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-black/5 bg-white/70 px-4 py-3 backdrop-blur sm:px-8 dark:border-white/10 dark:bg-black/30">
            <h1 className="text-sm font-semibold tracking-tight">CreativeBlock</h1>
            <ThemeToggle />
          </header>
          <div className="min-h-screen">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
