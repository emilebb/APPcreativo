/**
 * Sistema de Coach Creativo Adaptativo
 * Detecta intención, estado emocional y responde de forma natural
 */

export type UserIntent = 
  | 'seeking_help'      // Necesita ayuda
  | 'sharing_progress'  // Compartiendo avance
  | 'exploring_ideas'   // Explorando opciones
  | 'stuck'             // Bloqueado
  | 'validating'        // Buscando validación
  | 'planning'          // Planificando
  | 'reflecting';       // Reflexionando

export type EmotionalState = 
  | 'frustrated'   // Frustrado
  | 'confused'     // Confundido
  | 'excited'      // Emocionado
  | 'uncertain'    // Inseguro
  | 'motivated'    // Motivado
  | 'overwhelmed'  // Abrumado
  | 'neutral';     // Neutral

export type BlockageType = 
  | 'inicio'       // No sabe empezar
  | 'direccion'    // Muchas opciones
  | 'perfeccionismo' // Miedo a imperfección
  | 'motivacion'   // Falta energía
  | 'none';        // Sin bloqueo

export interface UserAnalysis {
  intent: UserIntent;
  emotionalState: EmotionalState;
  blockage: BlockageType;
  confidence: number;
  keywords: string[];
}

export interface CoachResponse {
  insight: string;      // 1 observación clave
  action: string;       // 1 acción concreta
  question: string;     // 1 pregunta estratégica
  tone: 'direct' | 'reflective';
}

/**
 * Analiza el mensaje del usuario para detectar intención y estado
 */
export function analyzeUserMessage(message: string, conversationHistory: string[] = []): UserAnalysis {
  const lower = message.toLowerCase();
  
  // Detectar intención
  const intent = detectIntent(lower);
  
  // Detectar estado emocional
  const emotionalState = detectEmotionalState(lower);
  
  // Detectar bloqueo
  const blockage = detectBlockageType(lower);
  
  // Calcular confianza basada en keywords
  const allKeywords = [...getIntentKeywords(intent), ...getEmotionalKeywords(emotionalState)];
  const matchCount = allKeywords.filter(k => lower.includes(k)).length;
  const confidence = Math.min(matchCount / 3, 1);
  
  return {
    intent,
    emotionalState,
    blockage,
    confidence,
    keywords: allKeywords.filter(k => lower.includes(k))
  };
}

/**
 * Detecta la intención del usuario
 */
function detectIntent(message: string): UserIntent {
  const patterns = {
    seeking_help: ['ayuda', 'no sé', 'cómo', 'necesito', 'puedes'],
    sharing_progress: ['hice', 'terminé', 'logré', 'completé', 'avancé'],
    exploring_ideas: ['qué tal', 'podría', 'opciones', 'alternativas', 'ideas'],
    stuck: ['bloqueado', 'atascado', 'no puedo', 'imposible', 'difícil'],
    validating: ['está bien', 'qué opinas', 'crees que', 'debería'],
    planning: ['voy a', 'planeo', 'quiero hacer', 'mi objetivo'],
    reflecting: ['creo que', 'pienso', 'siento que', 'me doy cuenta']
  };
  
  for (const [intent, keywords] of Object.entries(patterns)) {
    if (keywords.some(k => message.includes(k))) {
      return intent as UserIntent;
    }
  }
  
  return 'seeking_help';
}

/**
 * Detecta el estado emocional
 */
function detectEmotionalState(message: string): EmotionalState {
  const patterns = {
    frustrated: ['frustrado', 'molesto', 'cansado', 'harto', 'no funciona'],
    confused: ['confundido', 'no entiendo', 'perdido', 'lío', 'mezclado'],
    excited: ['emocionado', 'genial', 'increíble', 'me encanta', 'wow'],
    uncertain: ['no estoy seguro', 'dudo', 'quizás', 'tal vez', 'inseguro'],
    motivated: ['listo', 'vamos', 'motivado', 'energía', 'adelante'],
    overwhelmed: ['demasiado', 'abrumado', 'mucho', 'no puedo con todo', 'agobiado']
  };
  
  for (const [state, keywords] of Object.entries(patterns)) {
    if (keywords.some(k => message.includes(k))) {
      return state as EmotionalState;
    }
  }
  
  return 'neutral';
}

/**
 * Detecta el tipo de bloqueo
 */
function detectBlockageType(message: string): BlockageType {
  const patterns = {
    inicio: ['no sé empezar', 'por dónde empiezo', 'cómo comienzo', 'primer paso'],
    direccion: ['muchas ideas', 'no sé cuál', 'qué elegir', 'opciones', 'decidir'],
    perfeccionismo: ['perfecto', 'no está bien', 'no me gusta', 'miedo', 'no es suficiente'],
    motivacion: ['sin ganas', 'no tengo energía', 'procrastino', 'desmotivado']
  };
  
  for (const [blockage, keywords] of Object.entries(patterns)) {
    if (keywords.some(k => message.includes(k))) {
      return blockage as BlockageType;
    }
  }
  
  return 'none';
}

