/**
 * AUTH PROVIDER MEJORADO - 3 estados profesionales
 * loading | authed | guest
 */

"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

type AuthState =
  | { status: "loading"; session: null }
  | { status: "guest"; session: null }
  | { status: "authed"; session: any };

const AuthCtx = createContext<AuthState>({ status: "loading", session: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => {
    try {
      return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    } catch (error) {
      console.error("Error creating Supabase client:", error);
      return null;
    }
  }, []);

  const [state, setState] = useState<AuthState>({ status: "loading", session: null });

  useEffect(() => {
    if (!supabase) {
      setState({ status: "guest", session: null });
      return;
    }

    let mounted = true;

    // Timeout de seguridad: si después de 5 segundos no hay respuesta, asumir guest
    const timeout = setTimeout(() => {
      if (mounted && state.status === "loading") {
        console.warn("Auth timeout - assuming guest");
        setState({ status: "guest", session: null });
      }
    }, 5000);

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!mounted) return;
        clearTimeout(timeout);
        
        if (error) {
          console.error("Error getting session:", error);
          setState({ status: "guest", session: null });
          return;
        }

        const session = data.session ?? null;
        setState(session ? { status: "authed", session } : { status: "guest", session: null });
      })
      .catch((error) => {
        if (!mounted) return;
        clearTimeout(timeout);
        console.error("Error in getSession:", error);
        setState({ status: "guest", session: null });
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setState(session ? { status: "authed", session } : { status: "guest", session: null });
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  return <AuthCtx.Provider value={state}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
