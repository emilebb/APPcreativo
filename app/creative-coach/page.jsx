"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import LoadingScreen from '@/components/ui/LoadingScreen';
import CreativeCoach from '@/components/creative/CreativeCoachOptimized';
import CreativeCoachBoundary from '@/components/creative/CreativeCoachBoundary';

export default function CreativeCoachPage() {
  const { user, loading, isAuthenticated, error } = useAuth();
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

  // Si hay error de autenticación, mostrar error específico
  if (error) {
    return (
      <div className="h-screen bg-[#0d0d10] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-white text-xl mb-2">Error de Autenticación</h2>
          <p className="text-white/60 mb-6">
            {error.message || "Hubo un problema con tu sesión"}
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="block w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Reintentar
            </button>
            <button 
              onClick={() => router.push("/login")}
              className="block w-full px-6 py-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              Ir al Login
            </button>
          </div>
        </div>
      </div>
    );
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
      <CreativeCoachBoundary>
        <CreativeCoach 
          projectContext={null}
        />
      </CreativeCoachBoundary>
    </div>
  );
}
