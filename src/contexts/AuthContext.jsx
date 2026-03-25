import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Exportamos la instancia para usarla en toda la app
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  isInitialLoading: true,
  isAuthenticated: false,
  error: null,
  signOut: () => {},
  randomQuote: ""
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  const inspirationalQuotes = [
    "La creatividad es la inteligencia divirtiéndose...",
    "Cada gran proyecto comienza con una simple idea...",
    "Transformamos ideas en realidades digitales...",
    "Diseña el futuro que quieres ver..."
  ];

  const [randomQuote] = useState(
    inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)]
  );

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (mounted) {
          if (sessionError) throw sessionError;
          setSession(initialSession);
          setUser(initialSession?.user || null);
        }
      } catch (err) {
        if (mounted) setError(err);
      } finally {
        if (mounted) {
          setLoading(false);
          setIsInitialLoading(false);
        }
      }
    };

    initializeAuth();

    // 🔄 ESCUCHA TOTAL: Cubrimos todos los eventos de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      console.log(`🔔 Auth Event: ${event}`);

      // Actualizamos estados para cualquier evento relevante
      if (['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED', 'TOKEN_REFRESHED'].includes(event)) {
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setError(null);
      }

      setLoading(false);
      setIsInitialLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error: signError } = await supabase.auth.signOut();
      if (signError) throw signError;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    isInitialLoading,
    isAuthenticated: !!user,
    error,
    signOut,
    randomQuote
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
