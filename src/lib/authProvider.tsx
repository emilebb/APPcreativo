// @ts-nocheck
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthChange, signInWithGoogle as firebaseSignIn, signOut as firebaseSignOut } from "./firebaseAuth";
import { User as FirebaseUser } from "firebase/auth";

interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuchar cambios en la autenticación de Firebase
    const unsubscribe = onAuthChange((firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Usuario autenticado con Firebase
        const mappedUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || 'usuario@creationx.app',
          user_metadata: {
            name: firebaseUser.displayName || 'Usuario Creativo',
            avatar_url: firebaseUser.photoURL || ''
          }
        };
        setUser(mappedUser);
        console.log('✅ Usuario autenticado con Firebase:', mappedUser.email);
      } else {
        // No hay usuario autenticado, usar usuario simulado
        const mockUserId = localStorage.getItem('mock_user_id') || `user-${Date.now()}`;
        
        if (!localStorage.getItem('mock_user_id')) {
          localStorage.setItem('mock_user_id', mockUserId);
        }

        const mockUser: User = {
          id: mockUserId,
          email: 'usuario@creationx.app',
          user_metadata: {
            name: 'Usuario Creativo',
            avatar_url: ''
          }
        };

        setUser(mockUser);
        console.log('ℹ️ Usando usuario simulado (sin Firebase)');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await firebaseSignIn();
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
