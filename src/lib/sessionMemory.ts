export type SessionMemory = {
  lastBlockage: string | null;
  successfulTechniques: string[];
  sessionCount: number;
  lastSession: string | null;
};

const STORAGE_KEY = "creative_coach_memory";

export function loadMemory(): SessionMemory {
  if (typeof window === "undefined") {
    return {
      lastBlockage: null,
      successfulTechniques: [],
      sessionCount: 0,
      lastSession: null,
    };
  }

  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return {
          lastBlockage: null,
          successfulTechniques: [],
          sessionCount: 0,
          lastSession: null,
        };
      }
      return JSON.parse(stored) as SessionMemory;
    }
    return {
      lastBlockage: null,
      successfulTechniques: [],
      sessionCount: 0,
      lastSession: null,
    };
  } catch {
    return {
      lastBlockage: null,
      successfulTechniques: [],
      sessionCount: 0,
      lastSession: null,
    };
  }
}

export function saveMemory(memory: SessionMemory) {
  if (typeof window === "undefined") return;
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
    }
  } catch {
    // Ignore storage errors
  }
}

export function getWelcomeMessage(memory: SessionMemory): string {
  if (memory.sessionCount === 0) {
    return "Respira un segundo.\n?Que tipo de bloqueo sientes ahora?";
  }

  if (memory.successfulTechniques.length > 0) {
    return "Hola otra vez.\nLa ultima vez avanzaste.\n?Seguimos por ahi?";
  }

  return "Hola.\n?En que estas bloqueado hoy?";
}
