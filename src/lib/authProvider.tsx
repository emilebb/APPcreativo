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
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedSession = localStorage.getItem('auth-session');
    if (storedSession) {
      try {
        const user = JSON.parse(storedSession);
        setSession(user);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing stored session:', error);
      }
    }

    setLoading(false);
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
