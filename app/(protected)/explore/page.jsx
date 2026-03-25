"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from "next/navigation";
import { useEffect } from 'react';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Dashboard from '@/components/dashboard/Dashboard';

export const viewport = {
  themeColor: '#a855f7',
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  title: 'Explorar - CreacionX',
  description: 'Gestiona tus proyectos creativos',
};

export default function ExplorePage() {
  const { user, isInitialLoading } = useAuth();
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
