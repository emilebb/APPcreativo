"use client";

export const dynamic = 'force-dynamic';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import LoadingScreen from '@/components/ui/LoadingScreen';
import CreativeCoach from '@/components/creative/CreativeCoachOptimized';

export default function CreativeCoachPage() {
  const auth = useAuth();
  const [showRetry, setShowRetry] = useState(false);
  const router = useRouter();

  // Timeout de seguridad - si después de 5 segundos sigue cargando, mostrar opción de reintentar
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (auth?.isInitialLoading) {
        setShowRetry(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [auth?.isInitialLoading]);

  // Si el auth no existe todavía (durante el build), retornamos null
  if (!auth) return null; 

  const { user, isInitialLoading } = auth;

  useEffect(() => {
    if (!isInitialLoading && !user) {
      router.push("/login");
    }
  }, [user, isInitialLoading, router]);

  // Loading con timeout de seguridad
  if (isInitialLoading) {
    if (showRetry) {
      return (
        <div className="h-screen bg-[#0d0d10] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-white text-xl mb-2">Tu Copiloto Creativo está activando...</h2>
            <p className="text-white/60 mb-6">Esto está tardando más de lo esperado</p>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Reintentar
              </button>
              <button 
                onClick={() => router.push("/login")}
                className="block mx-auto px-6 py-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                Ir al Login
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return <LoadingScreen />;
  }
  
  if (!user) return null; // Evita renderizado protegido sin usuario

  return (
    <div className="h-screen bg-[#0d0d10]">
      <CreativeCoach 
        projectContext={null}
      />
    </div>
  );
}
