"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    console.log("🔐 AuthProvider: Initializing auth state");

    supabase.auth.getSession().then(({ data }) => {
      console.log("🔐 AuthProvider: getSession completed", { session: !!data.session, mounted });
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false); // 🔥 CLAVE
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("🔐 AuthProvider: onAuthStateChange", { session: !!session, mounted });
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false); // 🔥 CLAVE
      }
    );

    return () => {
      console.log("🔐 AuthProvider: Cleanup");
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
