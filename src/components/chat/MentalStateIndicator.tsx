import type { MentalState } from "@/lib/conversationBrain";

type MentalStateIndicatorProps = {
  state: MentalState;
};

export default function MentalStateIndicator({
  state,
}: MentalStateIndicatorProps) {
  const getEnergyColor = () => {
    if (state.energy === "low") return "bg-amber-100 text-amber-700";
    if (state.energy === "high") return "bg-emerald-100 text-emerald-700";
    return "bg-neutral-100 text-neutral-600";
  };

  const getEnergyLabel = () => {
    if (state.energy === "low") return "Ritmo calmo";
    if (state.energy === "high") return "Fluyendo";
    return "En proceso";
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <div
        className={`rounded-full px-2.5 py-1 font-medium ${getEnergyColor()}`}
      >
        {getEnergyLabel()}
      </div>
      {state.resistance === "high" && (
        <div className="text-neutral-400">Sin presion</div>
      )}
    </div>
  );
}
