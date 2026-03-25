"use client";

import { useAuth } from "@/lib/authProvider";

export default function AuthLoader({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#050505] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/50 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}
