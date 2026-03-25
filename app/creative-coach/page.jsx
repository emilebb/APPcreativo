"use client";

export const dynamic = 'force-dynamic';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import LoadingScreen from '@/components/ui/LoadingScreen';
import CreativeCoach from '@/components/creative/CreativeCoachOptimized';

export default function CreativeCoachPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Damos 500ms extra para que el socket de IA se estabilice
      const timer = setTimeout(() => setIsInitializing(false), 500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Si está cargando o inicializando, mostrar loading
  if (loading || isInitializing) {
    return <LoadingScreen message="Buscando el hilo de tus ideas..." />;
  }

  // Si no está autenticado, mostrar vista de login requerido
  if (!isAuthenticated || !user) {
    return (
      <div className="h-screen bg-[#0d0d10] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-xl mb-4">Creative Coach</h2>
          <p className="text-white/60 mb-6">Necesitas iniciar sesión para acceder a tu asistente creativo</p>
          <button 
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0d0d10]">
      <CreativeCoach 
        projectContext={null}
      />
    </div>
  );
}
