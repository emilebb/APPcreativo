import Sidebar from "@/components/Sidebar"
import { Providers } from "@/components/Providers"
import { AuthProvider } from "../src/lib/authProvider";
import { SentryInit } from "@/components/SentryInit";
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>CreationX - Plataforma Creativa Profesional</title>
        <meta name="description" content="Tu espacio creativo profesional para proyectos, moodboards y mindmaps" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
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
