/**
 * LOGIN TOP 1 - AppCreativo
 * Flujo inteligente con detección de email y onboarding creativo
 */

"use client";

import { Suspense, useState, useEffect } from "react";
import { useAuth } from "@/lib/authProvider";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, Loader2, Check } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabaseClient";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  
  // Estados del flujo TOP 1
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados de detección inteligente
  const [emailStatus, setEmailStatus] = useState<'checking' | 'exists' | 'new' | null>(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Redirección inteligente tras login
  useEffect(() => {
    if (!authLoading && user) {
      if (!user.user_metadata?.onboarding_completed) {
        router.replace('/onboarding');
        return;
      }
      const from = searchParams.get('from');
      if (from && from.startsWith('/') && !from.startsWith('/login') && !from.startsWith('/signup') && !from.startsWith('/auth')) {
        router.replace(from);
      } else {
        router.replace('/explore');
      }
    }
  }, [user, authLoading, router, searchParams]);

  // Detección inteligente de email
  const checkEmailExists = async (emailToCheck: string) => {
    if (!emailToCheck || !emailToCheck.includes('@')) {
      setEmailStatus(null);
      setIsLoginMode(true);
      return;
    }

    setCheckingEmail(true);
    setEmailStatus('checking');

    try {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      // Verificar si el usuario existe
      const { error } = await supabase.auth.signInWithPassword({
        email: emailToCheck,
        password: 'dummy-password-for-check'
      });

      if (error?.message?.includes('Invalid login credentials')) {
        // El usuario existe pero la contraseña es incorrecta
        setEmailStatus('exists');
        setIsLoginMode(true);
      } else if (error?.message?.includes('Email not confirmed')) {
        // Usuario existe pero no confirmado
        setEmailStatus('exists');
        setIsLoginMode(true);
      } else {
        // Usuario no existe
        setEmailStatus('new');
        setIsLoginMode(false);
      }
    } catch (err) {
      // En caso de error, asumimos que es nuevo usuario
      setEmailStatus('new');
      setIsLoginMode(false);
    } finally {
      setCheckingEmail(false);
    }
  };

  // Manejar cambio de email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    // Debounce para no hacer muchas peticiones
    const timeoutId = setTimeout(() => {
      checkEmailExists(newEmail);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError("Servicio no disponible");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("La contraseña no coincide");
      setLoading(false);
      return;
    }

    // Loading con mensaje creativo
    setLoading(false);
  }

  // Registro express
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError("Servicio no disponible");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Mostrar mensaje de verificación
    setLoading(false);
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Preparando tu espacio creativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* SEO h1 - hidden but accessible */}
      <h1 className="sr-only">Iniciar Sesión - Accede a tu Espacio Creativo en CreationX</h1>
      
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Bienvenido a tu espacio creativo
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isLoginMode ? "Inicia sesión para continuar tu proyecto" : "Crea tu cuenta en segundos"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={isLoginMode ? handleLogin : handleSignup} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                />
                {checkingEmail && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  </div>
                )}
                {emailStatus === 'exists' && !checkingEmail && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              
              {/* Mensaje inteligente */}
              {emailStatus === 'new' && !checkingEmail && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    ✨ No encontramos una cuenta, creemos una en segundos
                  </p>
                </div>
              )}
            </div>

            {/* Password Input - Solo mostrar si es login o si ya se detectó que existe */}
            {(isLoginMode || emailStatus === 'exists') && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isLoginMode ? "current-password" : "new-password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    )}
                  </button>
                </div>
                
                {/* ¿Olvidaste tu contraseña? - Solo en login */}
                {isLoginMode && (
                  <div className="mt-2 text-right">
                    <Link
                      href="/reset-password"
                      className="text-sm text-blue-600 hover:text-blue-500 transition"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  ❌ {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading || checkingEmail || !email}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Preparando tu espacio creativo...
                  </>
                ) : (
                  <>
                    {isLoginMode ? "Entrar" : "Crear cuenta"}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isLoginMode ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
              <button
                type="button"
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="font-medium text-blue-600 hover:text-blue-500 transition"
              >
                {isLoginMode ? "Crear cuenta" : "Iniciar sesión"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Animated Elements */}
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white p-8">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                <Sparkles className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold mb-4">
                Tu espacio creativo te espera
              </h3>
              <p className="text-xl text-white/90 max-w-md mx-auto">
                Donde las ideas cobran vida y los proyectos florecen
              </p>
            </div>
            
            {/* Features */}
            <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">∞</div>
                <div className="text-sm text-white/80">Proyectos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">🎨</div>
                <div className="text-sm text-white/80">Creatividad</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">⚡</div>
                <div className="text-sm text-white/80">Foco</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
