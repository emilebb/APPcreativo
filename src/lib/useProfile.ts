// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import type { Profile, CreativeMode } from "@/types/profile";

type UseProfileReturn = {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refetch: () => Promise<void>;
};

export function useProfile(): UseProfileReturn {
  const { session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !session?.user?.id) {
      console.log("🔍 No supabase client or session:", { supabase: !!supabase, session: !!session });
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log("🔍 Fetching profile for user:", session.user.id);
      
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (fetchError) {
        console.error("❌ Profile fetch error:", fetchError);
        // If profile doesn't exist, create a default one
        if (fetchError.code === 'PGRST116') {
          console.log("📝 Profile not found, creating default profile");
          const defaultProfile = {
            id: session.user.id,
            username: session.user.email?.split('@')[0] || 'user',
            full_name: session.user.user_metadata?.full_name || '',
            avatar_url: session.user.user_metadata?.avatar_url || '',
            creative_mode: 'balanced' as CreativeMode,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert(defaultProfile)
            .select()
            .single();
            
          if (insertError) {
            throw insertError;
          }
          
          console.log("✅ Default profile created:", newProfile);
          setProfile(newProfile);
        } else {
          throw fetchError;
        }
      } else {
        console.log("✅ Profile loaded:", data);
        setProfile(data);
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
    const supabase = getSupabaseClient();
    if (!supabase || !session?.user?.id) {
      throw new Error("No hay sesión activa");
    }

    try {
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", session.user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setProfile(data);
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [session?.user?.id]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile,
  };
}
