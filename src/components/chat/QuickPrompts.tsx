'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquarePlus, 
  Palette, 
  Lightbulb, 
  Target, 
  Rocket,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface QuickPrompt {
  id: string;
  icon: React.ReactNode;
  category: string;
  prompts: {
    text: string;
    value: string;
  }[];
}

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  isDisabled?: boolean;
}

const quickPrompts: QuickPrompt[] = [
  {
    id: 'block',
    icon: <Target className="w-4 h-4" />,
    category: 'Bloqueos Creativos',
    prompts: [
      { text: 'Tengo un bloqueo con el color', value: 'Tengo un bloqueo con el color en mi proyecto. No sé qué paleta usar que transmita las emociones correctas. ¿Puedes ayudarme?' },
      { text: 'No sé por dónde empezar', value: 'Tengo una idea pero no sé por dónde empezar. Me siento abrumado y necesito un punto de partida claro.' },
      { text: 'Estoy estancado en el diseño', value: 'Llevo horas en el mismo diseño y siento que no avanza. Necesito una perspectiva fresca.' },
      { text: 'Mi proyecto se siente plano', value: 'Mi proyecto actual se siente plano y sin vida. ¿Qué puedo hacer para darle más personalidad?' },
    ],
  },
  {
    id: 'ideas',
    icon: <Lightbulb className="w-4 h-4" />,
    category: 'Generar Ideas',
    prompts: [
      { text: 'Dame 5 ideas para un logo', value: 'Necesito 5 ideas creativas para un logo. Mi proyecto es sobre [Describe tu proyecto aquí]. Dame conceptos únicos y memorables.' },
      { text: 'Brainstorming de nombre', value: 'Ayúdame a generar nombres creativos para mi proyecto/marca. El concepto principal es [Describe aquí]. Quiero algo corto, memorable y original.' },
      { text: 'Ideas de contenido viral', value: 'Necesito ideas de contenido que puedan hacer viral mi marca. El tema es [Describe aquí]. Piensa en formatos innovadores.' },
      { text: 'Conceptos visuales únicos', value: 'Busco conceptos visuales únicos que nadie más haya usado. Mi proyecto es sobre [Describe aquí].' },
    ],
  },
  {
    id: 'feedback',
    icon: <Palette className="w-4 h-4" />,
    category: 'Feedback',
    prompts: [
      { text: 'Analiza mi paleta de colores', value: 'Quiero que analices mi paleta de colores actual. Dame feedback honesto sobre qué funciona, qué no, y cómo mejorarla.' },
      { text: 'Critica mi composición', value: 'Revisa la composición de mi diseño. ¿Qué elementos funcionan? ¿Qué debería cambiar? ¿Cómo puedo mejorarlo?' },
      { text: 'Evalúa mi tipografía', value: 'Analiza las fuentes que estoy usando. ¿Son legibles? ¿Comunican el mensaje correcto? ¿Qué cambiarías?' },
      { text: 'Feedback brutal honesto', value: 'Dame tu feedback más honesto y directo sobre mi trabajo. No necesito halagos, necesito saber qué está mal para mejorarlo.' },
    ],
  },
  {
    id: 'structure',
    icon: <Rocket className="w-4 h-4" />,
    category: 'Estructurar',
    prompts: [
      { text: 'Estructura mi plan de marketing', value: 'Necesito estructurar un plan de marketing para mi proyecto. Ayúdame a crear pasos claros y accionables.' },
      { text: 'Organiza mi proyecto creativo', value: 'Tengo muchas ideas pero no tengo estructura. Ayúdame a organizar mi proyecto creativo en fases manejables.' },
      { text: 'Crea un roadmap visual', value: 'Necesito un roadmap visual para mi proyecto. ¿Cómo puedo dividirlo en hitos claros?' },
      { text: 'Prioriza mis tareas', value: 'Tengo muchas tareas y no sé cuáles son prioritarias. Ayúdame a enfocar en lo que realmente importa.' },
    ],
  },
];

export default function QuickPrompts({ onSelectPrompt, isDisabled }: QuickPromptsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleSelectPrompt = (prompt: string) => {
    onSelectPrompt(prompt);
    setIsOpen(false);
    setActiveCategory(null);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDisabled}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-xl
          bg-white/5 hover:bg-white/10 
          border border-white/10 hover:border-white/20
          text-white/80 hover:text-white
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <Sparkles className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-medium">Prompts Rápidos</span>
        <ChevronRight 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
        />
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 mb-2 w-80 max-h-96 overflow-hidden
                       bg-[#0a0a0a]/95 backdrop-blur-xl 
                       border border-white/10 rounded-2xl
                       shadow-2xl shadow-black/50"
          >
            {/* Category Tabs */}
            <div className="flex overflow-x-auto p-2 gap-1 border-b border-white/10">
              {quickPrompts.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(
                    activeCategory === category.id ? null : category.id
                  )}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg
                    text-xs font-medium whitespace-nowrap
                    transition-all duration-200
                    ${activeCategory === category.id 
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' 
                      : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                    }
                  `}
                >
                  {category.icon}
                  {category.category}
                </button>
              ))}
            </div>

            {/* Prompt List */}
            <div className="p-2 max-h-64 overflow-y-auto">
              {activeCategory ? (
                quickPrompts
                  .find(c => c.id === activeCategory)
                  ?.prompts.map((prompt, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleSelectPrompt(prompt.value)}
                      className="w-full text-left px-4 py-3 rounded-xl
                                 text-sm text-white/80 hover:text-white
                                 hover:bg-white/5 transition-all duration-200
                                 flex items-center gap-2"
                    >
                      <MessageSquarePlus className="w-4 h-4 text-violet-400/60 flex-shrink-0" />
                      {prompt.text}
                    </motion.button>
                  ))
              ) : (
                <div className="py-6 text-center text-white/40 text-sm">
                  Selecciona una categoría
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 bg-white/[0.02]">
              <p className="text-xs text-white/40 text-center">
                💡 Los prompts se enviarán automáticamente al chat
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
