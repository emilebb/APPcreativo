// @ts-nocheck
import { getSupabaseClient } from "@/lib/supabaseClient";

/**
 * Migra datos de localStorage a Supabase cuando el usuario se loguea.
 * Versión mejorada con mejor manejo de errores, logging y validación.
 */
export async function migrateLocalToSupabase(userId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn("Supabase client not available for migration");
    return;
  }

  try {
    // Buscar datos en localStorage
    if (typeof window === 'undefined') {
      console.warn("localStorage not available in SSR");
      return;
    }

    const raw = localStorage.getItem("current_week_v1");
    if (!raw) {
      console.log("No local data found to migrate");
      return;
    }

    // Validar datos antes de migrar
    let data;
    try {
      data = JSON.parse(raw);
      
      // Validar estructura de datos
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid data structure in localStorage");
      }
      
      console.log("🔄 Starting migration of current_week data:", {
        dataKeys: Object.keys(data),
        userId,
        timestamp: new Date().toISOString()
      });
      
    } catch (parseError) {
      console.error("❌ Error parsing localStorage data:", parseError);
      // Crear backup de datos corruptos
      localStorage.setItem("current_week_v1_backup", raw);
      localStorage.removeItem("current_week_v1");
      return;
    }

    // Migrar a Supabase con retry
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📤 Migration attempt ${attempt}/${maxRetries}`);
        
        const { error } = await supabase.from("current_week").insert({
          user_id: userId,
          data,
          migration_attempt: attempt,
          migrated_at: new Date().toISOString()
        });

        if (error) {
          lastError = error;
          console.error(`❌ Migration attempt ${attempt} failed:`, error);
          
          if (attempt < maxRetries) {
            console.log(`⏳ Retrying in ${attempt * 1000}ms...`);
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          }
        } else {
          throw error;
        }
      } else {
        // Éxito: limpiar localStorage
        localStorage.removeItem("current_week_v1");
        
        // Guardar registro de migración exitosa
        const migrationLog = {
          success: true,
          userId,
          dataKeys: Object.keys(data),
          migratedAt: new Date().toISOString(),
          attempts: attempt
        };
        
        localStorage.setItem("migration_log", JSON.stringify(migrationLog));
        console.log("✅ Migration completed successfully:", migrationLog);
        
        // Notificar al usuario (opcional)
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('migration-completed', {
            detail: migrationLog
          }));
        }
        
        return;
      }
    } catch (error) {
      lastError = error;
      console.error(`❌ Migration attempt ${attempt} threw error:`, error);
      
      if (attempt < maxRetries) {
        console.log(`⏳ Retrying in ${attempt * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }

    // Si todos los intentos fallaron
    if (lastError) {
      console.error("💥 All migration attempts failed");
      
      // Crear backup de emergencia
      const emergencyBackup = {
        originalData: raw,
        error: lastError.message,
        timestamp: new Date().toISOString(),
        userId
      };
      
      localStorage.setItem("migration_emergency_backup", JSON.stringify(emergencyBackup));
      
      // Notificar fallo
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('migration-failed', {
          detail: emergencyBackup
        }));
      }
    }

  } catch (error) {
    console.error("💥 Critical migration error:", error);
    
    // Error crítico - no limpiar localStorage para permitir reintento manual
    const criticalError = {
      error: error.message,
      timestamp: new Date().toISOString(),
      userId,
      critical: true
    };
    
    localStorage.setItem("migration_critical_error", JSON.stringify(criticalError));
  }
}

/**
 * Verifica el estado de migraciones anteriores
 */
export function getMigrationStatus() {
  if (typeof window === 'undefined') return null;
  
  try {
    const log = localStorage.getItem("migration_log");
    const backup = localStorage.getItem("migration_emergency_backup");
    const criticalError = localStorage.getItem("migration_critical_error");
    
    return {
      lastMigration: log ? JSON.parse(log) : null,
      emergencyBackup: backup ? JSON.parse(backup) : null,
      criticalError: criticalError ? JSON.parse(criticalError) : null
    };
  } catch (error) {
    console.error("Error getting migration status:", error);
    return null;
  }
}

/**
 * Limpia logs de migración antiguos
 */
export function clearMigrationLogs() {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem("migration_log");
    localStorage.removeItem("migration_emergency_backup");
    localStorage.removeItem("migration_critical_error");
    localStorage.removeItem("current_week_v1_backup");
    console.log("🧹 Migration logs cleared");
  } catch (error) {
    console.error("Error clearing migration logs:", error);
  }
}
