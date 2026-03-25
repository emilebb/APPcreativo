"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from "next/navigation";
import { useEffect } from 'react';
import LoadingScreen from '@/components/ui/LoadingScreen';
import CreativeCoach from '@/components/creative/CreativeCoach';

export const viewport = {
  themeColor: '#a855f7',
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  title: 'Creative Coach - CreacionX',
  description: 'Tu asistente creativo inteligente',
};

export default function CreativeCoachPage() {
  const { user, isInitialLoading } = useAuth();
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
        projectId={null}
        projectType="general"
        projectData={null}
      />
    </div>
  );
}
