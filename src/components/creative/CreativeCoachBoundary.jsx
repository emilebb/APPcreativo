'use client';
import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

export default function CreativeCoachBoundary({ children }) {
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  useEffect(() => {
    // Verificar conexión a la API
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/creative-coach', { 
          method: 'OPTIONS',
          signal: AbortSignal.timeout(5000) // Timeout de 5s
        });
        
        if (response.ok) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('error');
        }
      } catch (err) {
        setConnectionStatus('error');
      }
    };

    checkConnection();
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    setError(null);
    
    try {
      // Re-verificar conexión
      const response = await fetch('/api/creative-coach', { 
        method: 'OPTIONS',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        setConnectionStatus('connected');
        setError(null);
      } else {
        throw new Error('API no disponible');
      }
    } catch (err) {
      setError('No se puede conectar con el Creative Coach. Verifica tu conexión.');
    } finally {
      setIsRetrying(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col h-full bg-[#0d0d10] border-l border-white/10 w-80 shadow-2xl">
        {/* Header con error */}
        <div className="p-4 border-b border-white/5 bg-red-500/10 flex items-center gap-2">
          <AlertTriangle className="text-red-500 w-5 h-5" />
          <h2 className="font-bold text-red-400 tracking-tight">Error de Conexión</h2>
        </div>

        {/* Error Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <WifiOff className="w-8 h-8 text-red-500" />
            </div>
            
            <h3 className="text-white font-semibold mb-2">Creative Coach Offline</h3>
            <p className="text-white/60 text-sm mb-6">
              {error || "No se puede conectar con el asistente creativo"}
            </p>
            
            <button 
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:opacity-50 rounded-full transition-all transform hover:scale-105"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Reintentando...' : 'Reintentar'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#16161a] border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span>
              {connectionStatus === 'connected' ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="relative">
        {/* Connection Indicator */}
        <div className="absolute top-2 right-2 z-10">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
            connectionStatus === 'connected' 
              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {connectionStatus === 'connected' ? (
              <><Wifi className="w-3 h-3" /> Online</>
            ) : (
              <><WifiOff className="w-3 h-3" /> Offline</>
            )}
          </div>
        </div>
        
        {children}
      </div>
    );
  } catch (err) {
    console.error('CreativeCoach boundary error:', err);
    setError('Ocurrió un error inesperado en el Creative Coach');
    return null;
  }
}
