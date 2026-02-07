"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthModal({ onClose }: { onClose?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [success, setSuccess] = useState(false);

  if (!supabase) {
    return (
      <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          Supabase no está configurado. Contáctanos para más información.
        </p>
      </div>
    );
  }

  async function handleLogin() {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setSuccess(true);
      setTimeout(() => onClose?.(), 1000);
    }
  }

  async function handleSignup() {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setSuccess(true);
      setError("Revisa tu email para confirmar. Luego podrás entrar.");
    }
  }

  if (success) {
    return (
      <div className="space-y-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
        <div className="text-2xl">✓</div>
        <p className="text-sm font-medium text-emerald-900">
          {mode === "login" ? "¡Bienvenido de vuelta!" : "Revisa tu email para confirmar"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">
            Email
          </label>
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm placeholder:text-neutral-400 transition focus:border-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/5 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">
            Contraseña
          </label>
          <input
            type="password"
            placeholder="Mín. 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm placeholder:text-neutral-400 transition focus:border-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/5 disabled:opacity-50"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          onClick={mode === "login" ? handleLogin : handleSignup}
          disabled={loading || !email || !password}
          className="flex-1 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? "Un momento..."
            : mode === "login"
            ? "Entrar"
            : "Crear cuenta"}
        </button>
        <button
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
            setSuccess(false);
          }}
          disabled={loading}
          className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100 hover:border-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mode === "login" ? "Crear" : "Entrar"}
        </button>
      </div>

      <p className="text-center text-xs text-neutral-500 pt-1">
        {mode === "login"
          ? "¿Nuevo en Creative Coach?"
          : "¿Ya tienes cuenta?"}
      </p>
    </div>
  );
}

