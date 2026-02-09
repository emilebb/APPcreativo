"use client";

import { useState } from "react";
import { LogIn, User, Mail, Lock } from "lucide-react";

export default function QuickLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Por favor ingresa email y contraseña");
      return;
    }

    setIsLoading(true);
    try {
      // Import supabase dynamically
      const supabaseModule = await import("@/lib/supabaseClient");
      const supabase = supabaseModule.supabase;
      
      if (supabase) {
        console.log("Attempting login with:", email);
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (error) {
          console.error("Login error:", error);
          alert("Error de login: " + error.message);
        } else if (data.user) {
          console.log("Login successful:", data.user.id);
          localStorage.setItem('auth-session', JSON.stringify(data.user));
          alert("¡Login exitoso! Recarga la página.");
          window.location.reload();
        }
      } else {
        alert("Supabase no configurado");
      }
    } catch (err) {
      console.error("Login exception:", err);
      alert("Error: " + err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      alert("Por favor ingresa email y contraseña");
      return;
    }

    setIsLoading(true);
    try {
      // Import supabase dynamically
      const supabaseModule = await import("@/lib/supabaseClient");
      const supabase = supabaseModule.supabase;
      
      if (supabase) {
        console.log("Attempting signup with:", email);
        
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              name: email.split('@')[0]
            }
          }
        });

        if (error) {
          console.error("Signup error:", error);
          alert("Error de registro: " + error.message);
        } else if (data.user) {
          console.log("Signup successful:", data.user.id);
          localStorage.setItem('auth-session', JSON.stringify(data.user));
          alert("¡Registro exitoso! Recarga la página.");
          window.location.reload();
        } else {
          alert("Revisa tu email para confirmar la cuenta.");
        }
      } else {
        alert("Supabase no configurado");
      }
    } catch (err) {
      console.error("Signup exception:", err);
      alert("Error: " + err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginMode) {
      handleLogin();
    } else {
      handleSignUp();
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 p-4 w-80">
      <div className="flex items-center gap-2 mb-3">
        <User className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
        <span className="text-sm font-medium text-neutral-900 dark:text-white">
          {isLoginMode ? 'Iniciar Sesión' : 'Registrarse'}
        </span>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-neutral-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              className="w-full pl-7 pr-2 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
              placeholder="tu@email.com"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-neutral-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full pl-7 pr-2 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
              {isLoginMode ? 'Iniciando...' : 'Registrando...'}
            </>
          ) : (
            <>
              <LogIn className="w-3 h-3" />
              {isLoginMode ? 'Iniciar Sesión' : 'Registrarse'}
            </>
          )}
        </button>
      </form>
      
      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={() => setIsLoginMode(!isLoginMode)}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {isLoginMode ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </div>
  );
}
