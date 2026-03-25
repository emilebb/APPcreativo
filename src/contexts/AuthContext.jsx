import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Validar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Context con valor por defecto para evitar undefined
const AuthContext = createContext({
  user: null,
  session: null,
  isInitialLoading: true,
  signOut: () => {},
  randomQuote: "La creatividad es la inteligencia divirtiéndose..."
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Frases de inspiración creativa
  const inspirationalQuotes = [
    "La creatividad es la inteligencia divirtiéndose...",
    "Cada gran proyecto comienza con una simple idea...",
    "Tu imaginación es tu única limitación...",
    "El arte de crear es el arte de soñar...",
    "Transformamos ideas en realidades digitales...",
    "La innovación nace de la audacia...",
    "Cada línea de código es una pincelada...",
    "Diseña el futuro que quieres ver..."
  ];

  const [randomQuote] = useState(
    inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)]
  );

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Obtener sesión inicial
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (error) {
            console.error('Error getting session:', error);
            setUser(null);
            setSession(null);
          } else {
            setUser(session?.user || null);
            setSession(session);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setSession(null);
        }
      } finally {
        if (mounted) {
          setIsInitialLoading(false);
        }
      }
    };

    initializeAuth();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN') {
          setUser(session?.user || null);
          setSession(session);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    isInitialLoading,
    signOut,
    randomQuote
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
