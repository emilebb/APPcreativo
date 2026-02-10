import { getSupabaseClient } from "@/lib/supabaseClient";

/**
 * Migra datos de localStorage a Supabase cuando el usuario se loguea.
 * Ejecuta una sola vez, en silencio, sin avisos.
 */
export async function migrateLocalToSupabase(userId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    // Buscar datos en localStorage
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem("current_week_v1");
      if (!raw) return;

      const data = JSON.parse(raw);
      await supabase.from("current_week").insert({
        user_id: userId,
        data,
      });

      // Limpiar localStorage después de migrar exitosamente
      localStorage.removeItem("current_week_v1");
    }
  } catch (error) {
    console.error("Error migrating localStorage to Supabase:", error);
    // Silencioso: no mostrar error al usuario
  }
}
