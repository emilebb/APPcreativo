"use client";

import { useState } from "react";
import { useAuth } from "@/lib/authProvider";
import { supabase } from "@/lib/supabaseClient";
import AuthModal from "@/components/AuthModal";
import Settings from "@/components/Settings";

export default function AuthButton() {
  const { session, loading } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (loading) {
    return null;
  }

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setIsMenuOpen(false);
    }
  };

  if (session) {
    return (
      <>
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 hover:shadow-md"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            Cuenta
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-neutral-200 overflow-hidden">
              <button
                onClick={() => {
                  setIsSettingsOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition"
              >
                ⚙️ Configuración
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>

        <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsAuthOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition hover:border-neutral-400 hover:bg-neutral-50 hover:shadow-md"
      >
        <span>↗</span>
        Cuenta
      </button>

      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-2xl">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-neutral-900">
                Tu cuenta
              </h2>
              <p className="text-sm text-neutral-500">
                Guarda tu progreso para volver cuando lo necesites
              </p>
            </div>

            <AuthModal onClose={() => setIsAuthOpen(false)} />

            <button
              onClick={() => setIsAuthOpen(false)}
              className="absolute right-6 top-6 text-neutral-400 transition hover:text-neutral-900"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
