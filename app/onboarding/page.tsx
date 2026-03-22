"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../src/lib/authProvider";
import { ArrowRight, Sparkles } from "lucide-react";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleStart = () => {
    if (userName.trim()) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        router.push('/start');
      }, 1500);
    }
  };


  return (
    <div className="min-h-screen bg-[#1a1d29] flex flex-col items-center justify-center p-4">
      {/* Logo y Branding */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-3 bg-[#252836] px-6 py-4 rounded-2xl border border-gray-700/50 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold text-white">CreativoX AI</h1>
            <p className="text-sm text-gray-400">Coach Creativo Inteligente</p>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="w-full max-w-xl">
        {/* Saludo */}
        <div className="text-center mb-8">
          <h2 className="text-5xl sm:text-6xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            ¡Hola!
            <span className="inline-block animate-wave">👋</span>
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Soy tu coach creativo con IA. Voy a ayudarte a superar bloqueos y generar ideas increíbles.
          </p>
        </div>

        {/* Input de Nombre */}
        <div className="bg-[#252836] rounded-2xl p-6 border border-gray-700/50 mb-6">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleStart()}
            placeholder="¿Cómo te llamas?"
            className="w-full bg-transparent text-white text-lg placeholder-gray-500 border-none outline-none"
            autoFocus
          />
        </div>

        {/* Botón Comenzar */}
        <button
          onClick={handleStart}
          disabled={!userName.trim() || isTyping}
          className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-semibold text-lg py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isTyping ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Preparando...
            </>
          ) : (
            <>
              Comenzar
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Indicadores de Progreso */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <div className="w-8 h-1.5 bg-violet-600 rounded-full" />
          <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
          <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
        </div>
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-20deg); }
        }
        .animate-wave {
          animation: wave 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
