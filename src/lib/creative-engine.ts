import engine from "@/data/creativeEngine.json";

type Engine = typeof engine;

function pickRandom<T>(items: T[]) {
  if (!items.length) return null;
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

export function generateExercise(blockageId: string, lastTechnique?: string) {
  const blockage = engine.blockages.find((item) => item.id === blockageId);

  if (!blockage) {
    throw new Error("Bloqueo no encontrado");
  }

  let techniques = blockage.recommendedTechniques;

  if (lastTechnique && techniques.length > 1) {
    techniques = techniques.filter((item) => item !== lastTechnique);
  }

  const techniqueId = pickRandom(techniques) ?? "";
  const technique = engine.techniques.find((item) => item.id === techniqueId);

  if (!technique) {
    throw new Error("Tecnica no encontrada");
  }

  const exercise =
    pickRandom(technique.exerciseTemplates) ??
    "Describe tu idea en una frase corta.";

  return {
    blockageId,
    blockageLabel: blockage.label,
    techniqueId,
    techniqueName: technique.name,
    exercise,
  };
}
