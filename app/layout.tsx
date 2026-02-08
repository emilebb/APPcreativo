import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Sidebar from "@/components/Sidebar"
import "./globals.css"

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()

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

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="es" suppressHydrationWarning>
      <body>
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
      </body>
    </html>
  )
}
