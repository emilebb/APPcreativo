"use client";

import { useAuth } from "@/lib/authProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isAuthChecking } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si terminó de verificar autenticación y no hay sesión, redirigir a login
    if (!isAuthChecking && !loading && !user) {
      router.push('/login');
    }
  }, [user, loading, isAuthChecking, router]);

  // Mientras Supabase verifica la sesión, mostramos un spinner
  if (isAuthChecking || loading) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/50">Cargando CreativoX...</p>
        </div>
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
