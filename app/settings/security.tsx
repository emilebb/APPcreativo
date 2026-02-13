"use client";

import { Shield, Key, Smartphone, LogOut } from "lucide-react";
import { useAuth } from "@/lib/authProvider";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function SecuritySettings() {
  const { user } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/api/auth/signout";
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white tracking-tight">
          Seguridad
        </h1>
        <p className="text-neutral-500 dark:text-[#9ca3af] text-sm mt-1">
          Cuenta, contraseña y sesiones. Tu información está protegida.
        </p>
      </header>

      <section className="rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Key className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-medium text-neutral-700 dark:text-[#d1d5db] mb-1">
              Contraseña
            </h2>
            <p className="text-xs text-neutral-500 dark:text-[#6b7280] mb-3">
              Cambia tu contraseña para mantener tu cuenta segura.
            </p>
            {showChangePassword ? (
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Contraseña actual"
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-white/95 border border-neutral-200 dark:border-white/20 text-neutral-900 dark:text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-white/95 border border-neutral-200 dark:border-white/20 text-neutral-900 dark:text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(false)}
                    className="text-sm font-medium text-neutral-600 dark:text-[#9ca3af] hover:text-neutral-900 dark:hover:text-white transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Guardar contraseña
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowChangePassword(true)}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Cambiar contraseña
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-medium text-neutral-700 dark:text-[#d1d5db] mb-1">
              Autenticación en dos pasos
            </h2>
            <p className="text-xs text-neutral-500 dark:text-[#6b7280]">
              Añade una capa extra de seguridad con un código en tu teléfono. Próximamente.
            </p>
            <button
              type="button"
              disabled
              className="mt-3 text-sm font-medium text-neutral-400 dark:text-neutral-500 cursor-not-allowed"
            >
              Activar (próximamente)
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-neutral-600 dark:text-[#9ca3af]" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-neutral-700 dark:text-[#d1d5db]">
                Sesión actual
              </h2>
              <p className="text-xs text-neutral-500 dark:text-[#6b7280] mt-0.5">
                {user?.email ?? "No has iniciado sesión"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-4 border-t border-neutral-200 dark:border-white/10">
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </section>
    </div>
  );
}
