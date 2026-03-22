/**
 * BrainSystem - Sistema de procesamiento inteligente de conversaciones
 * Arquitectura modular para el Coach Creativo
 */

// ============================================
// 🔹 1. TIPOS BASE
// ============================================

export type IntentType = "explorar" | "resolver" | "validar" | "crear";

export type BlockageType = "inicio" | "direccion" | "motivacion" | null;

export type EmotionType = "positivo" | "neutral" | "frustrado" | "ansioso";

export type Mode = "directo" | "calmado";

export type ActionType =
  | "GREET"
  | "DETECT_BLOCKAGE"
  | "OFFER_EXERCISE"
  | "SUGGEST_IDEAS"
  | "VALIDATE_PROGRESS"
  | "CLARIFY"
  | "NONE";

export interface ProcessedInput {
  text: string;
  length: number;
  hasQuestion: boolean;
}

export interface BrainContext {
  history: string[];
  currentBlockage: BlockageType;
  currentIntent: IntentType | null;
  momentum: number;
  lastAction: ActionType | null;
}

export interface BrainResponse {
  message: string;
  action: string | null;
  question: string;
  actionType: ActionType;
  createNode?: boolean; // 🔥 Flag para crear nodo automático
  nodeText?: string;    // Texto del nodo a crear
}

// ============================================
// 🔍 2. INPUT PROCESSOR
// ============================================

export class InputProcessor {
  process(message: string): ProcessedInput {
    return {
      text: message.toLowerCase().trim(),
      length: message.length,
      hasQuestion: message.includes("?"),
    };
  }
}

// ============================================
// 🎯 3. INTENT DETECTOR
// ============================================

export class IntentDetector {
  detect(text: string): IntentType {
    // Explorar - busca ideas, opciones, inspiración
    if (text.match(/idea|inspiración|opciones|alternativa|qué hacer|sugerencia/)) {
      return "explorar";
    }

    // Resolver - necesita solución a problema específico
    if (text.match(/cómo|hacer|resolver|solución|ayuda con|problema/)) {
      return "resolver";
    }

    // Validar - busca feedback, opinión
    if (text.match(/qué opinas|está bien|crees que|debería|feedback|opinión/)) {
      return "validar";
    }

    // Crear - quiere empezar algo nuevo
    return "crear";
  }
}

// ============================================
// 🚧 4. BLOCKAGE DETECTOR
// ============================================

export class BlockageDetector {
  detect(text: string): BlockageType {
    // Bloqueo de inicio
    if (text.match(/no sé por dónde empezar|no puedo empezar|cómo empiezo|primer paso|comenzar/)) {
      return "inicio";
    }

    // Bloqueo de dirección
    if (text.match(/muchas ideas|no sé cuál elegir|perdido|confundido|demasiadas opciones|decidir/)) {
      return "direccion";
    }

    // Bloqueo de motivación/perfeccionismo
    if (text.match(/no es perfecto|miedo|no es suficiente|no me gusta|perfección|inseguro/)) {
      return "motivacion";
    }

    return null;
  }
}

// ============================================
// 💬 5. EMOTION DETECTOR
// ============================================

export class EmotionDetector {
  detect(text: string): EmotionType {
    // Frustrado
    if (text.match(/frustrado|cansado|no puedo|harto|molesto|difícil/)) {
      return "frustrado";
    }

    // Ansioso
    if (text.match(/miedo|ansiedad|nervioso|preocupado|estresado/)) {
      return "ansioso";
    }

    // Positivo
    if (text.match(/bien|genial|increíble|emocionado|motivado|listo|adelante/)) {
      return "positivo";
    }

    return "neutral";
  }
}

// ============================================
// 🧠 6. CONTEXT MANAGER
// ============================================

export class ContextManager {
  context: BrainContext = {
    history: [],
    currentBlockage: null,
    currentIntent: null,
    momentum: 50,
    lastAction: null,
  };

  update(data: Partial<BrainContext>) {
    this.context = { ...this.context, ...data };
  }

  addMessage(message: string) {
    this.context.history.push(message);
    
    // Mantener solo últimos 10 mensajes
    if (this.context.history.length > 10) {
      this.context.history = this.context.history.slice(-10);
    }
  }

  updateMomentum(delta: number) {
    this.context.momentum = Math.max(0, Math.min(100, this.context.momentum + delta));
  }

  getContext(): BrainContext {
    return { ...this.context };
  }

  reset() {
    this.context = {
      history: [],
      currentBlockage: null,
      currentIntent: null,
      momentum: 50,
      lastAction: null,
    };
  }
}

// ============================================
// ⚡ 7. DECISION ENGINE (EL CEREBRO REAL)
// ============================================

export class DecisionEngine {
  decide(input: {
    intent: IntentType;
    blockage: BlockageType;
    emotion: EmotionType;
    momentum: number;
    hasQuestion: boolean;
  }): ActionType {
    // Prioridad 1: Si hay bloqueo, detectarlo
    if (input.blockage) {
      return "DETECT_BLOCKAGE";
    }

    // Prioridad 2: Si está frustrado, ofrecer ejercicio
    if (input.emotion === "frustrado") {
      return "OFFER_EXERCISE";
    }

    // Prioridad 3: Basado en intención
    switch (input.intent) {
      case "explorar":
        return "SUGGEST_IDEAS";
      
      case "resolver":
        return "OFFER_EXERCISE";
      
      case "validar":
        return "VALIDATE_PROGRESS";
      
      case "crear":
        return input.hasQuestion ? "CLARIFY" : "OFFER_EXERCISE";
      
      default:
        return "CLARIFY";
    }
  }
}

// ============================================
// 🧪 8. RESPONSE GENERATOR (CLAVE UX)
// ============================================

