import Sidebar from "@/components/Sidebar"
import { Providers } from "@/components/Providers"
import { AuthProvider } from "../src/lib/authProvider";
import { SentryInit } from "@/components/SentryInit";
import PWARegister from "@/components/PWARegister";
import "./globals.css"

export const metadata = {
  title: "CreationX - Plataforma Creativa",
  description: "Tu espacio creativo profesional para proyectos, moodboards y mindmaps",
  icons: {
    icon: [
      { url: "/ChatGPT Image 11 feb 2026, 02_07_12 p.m..png", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" }
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var t = localStorage.getItem('theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.setAttribute('data-theme', t || 'light');
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <SentryInit />
        <PWARegister />
        <AuthProvider>
          <Providers>
            <div className="flex h-screen bg-white dark:bg-[#212121] overflow-hidden">
              {/* Barra Lateral estilo ChatGPT */}
              <Sidebar />

              {/* Área de Contenido Principal */}
              <div className="flex-1 flex flex-col relative overflow-hidden pt-16 md:pt-0">
                {children}
              </div>
            </div>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  )
}
