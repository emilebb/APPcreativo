import { createClient } from "@supabase/supabase-js";

// Try environment variables first, then localStorage fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                      typeof window !== 'undefined' && localStorage.getItem('temp-supabase-url');
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                          typeof window !== 'undefined' && localStorage.getItem('temp-supabase-key');

console.log('Supabase config:', { supabaseUrl, supabaseAnonKey });

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export { createClient };

