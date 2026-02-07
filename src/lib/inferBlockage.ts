// lib/inferBlockage.ts
import { BlockageId } from "./conversationBrain";

export type ProblemScale = "small" | "medium" | "large";

/**
 * Detecta la escala del problema:
 * - small: output inmediato (post, frase, idea)
 * - medium: dirección/enfoque (muchas ideas, confuso, necesita foco)
 * - large: proyecto/identidad (empresa, marca, horizonte largo)
 */
export function detectProblemScale(text: string): ProblemScale {
  const t = text.toLowerCase();
  
  // Large: Strategic projects, long-term, high emotional load
  if (/empresa|marca|negocio|startup|proyecto/.test(t)) {
    return "large";
  }
  
  // Medium: Needs focus/clarity, has material but confused
  if (/muchas ideas|confuso|enfocar|no sé por dónde/.test(t)) {
    return "medium";
  }
  
  // Small: Immediate output, concrete, short-term
  return "small";
}

/**
 * Detecta posibles bloqueos basándose en texto libre del usuario.
 * No impone; solo sugiere opciones para que el usuario confirme.
 */
export function inferBlockage(text: string): BlockageId[] {
  const t = text.toLowerCase().trim();
  const suggestions: Set<BlockageId> = new Set();
  const length = t.length;

  // HOJA EN BLANCO: textos muy cortos o expresiones de vacío
  if (
    length < 40 ||
    /no sé|ni idea|en blanco|no tengo nada|no se me ocurre|vacío/.test(t)
  ) {
    suggestions.add("hoja_en_blanco");
  }

  // EXCESO DE IDEAS: texto largo o menciones de sobrecarga
  if (
    length > 180 ||
    /muchas ideas|demasiadas|mil ideas|todo junto|montón de|no sé cuál elegir/.test(t)
  ) {
    suggestions.add("exceso_de_ideas");
  }

  // FALTA DE ENFOQUE: vaguedad, confusión, falta de dirección
  if (
    /no está claro|confuso|difuso|no sé por dónde|disperso|no tengo claro|vago/.test(t)
  ) {
    suggestions.add("falta_de_enfoque");
  }

  // PERFECCIONISMO: autocrítica, estándares altos, insatisfacción
  if (
    /no es suficiente|debería ser mejor|no me gusta nada|no está bien|no me convence|tiene que ser|perfecto|mal hecho/.test(t)
  ) {
    suggestions.add("perfeccionismo");
  }

  // CANSANCIO CREATIVO: fatiga, agotamiento, saturación
  if (
    /cansado|quemado|saturado|agotado|ya no puedo|sin energía|harto|sin ganas/.test(t)
  ) {
    suggestions.add("cansancio_creativo");
  }

  // Fallback seguro: si no detectamos nada específico
  if (suggestions.size === 0) {
    suggestions.add("falta_de_enfoque");
  }

  // Máximo 3 opciones para no abrumar al usuario
  return Array.from(suggestions).slice(0, 3);
}
