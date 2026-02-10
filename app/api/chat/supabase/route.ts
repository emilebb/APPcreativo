import { NextRequest, NextResponse } from 'next/server';

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

// Simulación de respuestas del coach (en producción, aquí iría la llamada a una IA real)
function generateCoachResponse(request: ChatRequest): ChatResponse {
  const { message, systemPrompt, context } = request;

  // Si está en un protocolo activo
  if (context.isInProtocol && context.activeProtocol?.protocol_id === 'primeros_7_dias') {
    const day = context.currentProtocolDay;
    
    // Lógica específica para cada día del protocolo
    switch (day) {
      case 1:
        if (message.toLowerCase().includes('propósito') || message.toLowerCase().includes('objetivo')) {
          return {
            response: `¡Perfecto! 🎯\n\nHas definido claramente el propósito de tu proyecto. Eso es fundamental.\n\n**Para mañana (Día 2):** Tu tarea será esbozar 3 ideas rápidas en 2 minutos.\n\nNo tienen que ser perfectas, solo rápidas. ¿Listo para guardar esto y continuar mañana?`,
            shouldAdvanceProtocol: true,
            memoryUpdate: {
              last_completed_step: 1,
              project_purpose: message
            }
          };
        }
        break;
        
      case 2:
        if (message.toLowerCase().includes('ideas') || message.toLowerCase().includes('esbozo')) {
          return {
            response: `¡Excelente trabajo creativo! 💡\n\nTienes 3 ideas iniciales. Eso es perfecto para empezar.\n\n**Para mañana (Día 3):** Vamos a definir una paleta mínima de colores.\n\nPiensa: ¿Qué 3-5 colores representan mejor tu proyecto? Mañana los definimos.`,
            shouldAdvanceProtocol: true,
            memoryUpdate: {
              last_completed_step: 2,
              initial_ideas: message
            }
          };
        }
        break;
        
      case 3:
        if (message.toLowerCase().includes('color') || message.toLowerCase().includes('paleta')) {
          return {
            response: `¡Buena elección de colores! 🎨\n\nUna paleta definida le da personalidad a tu proyecto.\n\n**Para mañana (Día 4):** Define el estilo visual.\n\n¿Será minimalista, ilustrativo, tipográfico, fotográfico? Mañana lo decidimos.`,
            shouldAdvanceProtocol: true,
            memoryUpdate: {
              last_completed_step: 3,
              color_palette: message
            }
          };
        }
        break;
        
      default:
        return {
          response: `¡Gran progreso! 🌟\n\nTu respuesta demuestra compromiso con el proceso.\n\n**Para mañana:** Continuamos con el siguiente paso del protocolo.\n\n¿Hay algo específico de hoy que quieras que recordemos?`
        };
    }
  }

  // Chat libre - detección de bloqueos
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('bloqueo') || lowerMessage.includes('atascado') || lowerMessage.includes('no sé')) {
    return {
      response: `Entiendo perfectamente ese bloqueo 🧱\n\nEs normal sentirse así. La buena noticia es que tenemos herramientas específicas para esto.\n\nBasado en lo que sé de ti, te sugiero:\n\n**Opción 1:** Iniciar el protocolo "Primeros 7 días" (ejercicios diarios de 1-5 min)\n**Opción 2:** Un ejercicio rápido de 2 minutos para desbloquear ahora\n**Opción 3:** Hablar más específicamente sobre qué te bloquea\n\n¿Cuál prefieres?`,
      memoryUpdate: {
        last_blockage_type: 'general',
        blockage_date: new Date().toISOString()
      }
    };
  }

  if (lowerMessage.includes('logo') || lowerMessage.includes('marca')) {
    return {
      response: `¡Un logo! Eso es emocionante 🎯\n\nEl diseño de identidad visual es un proceso creativo muy poderoso.\n\n**Mi recomendación:** Iniciemos el protocolo "Primeros 7 días" específicamente para tu logo.\n\nPodemos:\n- Definir el propósito de tu marca (Día 1)\n- Explorar ideas visuales (Día 2-3)\n- Definir colores y estilo (Día 4-5)\n- Crear variantes (Día 6)\n- Seleccionar la final (Día 7)\n\n¿Quieres empezar con el protocolo para tu logo?`,
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

  // Respuesta por defecto
  return {
    response: `Gracias por compartir eso conmigo 🌟\n\nCada paso que das es progreso real.\n\nBasado en tu perfil ${context.profile?.creative_mode === 'direct' ? 'directo' : 'calm'}, te sugiero:\n\n- Tomarte 1 minuto para respirar profundamente\n- Escribir 3 ideas rápidas sin juzgar\n- Elegir la que más energía te dé\n\n¿Quieres que exploremos alguna de estas ideas o prefieres otro enfoque?`,
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
    const response = generateCoachResponse(body);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error en chat API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
