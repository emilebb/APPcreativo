// lib/conversationBrain.ts

export type BlockageId =
  | "hoja_en_blanco"
  | "falta_de_enfoque"
  | "exceso_de_ideas"
  | "perfeccionismo"
  | "cansancio_creativo";

export type Step =
  | "welcome"
  | "returning_week"
  | "free_input"
  | "suggest_blockage"
  | "choose_blockage"
  | "show_exercise"
  | "user_response"
  | "protocol_step"
  | "protocol_offer"
  | "ideas_offer"
  | "feedback"
  | "next_action"
  | "end";

export type Energy = "low" | "medium" | "high";
export type Clarity = "low" | "medium" | "high";
export type Resistance = "low" | "high";

export type MentalState = {
  energy: Energy;
  clarity: Clarity;
  resistance: Resistance;
};

export type SessionContext = {
  step: Step;
  blockageId?: BlockageId;

  // contexto inicial del usuario (entrada libre)
  initialContext?: string;
  suggestedBlockages?: BlockageId[];
  problemScale?: "small" | "medium" | "large";
  detectedTopic?: string;  // e.g. "ropa urbana"
  hasCompletedProtocol?: boolean;  // for idea generation gate

  // ejercicio actual (ejercicio simple)
  lastTechniqueId?: string;
  lastExercise?: string;

  // protocolo multi-paso (ejercicio premium)
  protocolId?: string;
  protocolStepIndex?: number;
  protocolResponses?: string[];
  nextProtocolOffer?: string;  // protocolo de seguimiento ofrecido
  
  // week tracking (for 7-day protocols)
  weekProjectTitle?: string;
  weekCurrentDay?: number;
  weekStartedAt?: string;

  // señales
  mental: MentalState;

  // contadores para evitar loops
  attempts: number; // intentos de ejercicios en esta sesión
  helpfulNoCount: number; // cuántas veces dijo "no" seguidas
};

export type BrainAction =
  | { type: "ASK_FREE_INPUT" }
  | { type: "SUGGEST_BLOCKAGE"; payload: { suggestions: BlockageId[] } }
  | { type: "ASK_BLOCKAGE" }
  | { type: "FETCH_EXERCISE"; payload: { blockageId: BlockageId; lastTechniqueId?: string } }
  | { type: "START_PROTOCOL"; payload: { protocolId: string } }
  | { type: "PROTOCOL_STEP"; payload: { stepType: "system" | "prompt"; text: string; placeholder?: string } }
  | { type: "ASK_USER_RESPONSE" }
  | { type: "ASK_FEEDBACK" }
  | { type: "OFFER_NEXT"; payload: { options: ("another" | "deepen" | "end")[] } }
  | { type: "END_SESSION" };

export type BrainOutput = {
  messages: string[]; // mensajes del sistema (máx 2 frases c/u, ideal)
  action: BrainAction;
  updated: Partial<SessionContext>;
};

/**
 * Heurísticas simples pero efectivas para "leer" al usuario.
 * (No IA; reglas que dan sensación de coach humano)
 */
export function evaluateUserInput(text: string): Partial<MentalState> {
  const t = (text || "").trim().toLowerCase();

  const wordCount = t.split(/\s+/).filter(Boolean).length;
  const charCount = t.length;

  // energía: respuestas muy cortas suelen indicar baja energía
  let energy: Energy = "medium";
  if (charCount <= 12 || wordCount <= 3) energy = "low";
  if (charCount >= 140 || wordCount >= 30) energy = "high";

  // resistencia: "no sé", "da igual", "no puedo", etc.
  const resistanceSignals = [
    "no sé",
    "nose",
    "ni idea",
    "da igual",
    "no puedo",
    "no me sale",
    "me da pereza",
    "me cuesta",
    "no tengo ganas"
  ];
  const resistance: Resistance = resistanceSignals.some((s) => t.includes(s)) ? "high" : "low";

  // claridad: si hay estructura (puntos, comas, "porque", "para", etc.) suele haber más claridad
  const claritySignals = ["para", "porque", "objetivo", "quiero", "audiencia", "pero", "entonces", "si"];
  let clarity: Clarity = "medium";
  if (energy === "low" && resistance === "high") clarity = "low";
  else if (claritySignals.some((s) => t.includes(s)) || charCount >= 100) clarity = "high";

  return { energy, resistance, clarity };
}

// Microcopy según estado (personalidad "El Acompañante")
function tonePrefix(mental: MentalState) {
  if (mental.energy === "low") return ["Hagámoslo muy fácil.", "Una cosa a la vez."];
  if (mental.resistance === "high") return ["Está bien si ahora no sale.", "Probemos distinto."];
  return ["Vamos paso a paso.", "No hace falta hacerlo perfecto."];
}

// Mensajes cortos, máx 2 frases por mensaje.
function msg(...lines: string[]) {
  return lines.slice(0, 2).join("\n");
}

