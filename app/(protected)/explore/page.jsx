"use client";

import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Dashboard from '@/components/dashboard/Dashboard';

export default function ExplorePage() {
  const { user, isInitialLoading, randomQuote } = useAuth();

  // Mostrar Loading Screen mientras se inicializa la autenticación
  if (isInitialLoading) {
    return <LoadingScreen quote={randomQuote} />;
  }

  // Redirigir si no hay usuario
  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  return <Dashboard user={user} />;
}
