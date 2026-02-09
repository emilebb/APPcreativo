import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Sidebar from "@/components/Sidebar"
import { Providers } from "@/components/Providers"
import "./globals.css"

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()

  let user = null;
  try {
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
    )

    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    console.error("Error getting user in layout:", error)
    // Continuar sin usuario si hay error
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="flex h-screen bg-white dark:bg-[#212121]">
            {/* Barra Lateral estilo ChatGPT */}
            <aside className="w-[260px] h-full hidden md:flex flex-col border-r dark:border-zinc-800">
              <Sidebar user={user} />
            </aside>

            {/* Área de Contenido Principal */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
