"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { migrateLocalToSupabase } from "@/lib/migrateLocal";

type AuthContextType = {
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ session: null, loading: true });
const AVATAR_COLORS = ["#111111", "#6B4EFF", "#0F766E", "#B45309", "#DC2626", "#7C3AED", "#059669"];


async function createProfileIfNeeded(userId: string, email: string | undefined) {
  if (!supabase) return;

  try {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (!existingProfile) {
      // Generate random avatar color
      const avatar_color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
      
      // Create profile
      await supabase.from("profiles").insert({
        id: userId,
        email: email || null,
      });
    }
  } catch (error) {
    console.error("Error creating profile:", error);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try Supabase auth
    if (supabase) {
      console.log('Attempting Supabase auth...');
      
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error("Error getting Supabase session:", error);
          setLoading(false);
          return;
        }
        
        console.log('Supabase session found:', session?.user?.id);
        setSession(session);
        setLoading(false);

        if (session?.user) {
          createProfileIfNeeded(session.user.id, session.user.email);
          migrateLocalToSupabase(session.user.id);
        }
      });

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Supabase auth state changed:", event, session?.user?.id);
        setSession(session);

        if (event === "SIGNED_IN" && session?.user) {
          // Store session in localStorage
          localStorage.setItem('auth-session', JSON.stringify(session.user));
          await createProfileIfNeeded(session.user.id, session.user.email);
          await migrateLocalToSupabase(session.user.id);
        } else if (event === "SIGNED_OUT") {
          // Clear localStorage session
          localStorage.removeItem('auth-session');
        }
      });

      return () => subscription?.unsubscribe();
    } else {
      console.log('Supabase not available, using fallback');
      setLoading(false);
    }

    // Try localStorage first for existing session
    const storedSession = localStorage.getItem('auth-session');
    if (storedSession) {
      try {
        const user = JSON.parse(storedSession);
        console.log('Using stored session from localStorage:', user);
        
        // Create a mock session object
        const mockSession = {
          user: user,
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
          expires_at: Date.now() / 1000 + 3600,
          expires_in: 3600
        } as Session;
        
        setSession(mockSession);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing stored session:', error);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
