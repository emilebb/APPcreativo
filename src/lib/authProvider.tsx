/**
 * authProvider - Autenticación con Supabase
 * Reemplaza el stub de localStorage por Supabase Auth
 */

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

// ============================================================================
// TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: string;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
    [key: string]: any;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loading: boolean;  // alias para compatibilidad
  isAuthChecking: boolean; // Nuevo estado para controlar el parpadeo
  isExiting: boolean; // Para la transición suave de salida
  sessionConfirmed: boolean; // Confirmación de sesión estable
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<User>;
  signInWithEmail: (email: string, password: string) => Promise<User>;
  signUpWithEmail: (data: { email: string; password: string; displayName?: string }) => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  loading: true,
  isAuthChecking: true,
  isExiting: false,
  sessionConfirmed: false,
  isAuthenticated: false,
  signInWithGoogle: async () => { throw new Error("Not initialized"); },
  signInWithEmail: async () => { throw new Error("Not initialized"); },
  signUpWithEmail: async () => { throw new Error("Not initialized"); },
  signOut: async () => { throw new Error("Not initialized"); },
  resetPassword: async () => { throw new Error("Not initialized"); },
});

import { useRouter } from "next/navigation";

export const useAuth = () => useContext(AuthContext);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const mapSupabaseUser = (supabaseUser: any): User => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    displayName: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split("@")[0] || null,
    photoURL: supabaseUser.user_metadata?.avatar_url || null,
    emailVerified: supabaseUser.email_confirmed_at ? true : false,
    createdAt: supabaseUser.created_at,
    user_metadata: supabaseUser.user_metadata,
  };
};

// ============================================================================
// AUTH FUNCTIONS
// ============================================================================

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  if (!data.user) throw new Error("No user returned");
  return mapSupabaseUser(data.user);
};

export const signUpWithEmail = async (data: { email: string; password: string; displayName?: string }): Promise<User> => {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.displayName,
      },
    },
  });
  if (error) throw error;
  if (!authData.user) throw new Error("No user returned");
  return mapSupabaseUser(authData.user);
};

export const signInWithGoogle = async (): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  if (error) throw error;
  // Nota: OAuth redirige, por lo que este código no se ejecutará inmediatamente
  // El usuario será redirigido de vuelta a la app
  throw new Error("OAuth redirect in progress");
};

export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const resetPassword = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
};

export const onAuthChange = (callback: (user: User | null) => void): (() => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      callback(mapSupabaseUser(session.user));
    } else {
      callback(null);
    }
  });
  return () => subscription.unsubscribe();
};

export const isFirebaseAvailable = (): boolean => false;

export const getFirebaseError = (error: any): string => {
  return error?.message || "An error occurred";
};

// ============================================================================
// PROVIDER
// ============================================================================

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(true); // Nuevo estado para evitar parpadeo
  const [isExiting, setIsExiting] = useState(false); // Para la transición suave de salida
  const [sessionConfirmed, setSessionConfirmed] = useState(false); // Nuevo estado para confirmación de sesión
  const router = useRouter();

  useEffect(() => {
    let mounted = true; // Prevenir actualizaciones de estado si el componente se desmonta
    
    // Obtener sesión actual
    const getInitialSession = async () => {
      try {
        console.log("AuthProvider: Getting initial session...");
        const { data: { session } } = await supabase.auth.getSession();
        console.log("AuthProvider: Session data:", session);
        
        if (mounted) {
          if (session?.user) {
            console.log("AuthProvider: User found, setting user:", session.user.email);
            setUser(mapSupabaseUser(session.user));
            setSessionConfirmed(true);
          } else {
            console.log("AuthProvider: No session found");
            setSessionConfirmed(false);
          }
        }
      } catch (error) {
        console.error("Error getting session:", error);
        if (mounted) {
          setSessionConfirmed(false);
        }
      } finally {
        if (mounted) {
          // Un pequeño delay extra para suavidad visual
          setTimeout(() => {
            setIsLoading(false);
            setIsAuthChecking(false); // Terminamos de verificar la autenticación
          }, 800);
        }
      }
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth Event:", event, "Session:", session);
      
      if (!mounted) return;
      
      if (session?.user) {
        console.log("AuthProvider: Setting user from event:", session.user.email);
        setUser(mapSupabaseUser(session.user));
        setSessionConfirmed(true);
        
        // Si acaba de iniciar sesión, lo mandamos a explorar automáticamente
        if (event === 'SIGNED_IN') {
          console.log("AuthProvider: SIGNED_IN detected, redirecting to explore");
          
          // Esperamos un poco y activamos la animación de salida
          setTimeout(() => {
            setIsExiting(true); // Clase CSS para hacer fade-out
            setTimeout(() => {
              router.push('/explore');
            }, 500); // Quitamos el componente del DOM después de la animación
          }, 1500); // Tiempo total de carga
        }
      } else {
        console.log("AuthProvider: Setting user to null");
        setUser(null);
        setSessionConfirmed(false);
        if (event === 'SIGNED_OUT') {
          router.push('/login');
        }
      }
      // Asegurar que isLoading sea false después del primer evento
      setTimeout(() => {
        if (mounted) {
          setIsLoading(false);
          setIsAuthChecking(false); // Terminamos de verificar la autenticación
        }
      }, 800);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    loading: isLoading,
    isAuthChecking,
    isExiting,
    sessionConfirmed,
    isAuthenticated: !!user,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;