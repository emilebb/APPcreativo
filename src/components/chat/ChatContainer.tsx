"use client";

import { useMemo, useState, useEffect } from "react";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatOptions from "@/components/chat/ChatOptions";
import ChatInput from "@/components/chat/ChatInput";
import MentalStateIndicator from "@/components/chat/MentalStateIndicator";
import { useProfile } from "@/lib/useProfile";
import engine from "@/data/creativeEngine.json";
import {
  brain,
  type SessionContext,
  type BrainAction,
  type BlockageId,
} from "@/lib/conversationBrain";
import { inferBlockage, detectProblemScale } from "@/lib/inferBlockage";
import { extractTopic, shouldOfferIdeas } from "@/lib/extractTopic";
import {
  getProtocolForBlockage,
  advanceProtocol,
  getNextProtocolStep,
  type ProtocolState,
} from "@/lib/protocolEngine";
import {
  loadMemory,
  saveMemory,
  getDefaultMemory,
  type LocalMemory,
  loadCurrentWeek,
  saveCurrentWeek,
  clearCurrentWeek,
  type CurrentWeek,
} from "@/lib/memory.local";

type Message = {
  role: "system" | "user";
  content: string;
};

type ExerciseResult = {
  blockageId: string;
  blockageLabel: string;
  techniqueId: string;
  techniqueName: string;
  exercise: string;
};

