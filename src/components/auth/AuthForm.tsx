"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Github,
  Chrome
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type AuthMode = 'login' | 'signup';

export default function AuthForm({ initialMode = 'login' }: { initialMode?: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: fullName,
            }
          }
        });

        if (error) throw error;
        setMessage({ 
          type: 'success', 
          text: '¡Registro exitoso! Por favor, revisa tu correo electrónico para confirmar tu cuenta.' 
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        // Small delay to allow auth state to propagate, then navigate
        await new Promise(resolve => setTimeout(resolve, 100));
        router.push('/explore');
      }
    } catch (error: any) {
      let errorText = error.message;
      if (error.message === 'Invalid login credentials') {
        errorText = 'Email o contraseña incorrectos.';
      } else if (error.message === 'Email not confirmed') {
        errorText = 'Tu email aún no ha sido confirmado. Revisa tu bandeja de entrada.';
      }
      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setMessage(null);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8 overflow-hidden relative"
      >
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Lock className="text-white w-6 h-6" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white text-center mb-2">
            {mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-center mb-8">
            {mode === 'login' 
              ? 'Introduce tus credenciales para acceder' 
              : 'Únete a CreacionX e impulsa tu creatividad'}
          </p>

          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-6 p-4 rounded-2xl flex items-start gap-3 ${
                  message.type === 'success' 
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' 
                    : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                }`}
              >
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                <p className="text-sm font-medium">{message.text}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAuth} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="Juan Pérez"
                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-violet-500 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="email"
                  required
                  placeholder="ejemplo@email.com"
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-violet-500 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Contraseña</label>
                {mode === 'login' && (
                  <button type="button" className="text-xs text-violet-600 dark:text-violet-400 hover:underline">
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-violet-500 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 active:scale-95 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-violet-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Entrar' : 'Registrarse'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-800"></div>
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">O continuar con</span>
            <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-800"></div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
              <Github className="w-5 h-5" />
              <span className="font-medium">GitHub</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
              <Chrome className="w-5 h-5" />
              <span className="font-medium">Google</span>
            </button>
          </div>

          <p className="mt-8 text-center text-zinc-500 dark:text-zinc-400">
            {mode === 'login' ? '¿Aún no tienes cuenta?' : '¿Ya tienes una cuenta?'}
            <button
              onClick={toggleMode}
              className="ml-2 text-violet-600 dark:text-violet-400 font-bold hover:underline"
            >
              {mode === 'login' ? 'Crea una aquí' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
