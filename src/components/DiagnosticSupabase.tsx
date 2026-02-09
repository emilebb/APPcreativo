"use client";

import { useState } from "react";
import { Database, TestTube, AlertCircle, CheckCircle } from "lucide-react";

export default function DiagnosticSupabase() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostic = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      // Import supabase dynamically
      const supabaseModule = await import("@/lib/supabaseClient");
      const supabase = supabaseModule.supabase;
      
      if (!supabase) {
        setResults([{
          test: "Conexión Supabase",
          status: "error",
          message: "Supabase client no está inicializado"
        }]);
        return;
      }

      const diagnosticResults = [];

      // Test 1: Verificar conexión básica
      try {
        const { data, error } = await supabase.from('_test_connection_').select('*').limit(1);
        diagnosticResults.push({
          test: "Conexión Básica",
          status: error ? "warning" : "success",
          message: error ? "Conexión funciona pero tabla no existe (normal)" : "Conexión exitosa"
        });
      } catch (err) {
        diagnosticResults.push({
          test: "Conexión Básica",
          status: "error",
          message: "Error de conexión: " + err
        });
      }

      // Test 2: Verificar tabla projects
      try {
        const { data, error } = await supabase.from('projects').select('*').limit(1);
        diagnosticResults.push({
          test: "Tabla Projects",
          status: error ? "error" : "success",
          message: error ? "Error: " + error.message : "Tabla accesible"
        });
      } catch (err) {
        diagnosticResults.push({
          test: "Tabla Projects",
          status: "error",
          message: "Error accediendo a tabla: " + err
        });
      }

      // Test 3: Verificar sesión actual
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        diagnosticResults.push({
          test: "Sesión Actual",
          status: error ? "error" : "success",
          message: error ? "Error obteniendo sesión: " + error.message : 
                   session ? `Sesión activa: ${session.user?.email}` : "No hay sesión activa"
        });
      } catch (err) {
        diagnosticResults.push({
          test: "Sesión Actual",
          status: "error",
          message: "Error verificando sesión: " + err
        });
      }

      // Test 4: Intentar inserción de prueba
      try {
        const testData = {
          title: 'TEST_DIAGNOSTIC_' + Date.now(),
          user_id: '00000000-0000-0000-0000-000000000000',
          type: 'canvas',
          status: 'active'
        };

        const { data, error } = await supabase
          .from('projects')
          .insert([testData])
          .select();

        diagnosticResults.push({
          test: "Inserción de Prueba",
          status: error ? "error" : "success",
          message: error ? "Error inserción: " + error.message : "Inserción exitosa"
        });

        // Limpiar prueba si fue exitosa
        if (!error && data && data.length > 0) {
          await supabase
            .from('projects')
            .delete()
            .eq('id', data[0].id);
        }
      } catch (err) {
        diagnosticResults.push({
          test: "Inserción de Prueba",
          status: "error",
          message: "Error en inserción: " + err
        });
      }

      // Test 5: Verificar configuración RLS
      try {
        const { data, error } = await supabase.rpc('get_policies_for_table', { 
          table_name: 'projects' 
        });
        
        diagnosticResults.push({
          test: "Políticas RLS",
          status: error ? "warning" : "success",
          message: error ? "No se pueden verificar políticas (puede ser normal)" : "RLS configurado"
        });
      } catch (err) {
        diagnosticResults.push({
          test: "Políticas RLS",
          status: "warning",
          message: "No se pueden verificar políticas: " + err
        });
      }

      setResults(diagnosticResults);

    } catch (err) {
      setResults([{
        test: "Diagnóstico General",
        status: "error",
        message: "Error ejecutando diagnóstico: " + err
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <TestTube className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'error': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 p-4 w-96 max-h-96 overflow-y-auto">
      <div className="flex items-center gap-2 mb-3">
        <Database className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
        <span className="text-sm font-medium text-neutral-900 dark:text-white">
          Diagnóstico Supabase
        </span>
      </div>
      
      <button
        onClick={runDiagnostic}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 mb-4"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
            Ejecutando diagnóstico...
          </>
        ) : (
          <>
            <TestTube className="w-3 h-3" />
            Ejecutar Diagnóstico
          </>
        )}
      </button>

      {results.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-2">
            Resultados:
          </h4>
          {results.map((result, index) => (
            <div key={index} className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}>
              <div className="flex items-center gap-2 mb-1">
                {getStatusIcon(result.status)}
                <span className="text-sm font-medium">
                  {result.test}
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                {result.message}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
        <p className="mb-1">
          <strong>Si hay errores:</strong>
        </p>
        <ol className="list-decimal list-inside space-y-1">
          <li>1. Ejecuta el script DIAGNOSTIC_SUPABASE.sql en Supabase</li>
          <li>2. Verifica que la tabla projects exista</li>
          <li>3. Revisa las políticas RLS</li>
          <li>4. Confirma tu configuración de Supabase</li>
        </ol>
      </div>
    </div>
  );
}
