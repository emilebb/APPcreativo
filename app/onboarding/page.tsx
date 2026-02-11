/**
 * ONBOARDING CREATIVO - AppCreativo
 * Primer experiencia para nuevos usuarios
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "../providers/AuthProvider";
import { PrivateGate } from "../(protected)/PrivateGate";
import { ArrowRight, Palette, Briefcase, GraduationCap, Lightbulb, Moon, Sun } from "lucide-react";

export default function OnboardingPage() {
  const auth = useAuth();
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    profession: '',
    purpose: '',
    theme: 'dark'
  });

  const professions = [
    { id: 'designer', name: 'Diseñador', icon: <Palette className="w-6 h-6" /> },
    { id: 'student', name: 'Estudiante', icon: <GraduationCap className="w-6 h-6" /> },
    { id: 'entrepreneur', name: 'Emprendedor', icon: <Briefcase className="w-6 h-6" /> },
    { id: 'artist', name: 'Artista', icon: <Lightbulb className="w-6 h-6" /> }
  ];

  const purposes = [
    'Proyectos personales',
    'Trabajo freelance',
    'Estudios y aprendizaje',
    'Negocio propio',
    'Colaboración en equipo',
    'Experimentación creativa'
  ];

  const themes = [
    { id: 'dark', name: 'Oscuro', icon: <Moon className="w-5 h-5" /> },
    { id: 'night', name: 'Nocturno', icon: <Moon className="w-5 h-5" /> },
    { id: 'light', name: 'Claro', icon: <Sun className="w-5 h-5" /> }
  ];

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      // Guardar en user_metadata
      await supabase.auth.updateUser({
        data: {
          onboarding_completed: true,
          profession: userData.profession,
          purpose: userData.purpose,
          theme: userData.theme,
          onboarding_date: new Date().toISOString()
        }
      });

      // Redirigir a explore
      router.push('/explore');
    } catch (error) {
      console.error('Error saving onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  if (auth.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Preparando tu espacio creativo...</p>
        </div>
      </div>
    );
  }

  return (
    <PrivateGate>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Paso {step} de 3
                </span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {Math.round((step / 3) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Content Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              {/* Step 1: Profession */}
              {step === 1 && (
                <div className="text-center">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      ¿Qué haces?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Cuéntanos sobre ti para personalizar tu experiencia
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {professions.map((profession) => (
                      <button
                        key={profession.id}
                        onClick={() => setUserData({ ...userData, profession: profession.id })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          userData.profession === profession.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className={`p-2 rounded-lg ${
                            userData.profession === profession.id
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {profession.icon}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {profession.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Purpose */}
              {step === 2 && (
                <div className="text-center">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      ¿Para qué usarás AppCreativo?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Esto nos ayudará a darte las mejores recomendaciones
                    </p>
                  </div>

                  <div className="space-y-2">
                    {purposes.map((purpose) => (
                      <button
                        key={purpose}
                        onClick={() => setUserData({ ...userData, purpose })}
                        className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                          userData.purpose === purpose
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {purpose}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Theme */}
              {step === 3 && (
                <div className="text-center">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Elige tu tema preferido
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Personaliza el ambiente de tu espacio creativo
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setUserData({ ...userData, theme: theme.id })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          userData.theme === theme.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className={`p-2 rounded-lg ${
                            userData.theme === theme.id
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {theme.icon}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {theme.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center gap-3 mt-8">
                {step > 1 && (
                  <button
                    onClick={prevStep}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    Anterior
                  </button>
                )}
                
                {step < 3 ? (
                  <button
                    onClick={nextStep}
                    disabled={step === 1 && !userData.profession}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Siguiente
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleComplete}
                    disabled={loading || !userData.purpose}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? 'Configurando...' : 'Comenzar a crear'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Skip Option */}
            <div className="text-center mt-4">
              <button
                onClick={handleComplete}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition"
              >
                Omitir por ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    </PrivateGate>
  );
}
