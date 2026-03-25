"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authProvider";
import { supabase } from "@/lib/supabase";
import { Sparkles, Palette, Layout, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";

type OnboardingStep = 'welcome' | 'goal' | 'style' | 'ready';
type CreativeGoal = 'design' | 'art' | 'content' | 'business' | 'explore';

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [selectedGoal, setSelectedGoal] = useState<CreativeGoal | null>(null);
  const [userName, setUserName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [coachTone, setCoachTone] = useState<'Direct' | 'Calm'>('Direct');

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

  const handleComplete = async () => {
    if (!user) {
      alert('Debes iniciar sesión para guardar tu progreso');
      router.push('/login');
      return;
    }

    setIsSaving(true);
    try {
      // Guardar en Supabase
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        user_name: userName,
        creative_role: selectedGoal,
        main_goal: goals.find(g => g.id === selectedGoal)?.title || '',
        preferred_style: 'Modern & Clean', // Default
        coach_tone: coachTone,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      // Guardar en local para redundancia/fallback
      if (typeof window !== 'undefined') {
        localStorage.setItem('onboarding_completed', 'true');
        localStorage.setItem('user_name', userName);
        localStorage.setItem('creative_goal', selectedGoal || '');
        localStorage.setItem('coach_tone', coachTone);
      }
      
      // Redirección
      switch (selectedGoal) {
        case 'design':
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
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Hubo un error al guardar tu perfil. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl w-full relative z-10">
        {/* Welcome Step */}
        {step === 'welcome' && (
          <div className="text-center space-y-10 animate-in fade-in duration-500">
            {/* Logo */}
            <div className="inline-flex items-center gap-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-white tracking-tight">CreationX</div>
                <div className="text-sm text-white/50">Tu Coach Creativo</div>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-5">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight">
                ¡Bienvenido! <span className="text-4xl sm:text-5xl lg:text-6xl">👋</span>
              </h1>
              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                Estás a 30 segundos de superar tus bloqueos creativos y ejecutar tus ideas
              </p>
            </div>

            {/* Form */}
            <div className="max-w-md mx-auto space-y-5">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="¿Cómo te llamas?"
                className="w-full px-6 py-4 text-lg backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all"
                onKeyPress={(e) => e.key === 'Enter' && handleStart()}
              />
              <button
                onClick={handleStart}
                className="w-full px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
              >
                Comenzar
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Goal Selection Step */}
        {step === 'goal' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="text-center space-y-4">
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                Hola {userName}, ¿qué quieres crear?
              </h2>
              <p className="text-lg text-white/50">
                Esto me ayuda a personalizar tu experiencia
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handleGoalSelect(goal.id)}
                  className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/10 hover:border-violet-500/30 transition-all hover:scale-[1.02]"
                >
                  <goal.icon className="w-10 h-10 text-violet-400 mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">
                    {goal.title}
                  </h3>
                  <p className="text-sm text-white/50">
                    {goal.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Style Preference Step */}
        {step === 'style' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="text-center space-y-4">
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                ¿Cómo prefieres trabajar?
              </h2>
              <p className="text-lg text-white/50">
                Configuraré el coach según tu estilo
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <button
                onClick={() => {
                  setCoachTone('Direct');
                  setStep('ready');
                }}
                className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-left hover:bg-white/10 hover:border-violet-500/30 transition-all"
              >
                <div className="text-5xl mb-5">⚡</div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Modo Directo
                </h3>
                <p className="text-white/50">
                  Dame el siguiente paso exacto. Sin rodeos.
                </p>
              </button>

              <button
                onClick={() => {
                  setCoachTone('Calm');
                  setStep('ready');
                }}
                className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-left hover:bg-white/10 hover:border-violet-500/30 transition-all"
              >
                <div className="text-5xl mb-5">🧘</div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Modo Reflexivo
                </h3>
                <p className="text-white/50">
                  Ayúdame a explorar opciones y pensar profundo.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Ready Step */}
        {step === 'ready' && (
          <div className="text-center space-y-10 animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-14 h-14 text-white" />
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                ¡Todo listo, {userName}! 🎉
              </h2>
              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                Tu coach creativo está configurado. Vamos a crear algo increíble.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 max-w-md mx-auto">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <span>💡</span> Primer paso recomendado:
              </h3>
              <p className="text-white/70">
                {selectedGoal === 'design' && 'Abre el Canvas y empieza a visualizar tu idea'}
                {selectedGoal === 'art' && 'Usa el Canvas para bocetear tu concepto'}
                {selectedGoal === 'content' && 'Crea un Moodboard con referencias visuales'}
                {selectedGoal === 'business' && 'Estructura tu idea en un Mindmap'}
                {selectedGoal === 'explore' && 'Explora las herramientas y encuentra tu favorita'}
              </p>
            </div>

            <button
              onClick={handleComplete}
              className="px-12 py-5 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] transition-all inline-flex items-center gap-3"
            >
              Empezar a Crear
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mt-14">
          {['welcome', 'goal', 'style', 'ready'].map((s, i) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                ['welcome', 'goal', 'style', 'ready'].indexOf(step) >= i
                  ? 'w-14 bg-gradient-to-r from-violet-500 to-blue-500'
                  : 'w-2 bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
