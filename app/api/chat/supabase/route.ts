import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import {
  detectBlockage,
  generateInicioResponse,
  generateDireccionResponse,
  generateMotivacionResponse,
  generateProtocolDayResponse,
  generateWelcomeMessage,
  type ExerciseResponse
} from '@/lib/creativeCoach';
import {
  analyzeUserMessage,
  generateCoachResponse as generateAdaptiveResponse,
  formatCoachMessage
} from '@/lib/adaptiveCoach';
import Brain from '@/lib/brainSystem';

interface ChatRequest {
  message: string;
  systemPrompt: string;
  context: {
    isInProtocol: boolean;
    currentProtocolDay: number;
    protocolProgress: number;
    profile?: any;
    activeProtocol?: any;
    memory?: any;
  };
}

interface ChatResponse {
  response: string;
  shouldAdvanceProtocol?: boolean;
  memoryUpdate?: Record<string, any>;
}

// Generar respuesta inteligente del coach
async function generateCoachResponse(request: ChatRequest): Promise<ChatResponse> {
  const { message, systemPrompt, context } = request;

  // Si no hay OpenAI configurado, usar sistema inteligente de detección
  if (!openai) {
    return generateIntelligentResponse(request);
  }

  try {
    // Construir mensajes para OpenAI
    const messages: any[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: message
      }
    ];

    // Llamar a OpenAI (ya verificamos que no es null arriba)
    const completion = await openai!.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages,
      temperature: 0.8,
      max_tokens: 500,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';

    // Analizar si debe avanzar el protocolo
    const shouldAdvanceProtocol = context.isInProtocol && (
      aiResponse.toLowerCase().includes('siguiente paso') ||
      aiResponse.toLowerCase().includes('día siguiente') ||
      aiResponse.toLowerCase().includes('continuar mañana') ||
      aiResponse.toLowerCase().includes('para mañana')
    );

    // Detectar tipo de bloqueo para memoria
    const lowerMessage = message.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();
    
    let memoryUpdate: Record<string, any> = {
      last_interaction: new Date().toISOString(),
      interaction_type: 'general'
    };

    // Detectar bloqueos específicos
    if (lowerMessage.includes('perfeccionismo') || lowerResponse.includes('perfeccionismo')) {
      memoryUpdate.last_blockage_type = 'perfectionism';
      memoryUpdate.blockage_date = new Date().toISOString();
    } else if (lowerMessage.includes('miedo') || lowerMessage.includes('temor')) {
      memoryUpdate.last_blockage_type = 'fear';
      memoryUpdate.blockage_date = new Date().toISOString();
    } else if (lowerMessage.includes('bloqueo') || lowerMessage.includes('atascado')) {
      memoryUpdate.last_blockage_type = 'general_block';
      memoryUpdate.blockage_date = new Date().toISOString();
    }

    // Detectar tipo de proyecto
    if (lowerMessage.includes('logo')) {
      memoryUpdate.project_type = 'logo';
    } else if (lowerMessage.includes('ilustración')) {
      memoryUpdate.project_type = 'illustration';
    } else if (lowerMessage.includes('diseño')) {
      memoryUpdate.project_type = 'design';
    }

    // Si está en protocolo, guardar respuesta del usuario
    if (context.isInProtocol && shouldAdvanceProtocol) {
      memoryUpdate.last_completed_step = context.currentProtocolDay;
      memoryUpdate[`day_${context.currentProtocolDay}_response`] = message;
    }

    return {
      response: aiResponse,
      shouldAdvanceProtocol,
      memoryUpdate
    };

  } catch (error) {
    console.error('Error calling OpenAI:', error);
    
    // Fallback a sistema inteligente si OpenAI falla
    return generateIntelligentResponse(request);
  }
}

// Sistema inteligente de respuestas sin OpenAI - ADAPTATIVO
function generateIntelligentResponse(request: ChatRequest): ChatResponse {
  const { message, context } = request;
  const lowerMessage = message.toLowerCase();

  // Si está en protocolo activo, continuar con el día correspondiente
  if (context.isInProtocol && context.activeProtocol?.protocol_id === 'primeros_7_dias') {
    const currentDay = context.currentProtocolDay;
    const exerciseResponse = generateProtocolDayResponse(currentDay, context.activeProtocol.project_title);
    
    return {
      response: `${exerciseResponse.message}\n\n${exerciseResponse.exercise}`,
      shouldAdvanceProtocol: exerciseResponse.shouldAdvanceProtocol,
      memoryUpdate: exerciseResponse.memoryUpdate
    };
  }

  // Detectar si quiere iniciar protocolo
  if (lowerMessage.includes('protocolo') || lowerMessage.includes('7 días') || lowerMessage.includes('empezar proyecto')) {
    return {
      response: `Protocolo de 7 días activado.\n\n💡 **Acción:** Escribe el nombre de tu proyecto en 1 frase.\n\n❓ ¿Cuál es?`,
      shouldAdvanceProtocol: false,
      memoryUpdate: {
        interested_in_protocol: true,
        protocol_interest_date: new Date().toISOString()
      }
    };
  }

  // BRAIN SYSTEM - Sistema modular de procesamiento
  const userMode = context.profile?.creative_mode === 'direct' ? 'directo' : 'calmado';
  const brain = new Brain(userMode);
  
  // Procesar mensaje con BrainSystem
  const brainResponse = brain.processMessage(message);
  
  // Formatear respuesta
  let formattedResponse = brainResponse.message;
  
  if (brainResponse.action) {
    formattedResponse += `\n\n💡 **Acción:** ${brainResponse.action}`;
  }
  
  formattedResponse += `\n\n❓ ${brainResponse.question}`;
  
  // Obtener contexto del brain
  const brainContext = brain.getContext();
  
  // Determinar memoryUpdate basado en BrainSystem
  const memoryUpdate: Record<string, any> = {
    last_interaction: new Date().toISOString(),
    last_intent: brainContext.currentIntent,
    last_blockage: brainContext.currentBlockage,
    last_action: brainContext.lastAction,
    momentum: brainContext.momentum
  };
  
  // Si detectó bloqueo, guardarlo
  if (brainContext.currentBlockage) {
    memoryUpdate.blockage_detected = brainContext.currentBlockage;
    memoryUpdate.blockage_date = new Date().toISOString();
  }
  
  return {
    response: formattedResponse,
    shouldAdvanceProtocol: false,
    memoryUpdate
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    
    if (!body.message || !body.systemPrompt) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Generar respuesta del coach
    const response = await generateCoachResponse(body);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error en chat API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
