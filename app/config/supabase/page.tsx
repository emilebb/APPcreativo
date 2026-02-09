"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SupabaseConfigPage() {
  const router = useRouter();
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveConfig = () => {
    if (!supabaseUrl || !supabaseKey) {
      alert("Por favor ingresa ambos campos");
      return;
    }

    // Guardar en localStorage temporalmente
    localStorage.setItem('temp-supabase-url', supabaseUrl);
    localStorage.setItem('temp-supabase-key', supabaseKey);
    
    alert("Configuración guardada. Recarga la página para aplicar cambios.");
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleResetConfig = () => {
    localStorage.removeItem('temp-supabase-url');
    localStorage.removeItem('temp-supabase-key');
    alert("Configuración reseteada. Recarga la página.");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-4">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              Configurar Supabase
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Configura tu conexión a Supabase para que funcione la creación de proyectos
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="supabaseUrl" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Supabase URL
              </label>
              <input
                id="supabaseUrl"
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:text-white"
                placeholder="https://tu-proyecto.supabase.co"
              />
            </div>

            <div>
              <label htmlFor="supabaseKey" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Supabase Anon Key
              </label>
              <input
                id="supabaseKey"
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:text-white"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              />
            </div>

            <button
              onClick={handleSaveConfig}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando configuración...
                </>
              ) : (
                <>
                  💾 Guardar Configuración
                </>
              )}
            </button>

            <button
              onClick={handleResetConfig}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
            >
              🔄 Resetear Configuración
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              <strong>¿Dónde obtener estos datos?</strong>
            </p>
            <ol className="text-xs text-neutral-500 dark:text-neutral-400 text-left space-y-1">
              <li>1. Ve a <a href="https://supabase.com" target="_blank" className="text-blue-600 hover:underline">supabase.com</a></li>
              <li>2. Selecciona tu proyecto</li>
              <li>3. Ve a Settings → API</li>
              <li>4. Copia la URL y la Anon Key</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
