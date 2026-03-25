"use client";

export const dynamic = 'force-dynamic';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from "next/navigation";
import { useEffect } from 'react';
import LoadingScreen from '@/components/ui/LoadingScreen';
import CreativeCoach from '@/components/creative/CreativeCoachOptimized';

export default function CreativeCoachPage() {
  const auth = useAuth();

  // Si el auth no existe todavía (durante el build), retornamos null
  if (!auth) return null; 

  const { user, isInitialLoading } = auth;
  const router = useRouter();

  useEffect(() => {
    if (!isInitialLoading && !user) {
      router.push("/login");
    }
  }, [user, isInitialLoading, router]);

  if (isInitialLoading) return <LoadingScreen />;
  if (!user) return null; // Evita renderizado protegido sin usuario

  return (
    <div className="h-screen bg-[#0d0d10]">
      <CreativeCoach 
        projectContext={null}
      />
    </div>
  );
}
