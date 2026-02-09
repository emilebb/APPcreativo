"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authProvider";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert("Por favor ingresa email y contraseña");
      return;
    }

    try {
      setLoading(true);
      // For demo purposes, create a mock session
      // In production, this would use real Supabase auth
      const mockUser = {
        id: 'demo-user-id',
        email: email,
        user_metadata: {
          name: email.split('@')[0]
        }
      };
      
      // Mock successful sign in
      alert(`¡Bienvenido ${email}! (Modo Demo)`);
      
      // Redirect to home after successful login
      setTimeout(() => {
        router.push('/');
      }, 1000);
      
    } catch (error) {
      console.error("Error signing in:", error);
      alert("Error al iniciar sesión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setLoading(true);
    
    // Create a mock session in localStorage
    const mockUser = {
      id: 'demo-user-id',
      email: 'demo@creativex.com',
      user_metadata: {
        name: 'Demo User'
      }
    };
    
    // Store mock session
    localStorage.setItem('demo-session', JSON.stringify(mockUser));
    
    alert('¡Modo Demo Activado! Podrás crear proyectos.');
    
    setTimeout(() => {
      router.push('/');
      setLoading(false);
    }, 1000);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              CreationX Demo
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Acceso rápido para probar la aplicación
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
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
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:text-white"
                placeholder="•••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition"
            >
              🚀 Entrar en Modo Demo
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Modo Demo: Crea proyectos sin necesidad de cuenta real
            </p>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Activando modo demo...
                </>
              ) : (
                <>
                  🚀 Activar Modo Demo
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              Modo Demo: Crea proyectos sin necesidad de cuenta real
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Podrás crear moodboards, mapas mentales y pizarras
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