export class ResponseGenerator {
  generate(action: ActionType, context: BrainContext, mode: Mode = "directo"): BrainResponse {
    const responses = this.getResponses(mode);
    const response = responses[action] || responses.CLARIFY;

    return {
      ...response,
      actionType: action,
    };
  }

  private getResponses(mode: Mode): Record<ActionType, Omit<BrainResponse, 'actionType'>> {
    if (mode === "directo") {
      return {
        GREET: {
          message: "Hola. Soy tu Coach Creativo.",
          action: null,
          question: "¿Qué necesitas hoy?",
          createNode: false,
        },
        DETECT_BLOCKAGE: {
          message: "Veo que estás bloqueado. Vamos a destrabarlo rápido.",
          action: "Escribe una versión simple de tu idea en 1 frase.",
          question: "¿De qué trata tu proyecto?",
          createNode: true, // 🔥 Crear nodo con la idea
        },
        OFFER_EXERCISE: {
          message: "Vamos directo a avanzar.",
          action: "Haz un boceto rápido en 2 minutos. Sin juzgar.",
          question: "¿Qué salió?",
          createNode: true, // 🔥 Crear nodo con el resultado
        },
        SUGGEST_IDEAS: {
          message: "Te doy 3 direcciones rápidas.",
          action: "Elige una y descríbela en 1 frase.",
          question: "¿Cuál te llama más?",
          createNode: true, // 🔥 Crear nodo con la idea elegida
        },
        VALIDATE_PROGRESS: {
          message: "Vas bien. Esto tiene potencial.",
          action: "Mejora una sola parte ahora.",
          question: "¿Qué ajustarías?",
          createNode: false,
        },
        CLARIFY: {
          message: "Cuéntame un poco más.",
          action: null,
          question: "¿Qué necesitas exactamente?",
          createNode: false,
        },
        NONE: {
          message: "Entiendo.",
          action: null,
          question: "¿Continuamos?",
          createNode: false,
        },
      };
    } else {
      // Modo calmado - más reflexivo
      return {
        GREET: {
          message: "Hola 👋 Me alegra verte aquí. Soy tu Coach Creativo.",
          action: null,
          question: "¿En qué puedo acompañarte hoy?",
          createNode: false,
        },
        DETECT_BLOCKAGE: {
          message: "Noto que algo te está frenando. Vamos a explorarlo juntos.",
          action: "Tómate un momento y describe tu proyecto en una frase simple.",
          question: "¿Qué es lo que más te preocupa de esto?",
          createNode: true, // 🔥 Crear nodo con la descripción
        },
        OFFER_EXERCISE: {
          message: "Vamos a dar un paso concreto para avanzar.",
          action: "Dedica 5 minutos a hacer un boceto sin presión. Solo explora.",
          question: "¿Cómo te sientes con lo que creaste?",
          createNode: true, // 🔥 Crear nodo con el resultado
        },
        SUGGEST_IDEAS: {
          message: "Aquí tienes algunas direcciones que podrías explorar.",
          action: "Revisa estas opciones y elige la que más resuene contigo.",
          question: "¿Alguna de estas te inspira?",
          createNode: true, // 🔥 Crear nodo con la idea elegida
        },
        VALIDATE_PROGRESS: {
          message: "Lo que has hecho hasta ahora es valioso. Vas por buen camino.",
          action: "Identifica un aspecto que quieras refinar.",
          question: "¿Qué parte sientes que necesita más atención?",
          createNode: false,
        },
        CLARIFY: {
          message: "Me gustaría entender mejor tu situación.",
          action: null,
          question: "¿Podrías contarme más sobre lo que necesitas?",
          createNode: false,
        },
        NONE: {
          message: "Te escucho.",
          action: null,
          question: "¿Hay algo más que quieras compartir?",
          createNode: false,
        },
      };
    }
  }
}

// ============================================
// 🔄 9. BRAIN MAIN
// ============================================

export class Brain {
  private input = new InputProcessor();
  private intent = new IntentDetector();
  private blockage = new BlockageDetector();
  private emotion = new EmotionDetector();
  private context = new ContextManager();
  private decision = new DecisionEngine();
  private response = new ResponseGenerator();
  private mode: Mode = "directo";

  constructor(mode: Mode = "directo") {
    this.mode = mode;
  }

  setMode(mode: Mode) {
    this.mode = mode;
  }

  processMessage(message: string): BrainResponse {
    // 1. Procesar input
    const inputData = this.input.process(message);

    // 2. Detectar intención, bloqueo y emoción
    const intentType = this.intent.detect(inputData.text);
    const blockageType = this.blockage.detect(inputData.text);
    const emotionType = this.emotion.detect(inputData.text);

    // 3. Actualizar contexto
    this.context.update({
      currentIntent: intentType,
      currentBlockage: blockageType,
    });

    // 4. Ajustar momentum basado en emoción
    if (emotionType === "positivo") {
      this.context.updateMomentum(10);
    } else if (emotionType === "frustrado") {
      this.context.updateMomentum(-10);
    }

    // 5. Decidir acción
    const action = this.decision.decide({
      intent: intentType,
      blockage: blockageType,
      emotion: emotionType,
      momentum: this.context.getContext().momentum,
      hasQuestion: inputData.hasQuestion,
    });

    // 6. Generar respuesta
    const brainResponse = this.response.generate(
      action,
      this.context.getContext(),
      this.mode
    );

    // 7. Guardar en historial
    this.context.addMessage(message);
    this.context.update({ lastAction: action });

    return brainResponse;
  }

  getContext(): BrainContext {
    return this.context.getContext();
  }

  reset() {
    this.context.reset();
  }
}

// ============================================
// 🚀 10. EXPORT DEFAULT
// ============================================

export default Brain;
