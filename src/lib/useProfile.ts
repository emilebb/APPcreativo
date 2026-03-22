// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/authProvider";
import type { Profile, CreativeMode } from "@/types/profile";

type UseProfileReturn = {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refetch: () => Promise<void>;
};

export function useProfile(): UseProfileReturn {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    console.log("🔍 fetchProfile called - usando localStorage");
    
    if (!user?.id) {
      console.log("❌ No user available");
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      // Cargar perfil desde localStorage
      const storedProfile = localStorage.getItem(`profile-${user.id}`);
      
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        console.log("✅ Profile loaded from localStorage:", parsedProfile);
        setProfile(parsedProfile);
      } else {
        // Crear perfil por defecto
        console.log("📝 Creating default profile");
        const defaultProfile: Profile = {
          id: user.id,
          username: user.email?.split('@')[0] || 'usuario',
          full_name: user.user_metadata?.name || 'Usuario Creativo',
          avatar_url: '',
          avatar_color: '#8b5cf6',
          email: user.email || 'usuario@creationx.app',
          creative_mode: 'calm' as CreativeMode,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        localStorage.setItem(`profile-${user.id}`, JSON.stringify(defaultProfile));
        console.log("✅ Default profile created:", defaultProfile);
        setProfile(defaultProfile);
      }
    } catch (err) {
      console.error("❌ Error in fetchProfile:", err);
      setError(err instanceof Error ? err.message : "Error al cargar perfil");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) {
      throw new Error("No hay usuario activo");
    }

    try {
      const storedProfile = localStorage.getItem(`profile-${user.id}`);
      const currentProfile = storedProfile ? JSON.parse(storedProfile) : null;
      
      if (!currentProfile) {
        throw new Error("Perfil no encontrado");
      }

      const updatedProfile = {
        ...currentProfile,
        ...updates,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem(`profile-${user.id}`, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      console.log("✅ Profile updated in localStorage:", updatedProfile);
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  };

  useEffect(() => {
    console.log("🔄 useProfile useEffect triggered:", { 
      authLoading: authLoading,
      user: !!user, 
      userId: user?.id 
    });
    
    if (authLoading) {
      console.log("🔄 Auth still loading, waiting...");
      return;
    }
    
    if (user?.id) {
      console.log("🔄 User available, fetching profile");
      fetchProfile();
    } else {
      console.log("🔄 No user found, clearing profile state");
      setProfile(null);
      setLoading(false);
      setError(null);
    }
  }, [authLoading, user?.id]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile,
  };
}
