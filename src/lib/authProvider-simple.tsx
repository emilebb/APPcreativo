"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  user_metadata?: any;
}

interface AuthContextType {
  session: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Simple mock authentication for demo purposes
  const createMockSession = (): User => ({
    id: 'demo-user-id',
    email: 'demo@creativex.com',
    user_metadata: {
      name: 'Demo User'
    }
  });

  useEffect(() => {
    // Check for existing session in localStorage
    if (typeof window !== 'undefined') {
      const storedSession = localStorage.getItem('auth-session');
      if (storedSession) {
        try {
          const user = JSON.parse(storedSession);
          setSession(user);
          setLoading(false);
        } catch (error) {
          console.error('Error parsing stored session:', error);
          localStorage.removeItem('auth-session');
        }
      }
    }

    // If no stored session, create a mock one
    if (!session && !loading) {
      const mockUser = createMockSession();
      setSession(mockUser);
      setLoading(false);
    }

    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
