"use client";

import { useAuth } from "@/lib/authProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingScreen from "@/components/ui/LoadingScreen";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * AuthGuard Legendario - Espera a que Supabase confirme la sesión antes de decidir
 * 
 * Este componente previene el "rebote" de login/expulsión al:
 * 1. No renderizar children hasta que loading sea false
 * 2. Esperar a que isAuthChecking sea false
 * 3. Validar el estado de user de forma consistente
 * 4. Redirigir solo cuando el estado sea estable
 */
export default function AuthGuard({ 
  children, 
  fallback,
  requireAuth = true,
  redirectTo = "/login"
}: AuthGuardProps) {
  const { user, loading, isAuthChecking } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Solo redirigir cuando ambos estados de carga sean false
    if (!loading && !isAuthChecking) {
      if (requireAuth && !user) {
        console.log("AuthGuard: No authenticated user, redirecting to:", redirectTo);
        router.push(redirectTo);
      }
      
      if (!requireAuth && user) {
        console.log("AuthGuard: User authenticated but auth not required, redirecting to /explore");
        router.push("/explore");
      }
    }
  }, [user, loading, isAuthChecking, requireAuth, redirectTo, router]);

  // Mientras verificamos autenticación, mostrar loading profesional
  if (loading || isAuthChecking) {
    return fallback || <LoadingScreen message="Verificando tu sesión..." />;
  }

  // Si se requiere autenticación pero no hay usuario, no renderizar nada (el useEffect se encargará de redirigir)
  if (requireAuth && !user) {
    return null;
  }

  // Si no se requiere autenticación pero hay usuario, no renderizar nada (el useEffect se encargará de redirigir)
  if (!requireAuth && user) {
    return null;
  }

  // Si todo está correcto, renderizar los children
  return <>{children}</>;
}
