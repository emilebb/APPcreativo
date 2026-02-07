type IdeasListProps = {
  result: {
    blockage: {
      label: string;
      goal: string;
    };
    technique: {
      id?: string;
      name: string;
      description: string;
    };
    exercise: string;
    nextStep: string;
  } | null;
};

export default function IdeasList({ result }: IdeasListProps) {
  if (!result) return null;

  return (
    <div className="mt-6 space-y-4 rounded bg-gray-100 p-4">
      <div>
        <div className="text-xs font-semibold uppercase text-black/50">
          Bloqueo detectado
        </div>
        <div className="text-lg font-semibold">{result.blockage.label}</div>
        <div className="text-sm text-black/60">{result.blockage.goal}</div>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase text-black/50">
          Tecnica aplicada
        </div>
        <div className="text-base font-semibold">{result.technique.name}</div>
        <div className="text-sm text-black/60">
          {result.technique.description}
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase text-black/50">
          Ejercicio
        </div>
        <div className="text-base">{result.exercise}</div>
      </div>
      <div className="text-sm text-black/70">{result.nextStep}</div>
    </div>
  );
}
