"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authProvider";
import { Sparkles, Palette, Layout, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";

type OnboardingStep = 'welcome' | 'goal' | 'style' | 'ready';
type CreativeGoal = 'design' | 'art' | 'content' | 'business' | 'explore';

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [selectedGoal, setSelectedGoal] = useState<CreativeGoal | null>(null);
  const [userName, setUserName] = useState('');

  const goals = [
    { id: 'design' as CreativeGoal, icon: Layout, title: 'Diseño & UX', desc: 'Interfaces, branding, productos digitales' },
    { id: 'art' as CreativeGoal, icon: Palette, title: 'Arte & Ilustración', desc: 'Dibujo, pintura, arte digital' },
    { id: 'content' as CreativeGoal, icon: MessageSquare, title: 'Contenido Creativo', desc: 'Videos, posts, storytelling' },
    { id: 'business' as CreativeGoal, icon: Sparkles, title: 'Emprendimiento', desc: 'Proyectos, productos, negocios' },
    { id: 'explore' as CreativeGoal, icon: CheckCircle2, title: 'Solo Explorar', desc: 'Ver qué puedo crear' },
  ];

  const handleStart = () => {
    if (!userName.trim()) {
      alert('Por favor ingresa tu nombre');
      return;
    }
    setStep('goal');
  };

  const handleGoalSelect = (goal: CreativeGoal) => {
    setSelectedGoal(goal);
    setStep('style');
  };

  const handleComplete = () => {
    // Guardar preferencias en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_completed', 'true');
      localStorage.setItem('user_name', userName);
      localStorage.setItem('creative_goal', selectedGoal || '');
    }
    
    // Redirigir según el objetivo
    switch (selectedGoal) {
      case 'design':
        router.push('/canvas');
        break;
      case 'art':
        router.push('/canvas');
        break;
      case 'content':
        router.push('/moodboard/new');
        break;
      case 'business':
        router.push('/mindmap/new');
        break;
      default:
        router.push('/explore');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Welcome Step */}
        {step === 'welcome' && (
          <div className="text-center space-y-8 animate-in fade-in duration-500">
            <div className="inline-flex items-center gap-3 bg-white dark:bg-neutral-800 rounded-2xl px-6 py-4 shadow-xl border border-neutral-200 dark:border-neutral-700">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-neutral-900 dark:text-white">CreationX</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Tu Coach Creativo</div>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 dark:text-white">
                ¡Bienvenido! 👋
              </h1>
              <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                Estás a 30 segundos de superar tus bloqueos creativos y ejecutar tus ideas
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="¿Cómo te llamas?"
                className="w-full px-6 py-4 text-lg border-2 border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:border-violet-600 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                onKeyPress={(e) => e.key === 'Enter' && handleStart()}
              />
              <button
                onClick={handleStart}
                className="w-full px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all font-semibold text-lg shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2"
              >
                Comenzar
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Goal Selection Step */}
        {step === 'goal' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
                Hola {userName}, ¿qué quieres crear hoy?
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Esto me ayuda a personalizar tu experiencia
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handleGoalSelect(goal.id)}
                  className="group p-6 bg-white dark:bg-neutral-800 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-violet-600 dark:hover:border-violet-500 transition-all text-left hover:shadow-xl hover:scale-105"
                >
                  <goal.icon className="w-10 h-10 text-violet-600 dark:text-violet-400 mb-4" />
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                    {goal.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {goal.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Style Preference Step */}
        {step === 'style' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
                ¿Cómo prefieres trabajar?
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Configuraré el coach según tu estilo
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <button
                onClick={() => setStep('ready')}
                className="p-8 bg-white dark:bg-neutral-800 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-violet-600 dark:hover:border-violet-500 transition-all text-left hover:shadow-xl"
              >
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  Modo Directo
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Dame el siguiente paso exacto. Sin rodeos.
                </p>
              </button>

              <button
                onClick={() => setStep('ready')}
                className="p-8 bg-white dark:bg-neutral-800 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-violet-600 dark:hover:border-violet-500 transition-all text-left hover:shadow-xl"
              >
                <div className="text-4xl mb-4">🧘</div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  Modo Reflexivo
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Ayúdame a explorar opciones y pensar profundo.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Ready Step */}
        {step === 'ready' && (
          <div className="text-center space-y-8 animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
                ¡Todo listo, {userName}! 🎉
              </h2>
              <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                Tu coach creativo está configurado. Vamos a crear algo increíble.
              </p>
            </div>

            <div className="max-w-md mx-auto bg-violet-50 dark:bg-violet-900/20 border-2 border-violet-200 dark:border-violet-800 rounded-2xl p-6">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">
                💡 Primer paso recomendado:
              </h3>
              <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                {selectedGoal === 'design' && 'Abre el Canvas y empieza a visualizar tu idea'}
                {selectedGoal === 'art' && 'Usa el Canvas para bocetear tu concepto'}
                {selectedGoal === 'content' && 'Crea un Moodboard con referencias visuales'}
                {selectedGoal === 'business' && 'Estructura tu idea en un Mindmap'}
                {selectedGoal === 'explore' && 'Explora las herramientas y encuentra tu favorita'}
              </p>
            </div>

            <button
              onClick={handleComplete}
              className="px-12 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all font-semibold text-lg shadow-lg shadow-violet-500/30 inline-flex items-center gap-2"
            >
              Empezar a Crear
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mt-12">
          {['welcome', 'goal', 'style', 'ready'].map((s, i) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                ['welcome', 'goal', 'style', 'ready'].indexOf(step) >= i
                  ? 'w-12 bg-violet-600'
                  : 'w-2 bg-neutral-300 dark:bg-neutral-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
