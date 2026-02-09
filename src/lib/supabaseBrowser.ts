import { createBrowserClient } from '@supabase/ssr'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: true },
    global: {
      fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(10000) }) // 10 segundos
    }
  }
)