export function brain(
  ctx: SessionContext,
  userText?: string,
  userFeedback?: "yes" | "no"
): BrainOutput {
  const updated: Partial<SessionContext> = {};

  // Actualizar estado mental si el usuario escribió algo
  if (typeof userText === "string") {
    const evalMental = evaluateUserInput(userText);
    updated.mental = {
      ...ctx.mental,
      ...evalMental
    };
  }

  const mental = updated.mental ?? ctx.mental;
  const prefix = tonePrefix(mental);

  // Guardrails anti-loop
  const attempts = ctx.attempts ?? 0;
  const helpfulNoCount = ctx.helpfulNoCount ?? 0;

  // 1) Welcome / Free input
  if (ctx.step === "welcome") {
    return {
      messages: [
        msg("Tómate un momento.", "¿Qué tienes ahora mismo en la cabeza?")
      ],
      action: { type: "ASK_FREE_INPUT" },
      updated: { step: "free_input" }
    };
  }

  // 2) Free input → Suggest blockages
  if (ctx.step === "free_input") {
    if (!userText || userText.trim().length === 0) {
      return {
        messages: [msg("Escribe lo que sientes.", "Puede ser breve.")],
        action: { type: "ASK_FREE_INPUT" },
        updated: {}
      };
    }

    // Importar e inferir bloqueos (se hace en UI, pero dejamos lógica aquí por si acaso)
    // En UI: inferBlockage(userText) → suggestedBlockages
    updated.initialContext = userText;

    return {
      messages: [
        msg("Gracias por escribirlo.", "Veamos qué tipo de bloqueo se parece más a esto.")
      ],
      action: { type: "SUGGEST_BLOCKAGE", payload: { suggestions: ctx.suggestedBlockages || [] } },
      updated: { step: "suggest_blockage", ...updated }
    };
  }

  // 3) Suggest blockage / Choose blockage
  if (ctx.step === "suggest_blockage" || ctx.step === "choose_blockage") {
    // En UI, esto lo maneja el selector; aquí solo definimos siguiente paso.
    // Si ya hay blockageId, pedimos ejercicio.
    if (ctx.blockageId) {
      return {
        messages: [msg("Bien.", "Probemos un ejercicio sencillo.")],
        action: {
          type: "FETCH_EXERCISE",
          payload: { blockageId: ctx.blockageId, lastTechniqueId: ctx.lastTechniqueId }
        },
        updated: { step: "show_exercise" }
      };
    }

    return {
      messages: [msg("Elige uno. No tiene que ser exacto.")],
      action: { type: "ASK_BLOCKAGE" },
      updated: {}
    };
  }

  // 2) Show exercise -> Ask user response
  if (ctx.step === "show_exercise") {
    return {
      messages: [msg("No busques hacerlo bien.", "Escribe tu respuesta.")],
      action: { type: "ASK_USER_RESPONSE" },
      updated: { step: "user_response" }
    };
  }

  // 3) After user response -> Ask feedback
  if (ctx.step === "user_response") {
    // Si no hay texto, insistir suave
    if (!userText || userText.trim().length === 0) {
      return {
        messages: [msg("Puede ser una palabra.", "Lo mínimo sirve.")],
        action: { type: "ASK_USER_RESPONSE" },
        updated: {}
      };
    }

    // Incrementar intentos (respondió al ejercicio)
    updated.attempts = attempts + 1;

    return {
      messages: [msg("Gracias.", "¿Esto te destrabó un poco?")],
      action: { type: "ASK_FEEDBACK" },
      updated: { step: "feedback", ...updated }
    };
  }

  // 4) Feedback handling
  if (ctx.step === "feedback") {
    if (!userFeedback) {
      return {
        messages: [msg("Dime solo sí o no.")],
        action: { type: "ASK_FEEDBACK" },
        updated: {}
      };
    }

    if (userFeedback === "no") {
      const newNoCount = helpfulNoCount + 1;
      updated.helpfulNoCount = newNoCount;

      // Si dijo "no" varias veces, bajar exigencia y cerrar con cuidado o micro-ejercicio
      if (newNoCount >= 3 || attempts >= 4) {
        return {
          messages: [msg("Por hoy es suficiente.", "Guarda esto y vuelve cuando quieras.")],
          action: { type: "END_SESSION" },
          updated: { step: "end", ...updated }
        };
      }

      return {
        messages: [msg("Está bien.", "Probemos algo distinto.")],
        action: {
          type: "FETCH_EXERCISE",
          payload: { blockageId: ctx.blockageId!, lastTechniqueId: ctx.lastTechniqueId }
        },
        updated: { step: "show_exercise", ...updated }
      };
    }

    // userFeedback === "yes"
    updated.helpfulNoCount = 0;

    // Ofrecer siguiente acción con pocas opciones
    return {
      messages: [msg("Bien hecho.", "¿Seguimos o lo dejamos aquí?")],
      action: { type: "OFFER_NEXT", payload: { options: ["another", "deepen", "end"] } },
      updated: { step: "next_action", ...updated }
    };
  }

  // 5) Next action (UI decide)
  if (ctx.step === "next_action") {
    // En UI: another/deepen/end
    // Aquí solo damos fallback seguro.
    return {
      messages: [msg("Dime: otro, profundizar o parar.")],
      action: { type: "OFFER_NEXT", payload: { options: ["another", "deepen", "end"] } },
      updated: {}
    };
  }

  // 6) End
  return {
    messages: [msg("Por hoy es suficiente.", "Vuelve cuando lo necesites.")],
    action: { type: "END_SESSION" },
    updated: { step: "end" }
  };
}
