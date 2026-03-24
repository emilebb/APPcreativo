/**
 * authProvider stub - Auth local usando localStorage
 * Reemplaza el authProvider de Firebase
 */

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

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
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<User>;
  signInWithEmail: (email: string, password: string) => Promise<User>;
  signUpWithEmail: (data: { email: string; password: string; displayName?: string }) => Promise<User>;
  signOut: () => Promise<void>;
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
  isAuthenticated: false,
  signInWithGoogle: async () => { throw new Error("Not initialized"); },
  signInWithEmail: async () => { throw new Error("Not initialized"); },
  signUpWithEmail: async () => { throw new Error("Not initialized"); },
  signOut: async () => { throw new Error("Not initialized"); },
});

export const useAuth = () => useContext(AuthContext);

// ============================================================================
// AUTH FUNCTIONS (stubs)
// ============================================================================

const USER_STORAGE_KEY = "auth_user";

const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

const setStoredUser = (user: User | null) => {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  // Stub: crea un usuario local
  const user: User = {
    id: `local-${Date.now()}`,
    email,
    displayName: email.split("@")[0],
    photoURL: null,
    emailVerified: true,
    createdAt: new Date().toISOString(),
  };
  setStoredUser(user);
  return user;
};

export const signUpWithEmail = async (data: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<User> => {
  const user: User = {
    id: `local-${Date.now()}`,
    email: data.email,
    displayName: data.displayName || data.email.split("@")[0],
    photoURL: null,
    emailVerified: false,
    createdAt: new Date().toISOString(),
  };
  setStoredUser(user);
  return user;
};

export const signInWithGoogle = async (): Promise<User> => {
  // Stub: crea un usuario de Google local
  const user: User = {
    id: `google-local-${Date.now()}`,
    email: "demo@gmail.com",
    displayName: "Usuario Demo",
    photoURL: null,
    emailVerified: true,
    createdAt: new Date().toISOString(),
  };
  setStoredUser(user);
  return user;
};

export const signOut = async (): Promise<void> => {
  setStoredUser(null);
};

export const resetPassword = async (email: string): Promise<void> => {
  // Stub: no hace nada
  console.log(`[Stub] Password reset email sent to: ${email}`);
};

export const onAuthChange = (callback: (user: User | null) => void): (() => void) => {
  // Stub: escucha cambios en localStorage
  const handler = () => {
    callback(getStoredUser());
  };
  window.addEventListener("storage", handler);
  // Llama inmediatamente con el usuario actual
  callback(getStoredUser());
  return () => window.removeEventListener("storage", handler);
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

  useEffect(() => {
    // Carga el usuario del localStorage
    const storedUser = getStoredUser();
    setUser(storedUser);
    setIsLoading(false);

    // Escucha cambios en localStorage
    const handleStorage = () => {
      setUser(getStoredUser());
    };
    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    loading: isLoading,
    isAuthenticated: !!user,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
