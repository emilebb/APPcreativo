"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthModal({ onClose }: { onClose?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");

  if (!supabase) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-xs text-neutral-500">
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
      onClose?.();
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
      setError("Revisa tu email para confirmar.");
      onClose?.();
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <input
          type="email"
          placeholder="Tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="w-full rounded border border-neutral-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="w-full rounded border border-neutral-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={mode === "login" ? handleLogin : handleSignup}
          disabled={loading || !email || !password}
          className="flex-1 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-neutral-800"
        >
          {loading ? "Un momento..." : mode === "login" ? "Entrar" : "Crear cuenta"}
        </button>
        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          disabled={loading}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 disabled:opacity-50"
        >
          {mode === "login" ? "Crear" : "Entrar"}
        </button>
      </div>
    </div>
  );
}