/**
 * Genera respuesta adaptativa del coach
 */
export function generateCoachResponse(
  analysis: UserAnalysis,
  userMessage: string,
  userMode: 'direct' | 'calm' = 'direct'
): CoachResponse {
  const tone = userMode === 'direct' ? 'direct' : 'reflective';
  
  // Generar insight basado en análisis
  const insight = generateInsight(analysis);
  
  // Generar acción concreta
  const action = generateAction(analysis);
  
  // Generar pregunta estratégica
  const question = generateQuestion(analysis);
  
  return { insight, action, question, tone };
}

/**
 * Genera un insight basado en el análisis
 */
function generateInsight(analysis: UserAnalysis): string {
  const { intent, emotionalState, blockage } = analysis;
  
  // Insights por combinación de estado + bloqueo
  if (blockage === 'inicio' && emotionalState === 'overwhelmed') {
    return "Veo que hay muchas posibilidades y eso te paraliza.";
  }
  
  if (blockage === 'direccion' && emotionalState === 'confused') {
    return "Tienes ideas, pero falta claridad sobre cuál priorizar.";
  }
  
  if (blockage === 'perfeccionismo' && emotionalState === 'frustrated') {
    return "El estándar alto te está bloqueando el progreso.";
  }
  
  if (intent === 'sharing_progress') {
    return "Avanzar es más importante que la perfección.";
  }
  
  if (emotionalState === 'excited') {
    return "Esa energía es el combustible perfecto para empezar.";
  }
  
  return "El siguiente paso es más claro de lo que parece.";
}

/**
 * Genera una acción concreta
 */
function generateAction(analysis: UserAnalysis): string {
  const { blockage, intent } = analysis;
  
  if (blockage === 'inicio') {
    return "Escribe 1 frase describiendo tu proyecto. Solo 1.";
  }
  
  if (blockage === 'direccion') {
    return "Elige la idea más simple. Descártala o desarróllala en 2 minutos.";
  }
  
  if (blockage === 'perfeccionismo') {
    return "Haz una versión 'fea' en 10 minutos. Sin juzgar.";
  }
  
  if (blockage === 'motivacion') {
    return "Comprométete a 5 minutos. Después decides si continúas.";
  }
  
  if (intent === 'exploring_ideas') {
    return "Lista 3 opciones. No las evalúes todavía.";
  }
  
  if (intent === 'planning') {
    return "Define el primer micro-paso. Algo que tomes menos de 5 min.";
  }
  
  return "Toma 1 acción pequeña ahora. ¿Cuál es?";
}

/**
 * Genera una pregunta estratégica
 */
function generateQuestion(analysis: UserAnalysis): string {
  const { intent, blockage, emotionalState } = analysis;
  
  if (blockage === 'inicio') {
    return "¿Qué es lo MÁS simple que podrías hacer ahora?";
  }
  
  if (blockage === 'direccion') {
    return "Si solo pudieras elegir UNA, ¿cuál te da más curiosidad?";
  }
  
  if (blockage === 'perfeccionismo') {
    return "¿Qué pasaría si lo haces 'mal' a propósito?";
  }
  
  if (intent === 'validating') {
    return "¿Qué te dice tu instinto?";
  }
  
  if (intent === 'sharing_progress') {
    return "¿Qué aprendiste de esto?";
  }
  
  if (emotionalState === 'overwhelmed') {
    return "¿Cuál es la ÚNICA cosa que importa ahora?";
  }
  
  if (emotionalState === 'excited') {
    return "¿Cómo canalizas esa energía en acción?";
  }
  
  return "¿Cuál es tu siguiente paso?";
}

/**
 * Formatea la respuesta completa del coach
 */
export function formatCoachMessage(response: CoachResponse): string {
  const { insight, action, question } = response;
  
  return `${insight}\n\n💡 **Acción:** ${action}\n\n❓ ${question}`;
}

// Helpers
function getIntentKeywords(intent: UserIntent): string[] {
  const keywords: Record<UserIntent, string[]> = {
    seeking_help: ['ayuda', 'no sé', 'cómo'],
    sharing_progress: ['hice', 'terminé', 'logré'],
    exploring_ideas: ['qué tal', 'podría', 'opciones'],
    stuck: ['bloqueado', 'atascado', 'no puedo'],
    validating: ['está bien', 'qué opinas'],
    planning: ['voy a', 'planeo', 'quiero'],
    reflecting: ['creo que', 'pienso', 'siento']
  };
  return keywords[intent] || [];
}

function getEmotionalKeywords(state: EmotionalState): string[] {
  const keywords: Record<EmotionalState, string[]> = {
    frustrated: ['frustrado', 'molesto', 'cansado'],
    confused: ['confundido', 'no entiendo', 'perdido'],
    excited: ['emocionado', 'genial', 'increíble'],
    uncertain: ['no estoy seguro', 'dudo', 'quizás'],
    motivated: ['listo', 'vamos', 'motivado'],
    overwhelmed: ['demasiado', 'abrumado', 'mucho'],
    neutral: []
  };
  return keywords[state] || [];
}
