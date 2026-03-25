"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/ui/LoadingScreen';
import CreativeCoach from '@/components/creative/CreativeCoach';

export default function CreativeCoachPage() {
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

  return (
    <div className="h-screen bg-[#0d0d10]">
      <CreativeCoach 
        projectId={null}
        projectType="general"
        projectData={null}
      />
    </div>
  );
}
