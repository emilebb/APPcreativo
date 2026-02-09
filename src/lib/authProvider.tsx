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
          avatar_color,
        last_seen: new Date().toISOString(),
      });
    } else {
      // Update last_seen
      await supabase
        .from("profiles")
        .update({ last_seen: new Date().toISOString() })
        .eq("id", userId);
    }
  } catch (error) {
    console.error("Error managing profile:", error);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for demo session first
    const demoSession = localStorage.getItem('demo-session');
    if (demoSession) {
      try {
        const demoUser = JSON.parse(demoSession);
        // Create a mock session object
        const mockSession = {
          user: demoUser,
          access_token: 'demo-token',
          refresh_token: 'demo-refresh',
          expires_at: Date.now() / 1000 + 3600, // 1 hour from now
          expires_in: 3600
        } as Session;
        
        setSession(mockSession);
        setLoading(false);
        return;
      } catch (error) {
        console.error("Error parsing demo session:", error);
      }
    }

    if (!supabase) {
      setLoading(false);
      return;
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error getting session:", error);
        setLoading(false);
        return;
      }
      
      setSession(session);
      setLoading(false);

      if (session?.user) {
        createProfileIfNeeded(session.user.id, session.user.email);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      setSession(session);

      if (event === "SIGNED_IN" && session?.user) {
        await createProfileIfNeeded(session.user.id, session.user.email);
        await migrateLocalToSupabase(session.user.id);
      }
    });

    return () => subscription?.unsubscribe();
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
