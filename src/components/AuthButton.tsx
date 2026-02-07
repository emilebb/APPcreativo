"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authProvider";
import { useProfile } from "@/lib/useProfile";
import { supabase } from "@/lib/supabaseClient";
import AuthModal from "@/components/AuthModal";

export default function AuthButton() {
  const { session, loading } = useAuth();
  const { profile } = useProfile();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setAvatarError(false);
    setAvatarLoaded(false);
  }, [profile?.avatar_url]);

  if (loading) {
    return null;
  }

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setIsMenuOpen(false);
    }
  };

  const initial = profile?.email?.[0]?.toUpperCase() || "?";
  const showImage = Boolean(profile?.avatar_url) && !avatarError;
  const hideInitial = showImage && avatarLoaded;

  if (session) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="relative flex items-center justify-center h-10 w-10 rounded-full text-white text-sm font-medium shadow-sm transition hover:shadow-md overflow-hidden"
          style={{ backgroundColor: profile?.avatar_color || "#111111" }}
        >
          <span className="relative z-10" style={{ opacity: hideInitial ? 0 : 1 }}>
            {initial}
          </span>
          {showImage ? (
            <img
              src={profile?.avatar_url || ""}
              alt="Avatar"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ opacity: avatarLoaded ? 1 : 0 }}
              onLoad={() => setAvatarLoaded(true)}
              onError={() => {
                setAvatarError(true);
                setAvatarLoaded(false);
              }}
            />
          ) : null}
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-neutral-200 overflow-hidden z-50">
            <button
              onClick={() => {
                router.push("/settings");
                setIsMenuOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition"
            >
              ⚙️ Ajustes
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
