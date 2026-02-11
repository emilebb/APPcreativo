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
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const [state, setState] = useState<AuthState>({ status: "loading", session: null });

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const session = data.session ?? null;
      setState(session ? { status: "authed", session } : { status: "guest", session: null });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setState(session ? { status: "authed", session } : { status: "guest", session: null });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  return <AuthCtx.Provider value={state}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
