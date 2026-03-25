"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Dashboard from '@/components/dashboard/Dashboard';

export default function ExplorePage() {
  const { user, isInitialLoading, randomQuote } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // Evitar renderizado en servidor
  useEffect(() => {
    setIsClient(true);
  }, []);

  // No renderizar nada en el servidor
  if (!isClient) {
    return null;
  }

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
