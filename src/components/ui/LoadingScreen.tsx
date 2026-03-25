"use client";

import React from 'react';

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

const LoadingScreen = ({ 
  message = "Sincronizando tu espacio de trabajo...",
  showLogo = true 
}: LoadingScreenProps) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505]">
      {/* Contenedor del Logo con Animación de Pulso */}
      <div className="relative">
        {/* Efecto de resplandor de fondo */}
        <div className="absolute inset-0 bg-violet-600 blur-[80px] opacity-30 animate-pulse"></div>
        
        {/* Icono Principal - Sparkles de CreativoX */}
        <div className="relative bg-[#0a0a0c]/80 p-8 rounded-3xl border border-violet-500/30 shadow-2xl backdrop-blur-xl">
          <div className="relative">
            {/* Círculo exterior animado */}
            <div className="absolute inset-0 w-16 h-16 border-2 border-violet-500/30 rounded-full animate-[spin_3s_linear_infinite]"></div>
            
            {/* Sparkles Icon */}
            <svg 
              className="relative w-16 h-16 text-violet-500 animate-pulse" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            
            {/* Partículas flotantes */}
            <div className="absolute -top-2 -left-2 w-2 h-2 bg-violet-400 rounded-full animate-[ping_2s_cubic-bezier(0,_0,_0.2,_1)_infinite]"></div>
            <div className="absolute -top-1 -right-3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-[ping_2.5s_cubic-bezier(0,_0,_0.2,_1)_infinite]"></div>
            <div className="absolute -bottom-2 -right-2 w-2 h-2 bg-purple-400 rounded-full animate-[ping_3s_cubic-bezier(0,_0,_0.2,_1)_infinite]"></div>
          </div>
        </div>
      </div>

      {/* Texto de Estado */}
      <div className="mt-12 text-center max-w-sm">
        {showLogo && (
          <h2 className="text-2xl font-bold text-white tracking-wider mb-2">
            Creativo<span className="text-violet-500">X</span> AI
          </h2>
        )}
        <p className="text-gray-400 text-sm animate-pulse font-light">
          {message}
        </p>
        
        {/* Estados de carga dinámicos */}
        <div className="mt-4 space-y-1">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-[bounce_1s_infinite]"></div>
            <span>Verificando sesión</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-[bounce_1s_infinite_0.2s]"></div>
            <span>Preparando tu espacio</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-[bounce_1s_infinite_0.4s]"></div>
            <span>Optimizando experiencia</span>
          </div>
        </div>
      </div>

      {/* Barra de progreso sutil en la parte inferior */}
      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-violet-600 to-transparent w-full opacity-60">
        <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent w-full animate-[shimmer_2s_infinite]"></div>
      </div>

      {/* Efectos de partículas de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-violet-400/20 rounded-full animate-[float_6s_ease-in-out_infinite]"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-400/20 rounded-full animate-[float_8s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-purple-400/20 rounded-full animate-[float_7s_ease-in-out_infinite]"></div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-30px) translateX(20px); }
          66% { transform: translateY(20px) translateX(-20px); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