export default function ChatContainer() {
  const { profile } = useProfile();

  const [sessionMemory, setSessionMemory] = useState<LocalMemory>(
    getDefaultMemory()
  );
  const [sessionStartedAt, setSessionStartedAt] = useState<string>(
    () => new Date().toISOString()
  );
  const [lastFeedback, setLastFeedback] = useState<"yes" | "no" | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<ExerciseResult | null>(null);
  const [protocolState, setProtocolState] = useState<ProtocolState | null>(null);

  // SessionContext: la única fuente de verdad
  const [ctx, setCtx] = useState<SessionContext>({
    step: "welcome",
    mental: { energy: "medium", clarity: "medium", resistance: "low" },
    attempts: 0,
    helpfulNoCount: 0,
  });

  // Inicialización con memoria de sesiones anteriores
  useEffect(() => {
    const memory = loadMemory();
    setSessionMemory(memory);

    // Función async para manejar la inicialización
    (async () => {
      // Verificar si hay feedback de ajustes
      if (typeof window !== 'undefined') {
        const settingsFeedback = localStorage.getItem("settings_feedback");
        if (settingsFeedback) {
          await addSystemMessagesWithPacing([settingsFeedback]);
          localStorage.removeItem("settings_feedback");
          return; // No continuar con la lógica de savedWeek
        }
      }

      const savedWeek = loadCurrentWeek();
      
      if (savedWeek && savedWeek.currentDay <= 7) {
        // Detectar si es el mismo día o un día diferente
        const now = new Date();
        const startDate = new Date(savedWeek.startedAt);
        const daysSince = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const isSameDay = daysSince === 0;
        
        if (isSameDay) {
          // Mismo día - continuar automáticamente sin preguntar
          await addSystemMessagesWithPacing(["Seguimos donde lo dejamos."]);
          
          // Continuar directamente al protocolo
          const currentDay = savedWeek.currentDay;
          const dayStartIndexes = [1, 5, 9, 13, 17, 21, 25];
          const startStepIndex = dayStartIndexes[currentDay - 1] || 0;
          
          const newProtocolState: ProtocolState = {
            protocolId: "primeros_7_dias",
            currentStepIndex: startStepIndex,
            userResponses: [],
            isComplete: false,
          };

          setProtocolState(newProtocolState);
          setCtx((prev) => ({
            ...prev,
            protocolId: "primeros_7_dias",
            protocolStepIndex: startStepIndex,
            step: "protocol_step",
            weekProjectTitle: savedWeek.projectTitle,
            weekCurrentDay: currentDay,
            weekStartedAt: savedWeek.startedAt,
          }));

          setIsThinking(true);
          await new Promise((resolve) => setTimeout(resolve, getDelay(600)));
          setIsThinking(false);

          const { step } = getNextProtocolStep(newProtocolState);
          if (step) {
            addSystemMessages([step.text]);
          }
        } else {
          // Día diferente - preguntar si quiere continuar
          await addSystemMessagesWithPacing([
            "Ayer lo dejamos aquí.",
            "¿Seguimos?"
          ]);
          
          setCtx((prev) => ({
            ...prev,
            step: "returning_week",
            weekProjectTitle: savedWeek.projectTitle,
            weekCurrentDay: savedWeek.currentDay,
            weekStartedAt: savedWeek.startedAt,
          }));
        }
      } else {
        // Usuario nuevo o sin semana activa
        const output = brain(ctx);
        addSystemMessages(output.messages);
        setCtx((prev) => ({ ...prev, ...output.updated }));
      }
    })();
  }, []);

  const blockageOptions = useMemo(
    () =>
      engine.blockages.map((blockage) => ({
        id: blockage.id,
        label: blockage.label,
      })),
    []
  );

  function addSystemMessages(msgs: string[]) {
    setMessages((prev) => [
      ...prev,
      ...msgs.map((content) => ({ role: "system" as const, content })),
    ]);
  }

  // Helper: calcular delay basado en perfil del usuario
  const getDelay = (baseDelay: number): number => {
    if (profile?.creative_mode === "direct") {
      return Math.round(baseDelay * 0.3); // 3x más rápido
    }
    return baseDelay; // calm = ritmo estándar
  };

  // Agregar mensajes del sistema con micro-pausas para ritmo humano
  async function addSystemMessagesWithPacing(msgs: string[]) {
    for (let i = 0; i < msgs.length; i++) {
      if (i > 0) {
        // Micro-pausa entre mensajes: ajustada por perfil
        await new Promise((resolve) => setTimeout(resolve, getDelay(500)));
      }
      setMessages((prev) => [
        ...prev,
        { role: "system" as const, content: msgs[i] },
      ]);
    }
  }

  function addUserMessage(text: string) {
    setMessages((prev) => [...prev, { role: "user", content: text }]);
  }

  function updateMemory(updater: (prev: LocalMemory) => LocalMemory) {
    setSessionMemory((prev) => {
      const next = updater(prev);
      saveMemory(next);
      return next;
    });
  }

  async function thinkAndRespond(output: ReturnType<typeof brain>) {
    const baseDelay = ctx.mental.energy === "low" ? 600 : 800;
    const delay = getDelay(baseDelay);
    setIsThinking(true);
    await new Promise((resolve) => setTimeout(resolve, delay));
    setIsThinking(false);

    addSystemMessages(output.messages);
    setCtx((prev) => ({ ...prev, ...output.updated }));

    return output;
  }

  async function executeAction(action: BrainAction) {
    switch (action.type) {
      case "ASK_FREE_INPUT":
        // UI manejará el input libre
        break;

      case "SUGGEST_BLOCKAGE": {
        // Las sugerencias ya están en ctx.suggestedBlockages
        // UI mostrará opciones filtradas
        break;
      }

      case "ASK_BLOCKAGE":
        // UI manejará el selector; no hacer nada aquí
        break;

      case "FETCH_EXERCISE": {
        const { blockageId, lastTechniqueId } = action.payload;
        await requestExercise(blockageId, lastTechniqueId);
        // Después de obtener ejercicio, avanzar automáticamente
        const output = brain({ ...ctx, blockageId, lastTechniqueId }, undefined, undefined);
        await thinkAndRespond(output);
        break;
      }

      case "ASK_USER_RESPONSE":
      case "ASK_FEEDBACK":
      case "OFFER_NEXT":
        // UI manejará el input/opciones
        break;

      case "END_SESSION":
        // Guardar memoria de sesión
        updateMemory((prev) => {
          const blockageId = ctx.blockageId;
          const protocolId = protocolState?.protocolId;
          const outcome = lastFeedback
            ? lastFeedback === "yes"
              ? "helpful"
              : "not_helpful"
            : "unknown";

          const nextStats = {
            blockageCounts: { ...prev.stats.blockageCounts },
            protocolScores: { ...prev.stats.protocolScores },
          };

          if (blockageId) {
            nextStats.blockageCounts[blockageId] =
              (nextStats.blockageCounts[blockageId] || 0) + 1;
          }

          if (protocolId) {
            const delta = lastFeedback === "yes" ? 1 : lastFeedback === "no" ? -1 : 0;
            nextStats.protocolScores[protocolId] =
              (nextStats.protocolScores[protocolId] || 0) + delta;
          }

          return {
            ...prev,
            stats: nextStats,
            sessions: [
              ...prev.sessions,
              {
                startedAt: sessionStartedAt,
                endedAt: new Date().toISOString(),
                blockageId: blockageId,
                protocolId: protocolId,
                outcome: outcome,
              },
            ],
          };
        });

        setSessionStartedAt(new Date().toISOString());
        setLastFeedback(null);
        break;
    }
  }

  async function requestExercise(blockageId: string, lastTechnique?: string) {
    setIsThinking(true);
    const baseDelay = ctx.mental.energy === "low" ? 600 : 800;
    const delay = getDelay(baseDelay);
    await new Promise((resolve) => setTimeout(resolve, delay));

    const res = await fetch("/api/exercise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockageId, lastTechnique }),
    });

    const data = (await res.json()) as ExerciseResult;
    setCurrentExercise(data);
    setIsThinking(false);

    setMessages((prev) => [
      ...prev,
      {
        role: "system",
        content: data.exercise,
      },
    ]);
  }

  // Handler principal: el usuario escribió texto libre inicial
  async function handleFreeInput(text: string) {
    addUserMessage(text);

    // Inferir posibles bloqueos basándose en el texto
    const suggestions = inferBlockage(text);
    const scale = detectProblemScale(text);
    const topic = extractTopic(text);

    const updated = { 
      ...ctx, 
      initialContext: text, 
      suggestedBlockages: suggestions,
      problemScale: scale,
      detectedTopic: topic || undefined
    };
    setCtx(updated);

    const output = brain(updated, text);
    await thinkAndRespond(output);
    await executeAction(output.action);
  }

  // Handler principal: el usuario seleccionó un bloqueo
  async function handleBlockageSelect(blockageId: string) {
    addUserMessage(blockageId.replace(/_/g, " "));

    // Iniciar protocolo multi-paso para este bloqueo
    const protocol = getProtocolForBlockage(
      blockageId as BlockageId,
      ctx.problemScale
    );

    if (protocol) {
      // Iniciar protocolo
      const newProtocolState: ProtocolState = {
        protocolId: protocol.id,
        currentStepIndex: 0,
        userResponses: [],
        isComplete: false,
      };

      setProtocolState(newProtocolState);

      const updated = {
        ...ctx,
        blockageId: blockageId as BlockageId,
        protocolId: protocol.id,
        protocolStepIndex: 0,
        step: "protocol_step" as const,
      };
      setCtx(updated);

      // Mostrar primer paso del protocolo
      setIsThinking(true);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setIsThinking(false);

      const { step } = getNextProtocolStep(newProtocolState);
      if (step) {
        addSystemMessages([step.text]);
        
        // Si el primer paso es un prompt, avanzamos automáticamente
        if (step.type === "prompt") {
          // El usuario necesitará responder
        } else if (step.type === "system") {
          // Mensaje del sistema, avanzar automáticamente al siguiente
          setTimeout(() => handleProtocolNext(), 1000);
        }
      }
    } else {
      // Fallback: ejercicio simple si no hay protocolo
      const updated = { ...ctx, blockageId: blockageId as BlockageId };
      setCtx(updated);

      const output = brain(updated);
      await thinkAndRespond(output);
      await executeAction(output.action);
    }
  }

  // Handler: avanzar en el protocolo
  async function handleProtocolNext(userResponse?: string) {
    if (!protocolState) return;

    // Agregar respuesta del usuario si existe
    if (userResponse) {
      addUserMessage(userResponse);
    }

    // Avanzar al siguiente paso
    const newState = advanceProtocol(protocolState, userResponse);
    setProtocolState(newState);

    setCtx((prev) => ({
      ...prev,
      protocolStepIndex: newState.currentStepIndex,
      protocolResponses: newState.userResponses,
    }));

    // 🔥 GUARDAR PROGRESO DE SEMANA (si es protocolo de 7 días)
    if (protocolState.protocolId === "primeros_7_dias" && userResponse) {
      // Nuevos índices después del polish: prompts en [3, 7, 11, 15, 19, 23, 27]
      const dayPromptIndexes = [3, 7, 11, 15, 19, 23, 27];
      const dayIndex = dayPromptIndexes.indexOf(newState.currentStepIndex - 1);
      
      if (dayIndex !== -1) {
        const dayNumber = dayIndex + 1;
        const savedWeek = loadCurrentWeek();
        
        if (savedWeek) {
          savedWeek.currentDay = dayNumber;
          savedWeek.days[dayNumber] = { done: true, result: userResponse };
          saveCurrentWeek(savedWeek);
          
          // No mostrar mensaje extra - el protocolo ya tiene el cierre integrado
          // Solo pausar después del día 1-6 (día 7 continúa al feedback)
          if (dayNumber < 7) {
            // Dejar que el protocolo muestre su cierre, luego terminar
            setCtx((prev) => ({ ...prev, step: "end" }));
            return;
          }
        }
      }
    }

    // Si el protocolo está completo, verificar si ofrecer protocolo de seguimiento
    if (newState.isComplete) {
      setIsThinking(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsThinking(false);

      // Si completó "primeros_7_dias", limpiar semana guardada
      if (protocolState.protocolId === "primeros_7_dias") {
        clearCurrentWeek();
        addSystemMessages(["¿Esto te destrabó un poco?"]);
        setCtx((prev) => ({ ...prev, step: "feedback" }));
        return;
      }

      // Si completó "mapa_minimo_proyecto" (escala large), ofrecer 7 días
      if (protocolState.protocolId === "mapa_minimo_proyecto" && ctx.problemScale === "large") {
        addSystemMessages(["¿Te serviría bajarlo\na una semana tranquila?"]);
        
        // Marcar que estamos ofreciendo el siguiente protocolo
        setCtx((prev) => ({ 
          ...prev, 
          step: "protocol_offer" as any,
          nextProtocolOffer: "primeros_7_dias"
        }));
        return;
      }

      // 🎨 Ofrecer ideas si detectamos tema específico y es el momento correcto
      if (
        ctx.detectedTopic && 
        shouldOfferIdeas(ctx.blockageId, ctx.problemScale, true)
      ) {
        addSystemMessages([
          "Ahora que está más claro,",
          "puedo darte ideas concretas sobre " + ctx.detectedTopic + "."
        ]);
        
        setCtx((prev) => ({ 
          ...prev, 
          step: "ideas_offer" as any,
          hasCompletedProtocol: true
        }));
        return;
      }

      // De lo contrario, pedir feedback normal
      addSystemMessages(["¿Esto te destrabó un poco?"]);
      setCtx((prev) => ({ ...prev, step: "feedback" }));
      return;
    }

    // Mostrar siguiente paso
    setIsThinking(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsThinking(false);

    const { step } = getNextProtocolStep(newState);
    if (step) {
      addSystemMessages([step.text]);
    }
  }

  // Handler: cambiar de ejercicio (abandonar protocolo actual)
  async function handleChangeExercise() {
    if (!ctx.blockageId) return;

    addUserMessage("Cambiar ejercicio");

    // Reiniciar sin protocolo
    setProtocolState(null);

    // Pedir un nuevo protocolo
    const protocol = getProtocolForBlockage(ctx.blockageId, ctx.problemScale);
    if (protocol && protocol.id !== protocolState?.protocolId) {
      const newProtocolState: ProtocolState = {
        protocolId: protocol.id,
        currentStepIndex: 0,
        userResponses: [],
        isComplete: false,
      };

      setProtocolState(newProtocolState);
      setCtx((prev) => ({
        ...prev,
        protocolId: protocol.id,
        protocolStepIndex: 0,
        step: "protocol_step",
      }));

      setIsThinking(true);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setIsThinking(false);

      const { step } = getNextProtocolStep(newProtocolState);
      if (step) {
        addSystemMessages([step.text]);
      }
    } else {
      // Fallback: volver a elegir bloqueo
      setCtx((prev) => ({ ...prev, step: "choose_blockage" }));
      addSystemMessages(["Elige otro tipo de bloqueo."]);
    }
  }

  // Handler principal: el usuario escribió texto (en user_response)
  async function handleUserText(text: string) {
    addUserMessage(text);

    const output = brain(ctx, text);
    await thinkAndRespond(output);
    await executeAction(output.action);
  }

  // Handler principal: el usuario dio feedback sí/no
  async function handleFeedback(feedback: "yes" | "no") {
    addUserMessage(feedback === "yes" ? "Sí" : "No");
    setLastFeedback(feedback);

    if (protocolState?.protocolId) {
      updateMemory((prev) => {
        const nextStats = {
          ...prev.stats,
          protocolScores: { ...prev.stats.protocolScores },
        };
        const delta = feedback === "yes" ? 1 : -1;
        nextStats.protocolScores[protocolState.protocolId] =
          (nextStats.protocolScores[protocolState.protocolId] || 0) + delta;
        return { ...prev, stats: nextStats };
      });
    }

    const output = brain(ctx, undefined, feedback);
    await thinkAndRespond(output);
    await executeAction(output.action);
  }

  // Handler principal: el usuario eligió siguiente acción (another/deepen/end)
  async function handleNextAction(action: string) {
    if (action === "end") {
      const output = brain({ ...ctx, step: "end" });
      await thinkAndRespond(output);
      await executeAction(output.action);
      return;
    }

    if (action === "another" && currentExercise) {
      addUserMessage("Otro ejercicio");
      await requestExercise(currentExercise.blockageId, currentExercise.techniqueId);
      const output = brain(ctx);
      await thinkAndRespond(output);
      return;
    }

    if (action === "deepen") {
      addUserMessage("Profundizar");
      // Aquí iría lógica de multi-step (Phase 2)
      // Por ahora, tratamos como "otro"
      if (currentExercise) {
        await requestExercise(currentExercise.blockageId);
        const output = brain(ctx);
        await thinkAndRespond(output);
      }
    }
  }

  const [projectName, setProjectName] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.currentProject) {
      const projectName = profile.currentProject?.name || "tu proyecto";
      setProjectName(projectName);
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: `Veo que estás trabajando en el proyecto "${projectName}". ¿En qué puedo ayudarte hoy?`,
        },
      ]);
    }
  }, [profile]);

  const renderMessages = () => {
    return messages.map((message, index) => (
      <ChatMessage
        key={index}
        role={message.role}
        content={message.content}
      />
    ));
  };

  return (
    <div className="chat-container flex flex-col h-full bg-chat-bg p-4">
      <div className="chat-messages flex-1 overflow-y-auto space-y-4">
        {renderMessages()}
        {isThinking && (
          <div className="chat-thinking text-center text-gray-500">
            Pensando...
          </div>
        )}
      </div>
      <div className="chat-input mt-4">
        <ChatInput
          onSend={(content) => {
            setMessages((prev) => [
              ...prev,
              { role: "user", content },
            ]);
            setIsThinking(true);
            // Simular respuesta de la IA
            setTimeout(() => {
              setMessages((prev) => [
                ...prev,
                { role: "system", content: "Esta es una respuesta de ejemplo." },
              ]);
              setIsThinking(false);
            }, 1000);
          }}
          placeholder="Escribe tu mensaje aquí..."
        />
      </div>
    </div>
  );
}
