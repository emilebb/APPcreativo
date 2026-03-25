"use client";

import React, { useState } from 'react';

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

// El "Script de Bienvenida" del Coach Creativo
const coachMessages = [
  "Buscando el hilo de tus ideas...",
  "Desbloqueando nuevos lienzos creativos...",
  "Sincronizando con tu flujo de trabajo...",
  "Preparando el motor de inspiración...",
  "Organizando tus proyectos en el Canvas...",
  "Tu Copiloto Creativo se está activando...",
  "Afilando las herramientas de diseño...",
  "Cargando tu universo visual...",
  "Conectando neuronas creativas...",
  "Calibrando tu espacio de innovación...",
  "Desempolvando lienzos digitales...",
  "Preparando el taller creativo...",
  "Sintonizando con tu frecuencia creativa...",
  "Activando el modo inspiración...",
  "Organizando tu ecosistema de ideas..."
];

const LoadingScreen = ({ 
  message,
  showLogo = true 
}: LoadingScreenProps) => {
  // Elegimos el mensaje aleatorio si no se proporciona uno específico
  const [randomMessage] = useState(() => 
    message || coachMessages[Math.floor(Math.random() * coachMessages.length)]
  );

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

      {/* Texto de Estado con Personalidad del Coach */}
      <div className="mt-12 text-center max-w-sm px-6">
        {showLogo && (
          <h2 className="text-sm font-bold text-violet-400 tracking-[0.3em] uppercase mb-4">
            CreativoX AI
          </h2>
        )}
        
        {/* Mensaje del Coach con animación de fade-in */}
        <div className="relative">
          <p className="text-white text-lg font-light italic animate-[fade-in_0.8s_ease-out]">
            "{randomMessage}"
          </p>
          
          {/* Indicador de que el Coach está "trabajando" */}
          <div className="mt-3 flex justify-center gap-1">
            <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-[bounce_1.4s_infinite]"></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-[bounce_1.4s_infinite_0.2s]"></div>
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-[bounce_1.4s_infinite_0.4s]"></div>
          </div>
        </div>
        
        {/* Estados de carga dinámicos */}
        <div className="mt-6 space-y-1 opacity-60">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <div className="w-1 h-1 bg-violet-500 rounded-full"></div>
            <span>Verificando sesión</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
            <span>Preparando tu espacio</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
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
        
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
