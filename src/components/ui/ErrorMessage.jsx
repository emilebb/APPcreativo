import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  variant?: 'error' | 'warning' | 'info';
}

export const ErrorMessage = ({ 
  message, 
  onRetry, 
  showRetry = true,
  variant = 'error' 
}: ErrorMessageProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      default:
        return 'bg-red-500/10 border-red-500/20 text-red-400';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'warning':
        return <AlertTriangle className="w-6 h-6" />;
      case 'info':
        return <AlertTriangle className="w-6 h-6" />;
      default:
        return <AlertTriangle className="w-6 h-6" />;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 rounded-xl border ${getVariantStyles()}`}>
      <div className="flex items-center gap-3 mb-4">
        {getIcon()}
        <h3 className="text-lg font-semibold">
          {variant === 'warning' ? 'Advertencia' : variant === 'info' ? 'Información' : 'Error'}
        </h3>
      </div>
      
      <p className="text-center mb-6 max-w-md">
        {message || "Algo salió mal. Por favor, intenta de nuevo."}
      </p>
      
      {showRetry && onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-full transition-all transform hover:scale-105 shadow-lg shadow-purple-500/25"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar conexión
        </button>
      )}
    </div>
  );
};

// Componente de error global para React Error Boundary
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#0d0d10] flex items-center justify-center p-4">
          <ErrorMessage
            message="Ha ocurrido un error inesperado. Por favor, recarga la página."
            onRetry={() => window.location.reload()}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorMessage;
