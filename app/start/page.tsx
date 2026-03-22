"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

type Step = 'welcome' | 'goal' | 'block' | 'processing' | 'result';
type Goal = 'video' | 'business' | 'creative' | 'content';
type Block = 'start' | 'ideas' | 'blocked' | 'improve';

export default function StartPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('welcome');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [userName, setUserName] = useState('');

  const goals = [
    { id: 'video' as Goal, emoji: '🎥', title: 'Video', desc: 'YouTube, TikTok, Reels' },
    { id: 'business' as Goal, emoji: '💡', title: 'Idea de negocio', desc: 'Emprendimiento, startup' },
    { id: 'creative' as Goal, emoji: '🎨', title: 'Proyecto creativo', desc: 'Arte, diseño, contenido' },
    { id: 'content' as Goal, emoji: '✍️', title: 'Contenido', desc: 'Posts, artículos, guiones' },
  ];

  const blocks = [
    { id: 'start' as Block, emoji: '🤔', title: 'No sé por dónde empezar', desc: 'Necesito un punto de partida claro' },
    { id: 'ideas' as Block, emoji: '💭', title: 'No tengo ideas', desc: 'Necesito inspiración y conceptos' },
    { id: 'blocked' as Block, emoji: '🚧', title: 'Me siento bloqueado', desc: 'Estoy atorado y no avanzo' },
    { id: 'improve' as Block, emoji: '⚡', title: 'Quiero mejorar algo que ya tengo', desc: 'Optimizar un proyecto existente' },
  ];

  const handleGoalSelect = (goal: Goal) => {
    setSelectedGoal(goal);
    setTimeout(() => setStep('block'), 300);
  };

  const handleBlockSelect = (block: Block) => {
    setSelectedBlock(block);
    setStep('processing');
    
    // Simular procesamiento de IA
    setTimeout(() => {
      // Guardar datos en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('onboarding_completed', 'true');
        localStorage.setItem('user_name', userName);
        localStorage.setItem('user_goal', selectedGoal || '');
        localStorage.setItem('user_block', block);
      }
      
      // Redirigir al chat con contexto
      router.push(`/chat?goal=${selectedGoal}&block=${block}&new=true`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-4xl w-full">
        {/* Welcome Step */}
        {step === 'welcome' && (
          <div className="text-center space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 border border-white/10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="text-left">
                <div className="text-lg sm:text-2xl font-bold text-white">CreativoX AI</div>
                <div className="text-xs sm:text-sm text-white/60">Coach Creativo Inteligente</div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4 px-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white">
                ¡Hola! 👋
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto px-2">
                Soy tu coach creativo con IA. Voy a ayudarte a superar bloqueos y generar ideas increíbles.
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-3 sm:space-y-4">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="¿Cómo te llamas?"
                className="w-full px-4 sm:px-6 py-3.5 sm:py-4 text-base sm:text-lg bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                onKeyPress={(e) => e.key === 'Enter' && userName && setStep('goal')}
              />
              <button
                onClick={() => userName && setStep('goal')}
                disabled={!userName}
                className="w-full px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:from-violet-700 hover:to-indigo-700 active:scale-95 transition-all font-semibold text-base sm:text-lg shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
              >
                Comenzar
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Goal Selection */}
        {step === 'goal' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-3 sm:space-y-4 px-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                👋 {userName}, ¿qué quieres crear hoy?
              </h2>
              <p className="text-base sm:text-lg text-white/60">
                Selecciona el tipo de proyecto que tienes en mente
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              {goals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handleGoalSelect(goal.id)}
                  className="group p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border-2 border-white/10 hover:border-violet-500 hover:bg-white/10 active:scale-95 transition-all text-left min-h-[120px] sm:min-h-auto"
                >
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{goal.emoji}</div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">
                    {goal.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60">
                    {goal.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Block Detection */}
        {step === 'block' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-3 sm:space-y-4 px-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                🤔 ¿Qué te está frenando?
              </h2>
              <p className="text-base sm:text-lg text-white/60">
                Esto me ayuda a darte la mejor solución
              </p>
            </div>

            <div className="grid gap-3 sm:gap-4">
              {blocks.map((block) => (
                <button
                  key={block.id}
                  onClick={() => handleBlockSelect(block.id)}
                  className="group p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border-2 border-white/10 hover:border-violet-500 hover:bg-white/10 active:scale-98 transition-all text-left flex items-start gap-3 sm:gap-4 min-h-[80px]"
                >
                  <div className="text-3xl sm:text-4xl flex-shrink-0">{block.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                      {block.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/60 line-clamp-2">
                      {block.desc}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/40 group-hover:text-violet-400 transition flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Processing */}
        {step === 'processing' && (
          <div className="text-center space-y-6 sm:space-y-8 animate-in fade-in duration-500 px-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-spin" />
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                🧠 Analizando tu situación...
              </h2>
              <div className="space-y-2 text-sm sm:text-base text-white/60">
                <p className="animate-pulse">✓ Detectando tipo de bloqueo</p>
                <p className="animate-pulse" style={{ animationDelay: '0.3s' }}>✓ Generando ideas personalizadas</p>
                <p className="animate-pulse" style={{ animationDelay: '0.6s' }}>✓ Creando plan de acción</p>
              </div>
            </div>

            <div className="max-w-md mx-auto bg-violet-600/20 border border-violet-500/30 rounded-xl p-3 sm:p-4">
              <p className="text-violet-200 text-xs sm:text-sm">
                💡 Preparando tu diagnóstico y soluciones en tiempo real...
              </p>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        {step !== 'processing' && (
          <div className="flex justify-center gap-1.5 sm:gap-2 mt-8 sm:mt-12">
            {['welcome', 'goal', 'block'].map((s, i) => (
              <div
                key={s}
                className={`h-1.5 sm:h-2 rounded-full transition-all ${
                  ['welcome', 'goal', 'block'].indexOf(step) >= i
                    ? 'w-8 sm:w-12 bg-violet-600'
                    : 'w-1.5 sm:w-2 bg-white/20'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
