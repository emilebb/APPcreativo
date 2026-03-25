"use client";

import { useAuth } from "@/lib/authProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingScreen from "@/components/ui/LoadingScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
  message?: string;
}

/**
 * ProtectedRoute - Wrapper para rutas que requieren autenticación
 * 
 * Usa la misma lógica que AuthGuard pero con mensajes personalizados
 * para cada página específica
 */
export default function ProtectedRoute({ children, message }: ProtectedRouteProps) {
  const { user, loading, isAuthChecking, isExiting } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Solo redirigir cuando ambos estados de carga sean false
    if (!loading && !isAuthChecking && !user) {
      console.log("ProtectedRoute: No authenticated user, redirecting to login");
      router.push('/login');
    }
  }, [user, loading, isAuthChecking, router]);

  // Mientras Supabase verifica la sesión, mostramos la LoadingScreen profesional
  if (loading || isAuthChecking) {
    return (
      <div className={`transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
        <LoadingScreen message={message} />
      </div>
    );
  }

  // Si no hay sesión, no renderizamos nada (el useEffect se encargará de redirigir)
  if (!user) {
    return null;
  }

  // Si hay sesión, renderizamos los hijos
  return <>{children}</>;
}
