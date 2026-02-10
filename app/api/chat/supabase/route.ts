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

// Sistema inteligente de respuestas sin OpenAI
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
      response: `¡Perfecto! Vamos a iniciar el protocolo "Primeros 7 días" 🎯\n\nEste protocolo te ayudará a construir tu proyecto paso a paso, con ejercicios diarios de 1-5 minutos.\n\n**¿Cuál es el nombre de tu proyecto?**\n\nEscríbelo aquí y comenzamos con el Día 1.`,
      shouldAdvanceProtocol: false,
      memoryUpdate: {
        interested_in_protocol: true,
        protocol_interest_date: new Date().toISOString()
      }
    };
  }

  // Detectar bloqueo creativo
  const blockageDetection = detectBlockage(message);
  
  let exerciseResponse: ExerciseResponse;
  
  if (blockageDetection.confidence > 0.5) {
    // Bloqueo detectado con confianza
    switch (blockageDetection.type) {
      case 'inicio':
        exerciseResponse = generateInicioResponse();
        break;
      case 'direccion':
        exerciseResponse = generateDireccionResponse();
        break;
      case 'motivacion':
        exerciseResponse = generateMotivacionResponse();
        break;
      default:
        exerciseResponse = generateInicioResponse();
    }
    
    return {
      response: `${exerciseResponse.message}\n\n${exerciseResponse.exercise}`,
      shouldAdvanceProtocol: false,
      memoryUpdate: exerciseResponse.memoryUpdate
    };
  }

  // Respuestas a preguntas comunes
  if (lowerMessage.includes('logo') || lowerMessage.includes('marca')) {
    return {
      response: `¡Un logo! Eso es emocionante �\n\nEl diseño de identidad visual es un proceso creativo muy poderoso.\n\n**Mi recomendación:** Iniciemos el protocolo "Primeros 7 días" específicamente para tu logo.\n\nPodemos:\n- Definir el propósito de tu marca (Día 1)\n- Explorar ideas visuales (Día 2-3)\n- Definir colores y estilo (Día 4-5)\n- Crear variantes (Día 6)\n- Seleccionar la final (Día 7)\n\n¿Quieres empezar con el protocolo para tu logo?`,
      memoryUpdate: {
        project_type: 'logo',
        last_interest: 'branding'
      }
    };
  }

  if (lowerMessage.includes('ideas') || lowerMessage.includes('inspiración')) {
    return {
      response: `¡Necesitas ideas! Me encanta 💡\n\nLa inspiración viene del movimiento, no de esperarla.\n\n**Ejercicio rápido de 2 minutos:**\n1. Piensa en 3 palabras que describan tu proyecto\n2. Para cada palabra, anota 2 imágenes que te vengan a la mente\n3. Elige la imagen que más te motive\n\n¿Qué proyecto necesitas ideas? ¿Cuál es tu tema principal?`,
      memoryUpdate: {
        last_request_type: 'ideas',
        request_date: new Date().toISOString()
      }
    };
  }

  if (lowerMessage.includes('ayuda') || lowerMessage.includes('qué hago')) {
    return {
      response: `Estoy aquí para ayudarte paso a paso 🌟\n\nPuedo ayudarte con:\n\n**1. Detectar tu bloqueo creativo**\n   - Dime: ¿qué te está bloqueando hoy?\n\n**2. Iniciar un protocolo de 7 días**\n   - Para construir tu proyecto paso a paso\n\n**3. Ejercicios rápidos**\n   - De 1-5 minutos para desbloquear\n\n¿Por dónde quieres empezar?`,
      memoryUpdate: {
        needs_guidance: true,
        last_interaction: new Date().toISOString()
      }
    };
  }

  // Respuesta por defecto empática y motivadora
  const mode = context.profile?.creative_mode === 'direct' ? 'directo' : 'calm';
  
  return {
    response: `Gracias por compartir eso conmigo 🌟\n\nCada paso que das es progreso real.\n\nBasado en tu perfil ${mode}, te sugiero:\n\n- Tomarte 1 minuto para respirar profundamente\n- Escribir 3 ideas rápidas sin juzgar\n- Elegir la que más energía te dé\n\n¿Quieres que exploremos alguna de estas ideas o prefieres que detecte tu bloqueo actual?`,
    memoryUpdate: {
      last_interaction: new Date().toISOString(),
      interaction_type: 'general'
    }
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
