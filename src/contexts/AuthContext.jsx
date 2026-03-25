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
  loading: true,
  isInitialLoading: true,
  isAuthenticated: false,
  error: null, // 🔥 NUEVO: Estado de error
  signOut: () => {},
  randomQuote: "La creatividad es la inteligencia divirtiéndose..."
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null); // 🔥 NUEVO: Estado de error

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
    let subscription = null; // 🔥 NUEVO: Referencia explícita

    // 1. Obtener sesión inicial
    const initializeAuth = async () => {
      try {
        // Obtener sesión inicial
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (error) {
            console.error('Error getting session:', error);
            setError(error);
            setUser(null);
            setSession(null);
          } else {
            setError(null);
            setUser(session?.user || null);
            setSession(session);
          }
          
          // IMPORTANTE: Garantiza que loading pase a false
          setLoading(false);
          setIsInitialLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setError(error);
          setUser(null);
          setSession(null);
          setLoading(false);
          setIsInitialLoading(false);
        }
      }
    };

    initializeAuth();

    // 2. Escuchar cambios de estado (Crucial para el login/logout)
    subscription = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        
        try {
          if (event === 'SIGNED_IN') {
            setError(null);
            setUser(session?.user || null);
            setSession(session);
          } else if (event === 'SIGNED_OUT') {
            setError(null);
            setUser(null);
            setSession(null);
          }
          
          // IMPORTANTE: Garantiza que loading pase a false en cualquier cambio
          setLoading(false);
          setIsInitialLoading(false);
        } catch (err) {
          console.error('Auth state change error:', err);
          if (mounted) {
            setError(err);
          }
        }
      }
    );

    return () => {
      mounted = false;
      // 🔥 NUEVO: Cleanup explícito y seguro
      if (subscription?.subscription) {
        subscription.subscription.unsubscribe();
      }
    };
  }, []);

  const signOut = async () => {
    try {
      setError(null);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error);
    }
  };

  const value = {
    user,
    session,
    loading,
    isInitialLoading,
    isAuthenticated: !!user,
    error, // 🔥 NUEVO: Exponer estado de error
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
