// lib/protocolEngine.ts
import protocols from "@/data/protocols.json";
import { BlockageId } from "./conversationBrain";
import type { ProblemScale } from "./inferBlockage";

export type ProtocolStep = {
  type: "system" | "prompt";
  text: string;
  placeholder?: string;
};

export type Protocol = {
  id: string;
  name: string;
  forBlockages: BlockageId[];
  forScale?: ProblemScale;
  duration: string;
  steps: ProtocolStep[];
  output: string;
};

export type ProtocolState = {
  protocolId: string;
  currentStepIndex: number;
  userResponses: string[];
  isComplete: boolean;
};

/**
 * Obtiene un protocolo aleatorio para un bloqueo específico,
 * priorizando según la escala del problema
 */
export function getProtocolForBlockage(
  blockageId: BlockageId,
  problemScale?: ProblemScale
): Protocol | null {
  let available = protocols.protocols.filter((p) =>
    p.forBlockages.includes(blockageId)
  );

  if (available.length === 0) return null;

  // Si hay escala definida, priorizar protocolos que la especifiquen
  if (problemScale) {
    const scaleMatches = available.filter((p) => p.forScale === problemScale);
    if (scaleMatches.length > 0) {
      available = scaleMatches;
    }
  }

  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex] as Protocol;
}

/**
 * Obtiene el paso actual de un protocolo
 */
export function getCurrentStep(
  protocolId: string,
  stepIndex: number
): ProtocolStep | null {
  const protocol = protocols.protocols.find((p) => p.id === protocolId);
  if (!protocol || stepIndex >= protocol.steps.length) return null;

  return protocol.steps[stepIndex] as ProtocolStep;
}

/**
 * Verifica si el protocolo está completo
 */
export function isProtocolComplete(
  protocolId: string,
  stepIndex: number
): boolean {
  const protocol = protocols.protocols.find((p) => p.id === protocolId);
  if (!protocol) return true;

  return stepIndex >= protocol.steps.length;
}

/**
 * Obtiene el nombre del protocolo
 */
export function getProtocolName(protocolId: string): string {
  const protocol = protocols.protocols.find((p) => p.id === protocolId);
  return protocol?.name || "Ejercicio";
}

/**
 * Obtiene el siguiente paso (system o prompt)
 */
export function getNextProtocolStep(state: ProtocolState): {
  step: ProtocolStep | null;
  isComplete: boolean;
} {
  const protocol = protocols.protocols.find((p) => p.id === state.protocolId);
  
  if (!protocol) {
    return { step: null, isComplete: true };
  }

  if (state.currentStepIndex >= protocol.steps.length) {
    return { step: null, isComplete: true };
  }

  return {
    step: protocol.steps[state.currentStepIndex] as ProtocolStep,
    isComplete: false,
  };
}

/**
 * Avanza el protocolo al siguiente paso
 */
export function advanceProtocol(state: ProtocolState, userResponse?: string): ProtocolState {
  const newResponses = userResponse
    ? [...state.userResponses, userResponse]
    : state.userResponses;

  const newIndex = state.currentStepIndex + 1;
  const protocol = protocols.protocols.find((p) => p.id === state.protocolId);

  return {
    ...state,
    currentStepIndex: newIndex,
    userResponses: newResponses,
    isComplete: !protocol || newIndex >= protocol.steps.length,
  };
}
