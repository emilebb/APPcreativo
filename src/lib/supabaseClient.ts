// Global polyfill for SSR - must be before any imports
if (typeof globalThis !== 'undefined' && typeof globalThis.window === 'undefined') {
  (globalThis as any).window = {
    location: {
      href: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3000',
      origin: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3000',
      protocol: 'http:',
      host: 'localhost:3000',
      hostname: 'localhost',
      port: '3000',
      pathname: '/',
      search: '',
      hash: ''
    }
  };
}

// Also polyfill location directly
if (typeof globalThis !== 'undefined' && typeof globalThis.location === 'undefined') {
  (globalThis as any).location = {
    href: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3000',
    origin: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: ''
  };
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false, // ← Disable to fix SSR location error
    },
  }
);

// Helper function for compatibility
export function getSupabaseClient() {
  return supabase;
}

