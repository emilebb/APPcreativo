"use client";

export const dynamic = 'force-dynamic';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from "next/navigation";
import { useEffect } from 'react';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Dashboard from '@/components/dashboard/Dashboard';

export default function ExplorePage() {
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

  return <Dashboard user={user} />;
}
