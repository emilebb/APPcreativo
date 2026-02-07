import { supabase } from "@/lib/supabaseClient";

/**
 * Migra datos de localStorage a Supabase cuando el usuario se loguea.
 * Ejecuta una sola vez, en silencio, sin avisos.
 */
export async function migrateLocalToSupabase(userId: string) {
  if (!supabase) return;

  try {
    // Buscar datos en localStorage
    const raw = localStorage.getItem("current_week_v1");
    if (!raw) return;

    const data = JSON.parse(raw);

    // Guardar en Supabase
    await supabase.from("sessions").insert({
      user_id: userId,
      data,
    });

    // Limpiar localStorage después de migrar exitosamente
    localStorage.removeItem("current_week_v1");
  } catch (error) {
    console.error("Error migrating localStorage to Supabase:", error);
    // Silencioso: no mostrar error al usuario
  }
}
