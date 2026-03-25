"use client";

import { useAuth } from "@/lib/authProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingScreen from "@/components/ui/LoadingScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
  message?: string;
}

export default function ProtectedRoute({ children, message }: ProtectedRouteProps) {
  const { user, loading, isAuthChecking } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si terminó de verificar autenticación y no hay sesión, redirigir a login
    if (!isAuthChecking && !loading && !user) {
      router.push('/login');
    }
  }, [user, loading, isAuthChecking, router]);

  // Mientras Supabase verifica la sesión, mostramos la LoadingScreen profesional
  if (isAuthChecking || loading) {
    return <LoadingScreen message={message} />;
  }

  // Si no hay sesión, no renderizamos nada (el useEffect se encargará de redirigir)
  if (!user) {
    return null;
  }

  // Si hay sesión, renderizamos los hijos
  return <>{children}</>;
}
