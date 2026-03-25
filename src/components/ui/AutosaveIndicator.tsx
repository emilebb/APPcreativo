"use client";

import React from 'react';
import { CheckCircle2, AlertCircle, Wifi, WifiOff } from 'lucide-react';

export type SaveStatus = 'saved' | 'saving' | 'error' | 'idle';

interface AutosaveIndicatorProps {
  status: SaveStatus;
  lastSavedAt?: Date | null;
  className?: string;
  showText?: boolean;
}

const AutosaveIndicator: React.FC<AutosaveIndicatorProps> = ({
  status,
  lastSavedAt,
  className = "",
  showText = true
}) => {
  const getStatusConfig = (status: SaveStatus) => {
    switch (status) {
      case 'saving':
        return {
          icon: Wifi,
          iconColor: 'text-violet-500',
          bgColor: 'bg-violet-500/10',
          borderColor: 'border-violet-500/30',
          textColor: 'text-violet-400',
          text: 'Coach Sincronizando...',
          animate: true
        };
      case 'saved':
        return {
          icon: CheckCircle2,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          textColor: 'text-green-400',
          text: 'Cambios seguros',
          animate: false
        };
      case 'error':
        return {
          icon: WifiOff,
          iconColor: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400',
          text: 'Error de conexión',
          animate: false
        };
      case 'idle':
      default:
        return {
          icon: CheckCircle2,
          iconColor: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/30',
          textColor: 'text-gray-400',
          text: lastSavedAt ? 'Sincronizado' : 'Listo',
          animate: false
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  // Formato de tiempo relativo
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'hace un momento';
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`;
    return `hace ${Math.floor(seconds / 3600)} h`;
  };

  return (
    <div className={`
      fixed top-6 right-6 flex items-center gap-2 
      bg-[#0a0a0c]/80 backdrop-blur-md px-4 py-2 rounded-full 
      border shadow-lg transition-all duration-300
      ${config.bgColor} ${config.borderColor}
      ${className}
    `}>
      {/* Icono con animación si está guardando */}
      <div className="relative">
        <Icon className={`w-4 h-4 ${config.iconColor} ${config.animate ? 'animate-pulse' : ''}`} />
        
        {/* Efecto de onda cuando está guardando */}
        {status === 'saving' && (
          <div className="absolute inset-0">
            <Icon className="w-4 h-4 text-violet-500 animate-ping" />
          </div>
        )}
      </div>

      {/* Texto de estado */}
      {showText && (
        <span className={`
          text-xs font-medium uppercase tracking-tighter
          ${config.textColor}
        `}>
          {config.text}
        </span>
      )}

      {/* Timestamp opcional */}
      {lastSavedAt && status === 'idle' && (
        <span className="text-xs text-gray-500 ml-1">
          {getTimeAgo(lastSavedAt)}
        </span>
      )}

      {/* Indicador de progreso sutil cuando está guardando */}
      {status === 'saving' && (
        <div className="flex gap-1 ml-2">
          <div className="w-1 h-1 bg-violet-500 rounded-full animate-[bounce_1.4s_infinite]"></div>
          <div className="w-1 h-1 bg-violet-500 rounded-full animate-[bounce_1.4s_infinite_0.2s]"></div>
          <div className="w-1 h-1 bg-violet-500 rounded-full animate-[bounce_1.4s_infinite_0.4s]"></div>
        </div>
      )}
    </div>
  );
};

export default AutosaveIndicator;
