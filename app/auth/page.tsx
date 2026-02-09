"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = () => {
    const demoUser = {
      id: 'demo-user-id',
      email: email || 'demo@creativex.com',
      user_metadata: {
        name: email.split('@')[0] || 'Demo User'
      }
    };
    
    localStorage.setItem('auth-session', JSON.stringify(demoUser));
    alert(`¡Bienvenido ${demoUser.email}! (Modo Demo)`);
    router.push("/");
  };

  const handleSupabaseLogin = async () => {
    setIsLoading(true);
    try {
      // Try to import and use Supabase
      const supabaseModule = await import("@/lib/supabaseClient");
      const supabase = supabaseModule.supabase;
      
      if (supabase) {
        // Use demo@creativex.com for testing
        const loginEmail = email || 'demo@creativex.com';
        console.log("Attempting Supabase login with:", loginEmail);
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: "demo123"
        });

        if (error) {
          console.error("Supabase login error:", error);
          alert("Error de Supabase: " + error.message);
        } else if (data.user) {
          console.log("Supabase login successful:", data.user.id);
          localStorage.setItem('auth-session', JSON.stringify(data.user));
          alert("¡Login exitoso con Supabase!");
          router.push("/");
        }
      } else {
        alert("Supabase no está configurado. Usa el modo demo.");
      }
    } catch (err) {
      console.error("Supabase login exception:", err);
      alert("Error: " + err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              Iniciar Sesión
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Accede a tu cuenta CreationX
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:text-white"
                placeholder="tu@email.com"
              />
            </div>

            <button
              onClick={handleSupabaseLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition mb-3"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Conectando con Supabase...
                </>
              ) : (
                "🔐 Login con Supabase"
              )}
            </button>

            <button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <span className="text-lg">🎨</span>
              Modo Demo (Sin Supabase)
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
            <p>
              <strong>Modo Demo:</strong> Usa cualquier email para probar la aplicación.<br/>
              <strong>Supabase:</strong> Usa "demo@creativex.com" y contraseña "demo123".
            </p>
            <p className="mt-2 text-xs">
              Si el login falla, ejecuta el script CREATE_DEMO_USER.sql en tu Supabase.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
