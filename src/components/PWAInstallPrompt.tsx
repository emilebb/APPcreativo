"use client";

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Verificar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // No mostrar si ya fue descartado
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      setShowPrompt(false);
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="md:hidden fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-3">
        <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          <Download className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">Instalar CreativoX AI</h3>
          <p className="text-xs text-white/90">Úsala como app en tu celular</p>
        </div>
        <button
          onClick={handleInstall}
          className="flex-shrink-0 px-4 py-2 bg-white text-violet-600 rounded-lg font-semibold text-sm hover:bg-white/90 transition"
        >
          Instalar
        </button>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-2 hover:bg-white/10 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
