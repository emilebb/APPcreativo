"use client";

import { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Target, Zap } from 'lucide-react';

interface FocusModeProps {
  isActive: boolean;
  onClose: () => void;
  taskName?: string;
  duration?: number; // en minutos
}

export default function FocusMode({ isActive, onClose, taskName = 'Crear', duration = 25 }: FocusModeProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // en segundos
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setCompletedSessions(c => c + 1);
            // Notificación de finalización
            if (typeof window !== 'undefined' && 'Notification' in window) {
              if (Notification.permission === 'granted') {
                new Notification('🎉 ¡Sesión completada!', {
                  body: `Completaste ${duration} minutos de enfoque en "${taskName}"`,
                  icon: '/icon.svg'
                });
              }
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isActive, duration, taskName]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  const handleReset = () => {
    setTimeLeft(duration * 60);
    setIsRunning(false);
  };

  const handleToggle = () => {
    setIsRunning(!isRunning);
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      {/* Fondo animado */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Contenido */}
      <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-600/20 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-violet-400" />
            </div>
            <div className="text-left">
              <div className="text-sm text-neutral-400">Modo Enfoque</div>
              <div className="text-white font-semibold">{taskName}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timer Circle */}
        <div className="relative w-80 h-80 mx-auto">
          {/* Progress Ring */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 140}`}
              strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Timer Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-7xl font-bold text-white mb-2 font-mono">
              {formatTime(timeLeft)}
            </div>
            <div className="text-neutral-400 text-sm">
              {timeLeft === 0 ? '¡Completado!' : isRunning ? 'En progreso...' : 'Pausado'}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition text-white"
            title="Reiniciar"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
          
          <button
            onClick={handleToggle}
            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl transition text-white font-semibold flex items-center gap-3 shadow-lg shadow-violet-500/30"
          >
            {isRunning ? (
              <>
                <Pause className="w-6 h-6" />
                Pausar
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                {timeLeft === duration * 60 ? 'Comenzar' : 'Continuar'}
              </>
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 pt-8 border-t border-white/10">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">{completedSessions}</div>
            <div className="text-sm text-neutral-400">Sesiones hoy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">{duration}</div>
            <div className="text-sm text-neutral-400">Minutos por sesión</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {Math.round(progress)}%
            </div>
            <div className="text-sm text-neutral-400">Progreso</div>
          </div>
        </div>

        {/* Motivational Message */}
        {isRunning && (
          <div className="bg-violet-600/20 border border-violet-500/30 rounded-xl p-4 animate-in fade-in duration-500">
            <p className="text-violet-200 text-sm">
              💪 Mantén el enfoque. Estás creando algo increíble.
            </p>
          </div>
        )}

        {timeLeft === 0 && (
          <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-4 animate-in fade-in duration-500">
            <p className="text-green-200 font-semibold mb-2">
              🎉 ¡Excelente trabajo!
            </p>
            <p className="text-green-200/80 text-sm">
              Completaste {duration} minutos de enfoque profundo. Toma un break de 5 minutos.
            </p>
          </div>
        )}

        {/* Tips */}
        {!isRunning && timeLeft > 0 && (
          <div className="text-neutral-400 text-sm space-y-2">
            <p>💡 <strong>Tip:</strong> Cierra notificaciones y pon el teléfono en silencio</p>
            <p>🎯 Enfócate en UNA tarea a la vez para máxima productividad</p>
          </div>
        )}
      </div>
    </div>
  );
}
