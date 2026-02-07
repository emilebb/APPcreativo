"use client";

import { useState } from "react";
import creativeEngine from "@/data/creativeEngine.json";

type PromptFormProps = {
  onResult?: (result: ExerciseResult) => void;
};

type ExerciseResult = {
  blockageId: string;
  blockageLabel: string;
  techniqueId: string;
  techniqueName: string;
  exercise: string;
};

export default function PromptForm({ onResult }: PromptFormProps) {
  const [issue, setIssue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockageId, setBlockageId] = useState(
    creativeEngine.blockages[0]?.id ?? ""
  );
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [response, setResponse] = useState("");
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [nextStep, setNextStep] = useState("");

  const requestExercise = async (lastTechnique?: string) => {
    setLoading(true);
    setError(null);
    setNextStep("");

    try {
      const res = await fetch("/api/exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockageId, lastTechnique }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "No se pudo generar ejercicio.");
      }

      const data = (await res.json()) as ExerciseResult;
      setResult(data);
      setHelpful(null);
      setResponse("");
      onResult?.(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const saveHistory = async (isHelpful: boolean) => {
    if (!result) return;
    await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blockage: result.blockageId,
        technique: result.techniqueId,
        exercise: result.exercise,
        userResponse: response,
        helpful: isHelpful,
      }),
    });
  };

  const handleStart = async () => {
    await requestExercise();
  };

  const handleHelpful = async (isHelpful: boolean) => {
    setHelpful(isHelpful);
    await saveHistory(isHelpful);

    if (!isHelpful) {
      await requestExercise(result?.techniqueId);
      return;
    }

    setNextStep("Quieres profundizar, guardar y terminar, o probar otro ejercicio?");
  };

  const handleAnother = async () => {
    await requestExercise(result?.techniqueId);
  };

  const handleFinish = () => {
    setNextStep("Guardado. Puedes iniciar otro bloqueo cuando quieras.");
  };

  const handleDeepen = () => {
    setNextStep("Profundiza: responde con una version mas concreta en 1 frase.");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-semibold">Tipo de bloqueo</label>
        <select
          className="w-full rounded border border-black/10 bg-white p-3"
          value={blockageId}
          onChange={(event) => setBlockageId(event.target.value)}
        >
          {creativeEngine.blockages.map((blockage) => (
            <option key={blockage.id} value={blockage.id}>
              {blockage.label}
            </option>
          ))}
        </select>
      </div>
      <textarea
        className="w-full p-4 border rounded"
        placeholder="En que estas bloqueado hoy?"
        value={issue}
        onChange={(event) => setIssue(event.target.value)}
      />
      {error ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <button
        onClick={handleStart}
        className="bg-black text-white px-6 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Pensando..." : "Generar ejercicio"}
      </button>

      {result ? (
        <div className="space-y-4 rounded border border-black/10 bg-white p-4">
          <div className="text-sm text-black/60">Vamos paso a paso.</div>
          <div>
            <div className="text-xs uppercase text-black/40">Ejercicio</div>
            <div className="text-base font-semibold">{result.exercise}</div>
          </div>
          <textarea
            className="w-full rounded border border-black/10 p-3"
            placeholder="Escribe tu respuesta aqui"
            value={response}
            onChange={(event) => setResponse(event.target.value)}
          />
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleHelpful(true)}
              className="rounded bg-emerald-600 px-4 py-2 text-sm text-white"
            >
              Si me ayudo
            </button>
            <button
              onClick={() => handleHelpful(false)}
              className="rounded bg-gray-800 px-4 py-2 text-sm text-white"
            >
              No me ayudo
            </button>
          </div>
          {helpful ? (
            <div className="space-y-2">
              <div className="text-sm text-black/70">{nextStep}</div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleDeepen}
                  className="rounded border border-black/20 px-3 py-2 text-sm"
                >
                  Profundizar esta idea
                </button>
                <button
                  onClick={handleFinish}
                  className="rounded border border-black/20 px-3 py-2 text-sm"
                >
                  Guardar y terminar
                </button>
                <button
                  onClick={handleAnother}
                  className="rounded border border-black/20 px-3 py-2 text-sm"
                >
                  Otro ejercicio
                </button>
              </div>
            </div>
          ) : null}
          {!helpful && helpful !== null ? (
            <div className="text-sm text-black/70">
              Probemos otra tecnica.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
