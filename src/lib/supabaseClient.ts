import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let supabaseClient: ReturnType<typeof createClient> | null = null;

export const supabase = (() => {
  // Only create client on client side to avoid SSR issues
  if (typeof window !== 'undefined' && !supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabaseClient;
})();

// Helper function to get client safely
export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // Return null or mock client for SSR
    return null;
  }
  return supabase;
}

