import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/lib/useProfile';
import type { StartTool } from '@/types/profile';

/**
 * Hook para redirigir al usuario a su herramienta de inicio preferida
 * Solo se ejecuta en la página principal
 */
export function useStartTool() {
  const { profile } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (!profile?.start_tool) return;

    const routes: Record<StartTool, string> = {
      explore: '/explore',
      moodboard: '/moodboard',
      mindmap: '/mindmap',
      canvas: '/canvas'
    };

    const targetRoute = routes[profile.start_tool];
    
    // Solo redirigir si estamos en la página principal
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      router.push(targetRoute);
    }
  }, [profile?.start_tool, router]);
}
