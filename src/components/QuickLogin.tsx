"use client";

import { useState } from "react";
import { LogIn, User } from "lucide-react";

export default function QuickLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickLogin = async () => {
    setIsLoading(true);
    try {
      // Import supabase dynamically
      const supabaseModule = await import("@/lib/supabaseClient");
      const supabase = supabaseModule.supabase;
      
      if (supabase) {
        console.log("Attempting quick login with demo@creativex.com");
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'demo@creativex.com',
          password: 'demo123'
        });

        if (error) {
          console.error("Quick login error:", error);
          alert("Error: " + error.message);
        } else if (data.user) {
          console.log("Quick login successful:", data.user.id);
          localStorage.setItem('auth-session', JSON.stringify(data.user));
          alert("¡Login exitoso! Recarga la página.");
          window.location.reload();
        }
      } else {
        alert("Supabase no configurado");
      }
    } catch (err) {
      console.error("Quick login exception:", err);
      alert("Error: " + err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser = {
      id: 'demo-user-id',
      email: 'demo@creativex.com',
      user_metadata: {
        name: 'Demo User'
      }
    };
    
    localStorage.setItem('auth-session', JSON.stringify(demoUser));
    alert("¡Modo demo activado! Recarga la página.");
    window.location.reload();
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 p-4">
      <div className="flex items-center gap-2 mb-3">
        <User className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
        <span className="text-sm font-medium text-neutral-900 dark:text-white">
          Login Rápido
        </span>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={handleQuickLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
              Conectando...
            </>
          ) : (
            <>
              <LogIn className="w-3 h-3" />
              Supabase
            </>
          )}
        </button>
        
        <button
          onClick={handleDemoLogin}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
        >
          <User className="w-3 h-3" />
          Demo
        </button>
      </div>
      
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
        Usa para autenticarte rápidamente
      </p>
    </div>
  );
}
