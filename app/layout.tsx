import Sidebar from "@/components/Sidebar"
import BottomNav from "@/components/BottomNav"
import { Providers } from "@/components/Providers"
import { AuthProvider } from "../src/lib/authProvider";
import { SentryInit } from "@/components/SentryInit";
import PWARegister from "@/components/PWARegister";
import "./globals.css"

export const metadata = {
  title: "CreativoX AI - Coach Creativo Inteligente",
  description: "Coach Creativo con IA que detecta bloqueos y genera ideas, planes y contenido al instante",
  manifest: "/manifest.json",
  themeColor: "#6366f1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CreativoX AI"
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/icon-152x152.png", sizes: "152x152", type: "image/png" }
    ]
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head />
      <body suppressHydrationWarning>
        <SentryInit />
        <PWARegister />
        <AuthProvider>
          <Providers>
            <div className="flex h-screen bg-white dark:bg-[#212121] overflow-hidden">
              {/* Barra Lateral estilo ChatGPT */}
              <Sidebar />

              {/* Área de Contenido Principal */}
              <div className="flex-1 flex flex-col relative overflow-hidden pt-16 md:pt-0 pb-16 md:pb-0">
                {children}
              </div>
              
              {/* Bottom Navigation (solo móvil) */}
              <BottomNav />
            </div>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  )
}
