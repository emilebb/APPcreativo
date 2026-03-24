// ============================================================================
// CREATIONX - Error Boundary
// Captura errores de React y muestra UI elegante en lugar de crash
// ============================================================================

"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔥 Error Boundary caught:', error);
    console.error('🔥 Error Info:', errorInfo.componentStack);
    
    this.setState({ errorInfo });
    
    // Callback personalizado
    this.props.onError?.(error, errorInfo);

    // Reportar a Sentry si está disponible
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Usar fallback personalizado si se proporciona
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de error por defecto
      return <DefaultErrorUI error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

// ============================================================================
// DEFAULT ERROR UI
// ============================================================================

function DefaultErrorUI({ 
  error, 
  onReset 
}: { 
  error: Error | null;
  onReset: () => void;
}) {
  const isProviderError = error?.message?.includes('Provider') || 
                          error?.message?.includes('provider') ||
                          error?.message?.includes('Firebase');

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 text-center">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-2xl flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-red-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white mb-2">
          {isProviderError ? 'Problema de Conexión' : 'Algo salió mal'}
        </h2>

        {/* Message */}
        <p className="text-white/60 mb-6">
          {isProviderError 
            ? 'Estamos teniendo problemas para conectar con el servidor. Por favor, verifica tu conexión a internet o intenta más tarde.'
            : 'Ocurrió un error inesperado. No te preocupes, tus datos están seguros.'
          }
        </p>

        {/* Error details (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left">
            <p className="text-xs text-red-400 font-mono break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onReset}
            className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl font-semibold hover:from-violet-500 hover:to-blue-500 transition-all"
          >
            Intentar de nuevo
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-white/5 text-white/70 rounded-xl font-medium hover:bg-white/10 transition-all"
          >
            Recargar página
          </button>
        </div>

        {/* Help text */}
        <p className="mt-6 text-xs text-white/40">
          Si el problema persiste, contacta soporte@creationx.app
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// HOOK PARA LANZAR ERRORES AL BOUNDARY
// ============================================================================

export function useErrorHandler() {
  return (error: Error) => {
    throw error;
  };
}
