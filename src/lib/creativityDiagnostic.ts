// Sistema de diagnóstico automático de creatividad

export type BlockType = 
  | 'blank_canvas' // No sabe por dónde empezar
  | 'too_many_ideas' // Demasiadas opciones, parálisis
  | 'perfectionism' // Miedo a que no sea perfecto
  | 'lack_inspiration' // Sin referencias o ideas
  | 'technical_block' // No sabe cómo ejecutar
  | 'decision_fatigue' // Cansado de decidir
  | 'scope_creep' // Proyecto muy grande
  | 'none'; // Sin bloqueo detectado

export interface DiagnosticResult {
  blockType: BlockType;
  confidence: number; // 0-100
  symptoms: string[];
  recommendations: Recommendation[];
  nextStep: string;
  estimatedTime: string;
}

export interface Recommendation {
  action: string;
  tool: 'canvas' | 'moodboard' | 'mindmap' | 'chat';
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface UserBehavior {
  timeOnPage: number; // segundos
  clicksWithoutAction: number;
  toolSwitches: number;
  ideasGenerated: number;
  projectsStarted: number;
  projectsCompleted: number;
  lastActivity: string;
  currentTool?: string;
  emptyCanvasTime?: number; // tiempo mirando canvas vacío
  scrollsWithoutClick?: number;
}

// Analizar comportamiento y detectar bloqueo
export function diagnoseCreativeBlock(behavior: UserBehavior): DiagnosticResult {
  const {
    timeOnPage,
    clicksWithoutAction,
    toolSwitches,
    ideasGenerated,
    projectsStarted,
    projectsCompleted,
    emptyCanvasTime,
    scrollsWithoutClick,
  } = behavior;

  // Blank Canvas - Mirando pantalla vacía sin acción
  if (emptyCanvasTime && emptyCanvasTime > 120 && clicksWithoutAction < 3) {
    return {
      blockType: 'blank_canvas',
      confidence: 85,
      symptoms: [
        'Más de 2 minutos mirando canvas vacío',
        'Muy pocas acciones realizadas',
        'Sin ideas generadas'
      ],
      recommendations: [
        {
          action: 'Genera 3 ideas rápidas con IA',
          tool: 'chat',
          description: 'Dile al coach qué quieres crear y obtén ideas para empezar',
          priority: 'high'
        },
        {
          action: 'Crea un Moodboard de inspiración',
          tool: 'moodboard',
          description: 'Junta referencias visuales para clarificar tu visión',
          priority: 'high'
        },
        {
          action: 'Empieza con un boceto simple',
          tool: 'canvas',
          description: 'No busques perfección, solo dibuja lo primero que pienses',
          priority: 'medium'
        }
      ],
      nextStep: 'Habla con el Coach IA y dile: "No sé por dónde empezar"',
      estimatedTime: '5 minutos'
    };
  }

  // Too Many Ideas - Muchas ideas pero sin completar
  if (ideasGenerated > 10 && projectsStarted > 3 && projectsCompleted === 0) {
    return {
      blockType: 'too_many_ideas',
      confidence: 90,
      symptoms: [
        `${ideasGenerated} ideas generadas`,
        `${projectsStarted} proyectos iniciados`,
        'Ningún proyecto completado'
      ],
      recommendations: [
        {
          action: 'Elige UNA idea y comprométete',
          tool: 'mindmap',
          description: 'Usa un mindmap para evaluar y elegir la mejor opción',
          priority: 'high'
        },
        {
          action: 'Define alcance mínimo',
          tool: 'chat',
          description: 'Pregunta al coach: "¿Cuál es la versión más simple de esto?"',
          priority: 'high'
        },
        {
          action: 'Establece deadline de 1 hora',
          tool: 'canvas',
          description: 'Limita el tiempo para forzar decisiones',
          priority: 'medium'
        }
      ],
      nextStep: 'Pregunta al Coach: "¿Cuál de estas ideas debería hacer primero?"',
      estimatedTime: '10 minutos'
    };
  }

  // Perfectionism - Mucho tiempo en detalles, cambios constantes
  if (timeOnPage > 1800 && toolSwitches > 15 && projectsCompleted === 0) {
    return {
      blockType: 'perfectionism',
      confidence: 80,
      symptoms: [
        'Más de 30 minutos en el mismo proyecto',
        'Cambios constantes de herramienta',
        'Sin finalizar nada'
      ],
      recommendations: [
        {
          action: 'Establece "Done is better than perfect"',
          tool: 'chat',
          description: 'El coach te ayudará a definir cuándo algo está "suficientemente bien"',
          priority: 'high'
        },
        {
          action: 'Usa timer de 15 minutos',
          tool: 'canvas',
          description: 'Trabaja en sprints cortos y decide al final',
          priority: 'high'
        },
        {
          action: 'Comparte versión beta',
          tool: 'canvas',
          description: 'Muéstrale a alguien aunque no esté perfecto',
          priority: 'medium'
        }
      ],
      nextStep: 'Pregunta: "¿Qué es lo mínimo que necesito para llamar esto terminado?"',
      estimatedTime: '15 minutos'
    };
  }

  // Lack of Inspiration - Scrolling sin clicks, sin ideas generadas
  if (scrollsWithoutClick && scrollsWithoutClick > 20 && ideasGenerated === 0) {
    return {
      blockType: 'lack_inspiration',
      confidence: 75,
      symptoms: [
        'Mucho scrolling sin acción',
        'Sin generar ideas',
        'Buscando inspiración pasivamente'
      ],
      recommendations: [
        {
          action: 'Crea Moodboard de referencias',
          tool: 'moodboard',
          description: 'Busca 5-10 imágenes que te inspiren y júntalas',
          priority: 'high'
        },
        {
          action: 'Genera paleta de colores con IA',
          tool: 'canvas',
          description: 'Deja que la IA te sugiera combinaciones',
          priority: 'high'
        },
        {
          action: 'Explora proyectos similares',
          tool: 'chat',
          description: 'Pregunta: "Muéstrame ejemplos de [tu proyecto]"',
          priority: 'medium'
        }
      ],
      nextStep: 'Abre el Moodboard y agrega 3 imágenes que te gusten',
      estimatedTime: '10 minutos'
    };
  }

  // Decision Fatigue - Muchos cambios de herramienta sin progreso
  if (toolSwitches > 10 && timeOnPage > 600 && clicksWithoutAction > 20) {
    return {
      blockType: 'decision_fatigue',
      confidence: 70,
      symptoms: [
        'Cambiando constantemente de herramienta',
        'Muchos clicks sin resultado',
        'Más de 10 minutos sin progreso real'
      ],
      recommendations: [
        {
          action: 'Toma un break de 5 minutos',
          tool: 'chat',
          description: 'Sal, respira, vuelve con mente fresca',
          priority: 'high'
        },
        {
          action: 'Usa Modo Enfoque',
          tool: 'canvas',
          description: 'Bloquea distracciones y trabaja en UNA cosa',
          priority: 'high'
        },
        {
          action: 'Simplifica la decisión',
          tool: 'chat',
          description: 'Pregunta: "Dame solo 2 opciones para elegir"',
          priority: 'medium'
        }
      ],
      nextStep: 'Activa el Modo Enfoque y trabaja 15 minutos sin interrupciones',
      estimatedTime: '20 minutos (incluye break)'
    };
  }

  // Sin bloqueo detectado
  return {
    blockType: 'none',
    confidence: 60,
    symptoms: ['Comportamiento normal de trabajo creativo'],
    recommendations: [
      {
        action: 'Continúa con tu flujo actual',
        tool: 'canvas',
        description: 'Estás trabajando bien, sigue así',
        priority: 'low'
      }
    ],
    nextStep: 'Sigue creando, estás en buen camino',
    estimatedTime: 'N/A'
  };
}

// Obtener mensaje motivacional según el bloqueo
export function getMotivationalMessage(blockType: BlockType): string {
  const messages: Record<BlockType, string> = {
    blank_canvas: '💪 Todos los grandes proyectos empiezan con un primer trazo. No tiene que ser perfecto.',
    too_many_ideas: '🎯 La clave no es tener más ideas, sino ejecutar una brillantemente.',
    perfectionism: '✨ Hecho es mejor que perfecto. Puedes iterar después.',
    lack_inspiration: '🌟 La inspiración viene trabajando, no esperando. Empieza y aparecerá.',
    technical_block: '🛠️ No necesitas saber todo antes de empezar. Aprende haciendo.',
    decision_fatigue: '🧘 Descansa. Las mejores decisiones vienen de una mente fresca.',
    scope_creep: '📏 Piensa en versión 1.0, no en la versión perfecta final.',
    none: '🚀 Estás en flow. Aprovecha este momento de claridad.',
  };

  return messages[blockType];
}

// Sugerir siguiente acción específica
export function getSuggestedAction(blockType: BlockType): {
  title: string;
  description: string;
  cta: string;
  tool: string;
} {
  const actions: Record<BlockType, any> = {
    blank_canvas: {
      title: 'Genera tu primera idea',
      description: 'Dile al Coach qué quieres crear y obtén 3 ideas para empezar',
      cta: 'Hablar con Coach IA',
      tool: '/chat/bloqueo'
    },
    too_many_ideas: {
      title: 'Elige UNA idea ahora',
      description: 'Usa el Mindmap para evaluar opciones y tomar una decisión',
      cta: 'Abrir Mindmap',
      tool: '/mindmap/new'
    },
    perfectionism: {
      title: 'Define "terminado"',
      description: 'Establece criterios claros de cuándo algo está listo',
      cta: 'Consultar Coach',
      tool: '/chat/bloqueo'
    },
    lack_inspiration: {
      title: 'Crea Moodboard',
      description: 'Junta referencias visuales para clarificar tu visión',
      cta: 'Crear Moodboard',
      tool: '/moodboard/new'
    },
    technical_block: {
      title: 'Aprende haciendo',
      description: 'Empieza simple y aprende en el proceso',
      cta: 'Abrir Canvas',
      tool: '/canvas'
    },
    decision_fatigue: {
      title: 'Activa Modo Enfoque',
      description: 'Elimina distracciones y trabaja en UNA cosa',
      cta: 'Modo Enfoque',
      tool: '/canvas?focus=true'
    },
    scope_creep: {
      title: 'Simplifica el alcance',
      description: 'Define la versión más simple que puedes hacer',
      cta: 'Consultar Coach',
      tool: '/chat/bloqueo'
    },
    none: {
      title: 'Sigue creando',
      description: 'Estás en buen camino, mantén el momentum',
      cta: 'Continuar',
      tool: '/explore'
    }
  };

  return actions[blockType];
}
