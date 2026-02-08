"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/authProvider";

interface UserStats {
  totalSessions: number;
  totalProjects: number;
  totalMindMaps: number;
  totalMoodBoards: number;
  lastActive: string | null;
  memberSince: string;
  currentStreak: number;
  longestStreak: number;
}

type UseUserStatsReturn = {
  stats: UserStats;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useUserStats(): UseUserStatsReturn {
  const { session } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalSessions: 0,
    totalProjects: 0,
    totalMindMaps: 0,
    totalMoodBoards: 0,
    lastActive: null,
    memberSince: "",
    currentStreak: 0,
    longestStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!supabase || !session?.user?.id) {
      setLoading(false);
      // Establecer valores por defecto cuando no hay sesión
      setStats({
        totalSessions: 0,
        totalProjects: 0,
        totalMindMaps: 0,
        totalMoodBoards: 0,
        lastActive: null,
        memberSince: "",
        currentStreak: 0,
        longestStreak: 0,
      });
      return;
    }

    try {
      setError(null);
      
      // Obtener información básica del perfil
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("created_at, last_seen")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;

      // Contar proyectos (si existe la tabla)
      let totalProjects = 0;
      try {
        const { count: projectsCount } = await supabase
          .from("projects")
          .select("*", { count: "exact", head: true })
          .eq("user_id", session.user.id);
        totalProjects = projectsCount || 0;
      } catch (err) {
        console.log("Projects table not found, using default 0");
      }

      // Contar mind maps (si existe la tabla)
      let totalMindMaps = 0;
      try {
        const { count: mindMapsCount } = await supabase
          .from("mindmaps")
          .select("*", { count: "exact", head: true })
          .eq("user_id", session.user.id);
        totalMindMaps = mindMapsCount || 0;
      } catch (err) {
        console.log("Mindmaps table not found, using default 0");
      }

      // Contar mood boards (si existe la tabla)
      let totalMoodBoards = 0;
      try {
        const { count: moodBoardsCount } = await supabase
          .from("moodboards")
          .select("*", { count: "exact", head: true })
          .eq("user_id", session.user.id);
        totalMoodBoards = moodBoardsCount || 0;
      } catch (err) {
        console.log("Moodboards table not found, using default 0");
      }

      // Calcular sesiones (basado en actividad diaria)
      let totalSessions = 0;
      let currentStreak = 0;
      let longestStreak = 0;
      
      try {
        // Si hay una tabla de sesiones, úsala
        const { count: sessionsCount } = await supabase
          .from("user_sessions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", session.user.id);
        totalSessions = sessionsCount || 0;
      } catch (err) {
        console.log("Sessions table not found, calculating from profile activity");
        // Calcular sesiones estimadas basadas en la antigüedad del perfil
        if (profile?.created_at) {
          const daysSinceCreation = Math.ceil(
            (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          totalSessions = Math.max(1, Math.floor(daysSinceCreation * 0.7)); // Estimación conservadora
          currentStreak = Math.min(7, Math.floor(daysSinceCreation / 3)); // Streak estimado
          longestStreak = currentStreak;
        }
      }

      const memberSince = new Date(profile.created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const lastActive = profile.last_seen 
        ? new Date(profile.last_seen).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : null;

      setStats({
        totalSessions,
        totalProjects,
        totalMindMaps,
        totalMoodBoards,
        lastActive,
        memberSince,
        currentStreak,
        longestStreak,
      });
    } catch (err) {
      console.error("Error fetching user stats:", err);
      setError(err instanceof Error ? err.message : "Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [session?.user?.id]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
