import Sidebar from "@/components/Sidebar"
import { Providers } from "@/components/Providers"
import { AuthProvider } from "../src/lib/authProvider";
import { SentryInit } from "@/components/SentryInit";
import "./globals.css"

export const metadata = {
  title: "CreationX - Plataforma Creativa",
  description: "Tu espacio creativo profesional para proyectos, moodboards y mindmaps",
  icons: {
    icon: "/icon.svg",
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
      <body>
        <SentryInit />
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
