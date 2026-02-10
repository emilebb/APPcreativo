import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

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

// Generar respuesta real con OpenAI
async function generateCoachResponse(request: ChatRequest): Promise<ChatResponse> {
  const { message, systemPrompt, context } = request;

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

    // Llamar a OpenAI
    const completion = await openai.chat.completions.create({
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
    
    // Fallback a respuesta básica si OpenAI falla
    return {
      response: `Entiendo lo que compartes 🌟\n\nCada paso que das es progreso real.\n\nBasado en tu perfil ${context.profile?.creative_mode === 'direct' ? 'directo' : 'calm'}, te sugiero:\n\n- Tomarte 1 minuto para respirar profundamente\n- Escribir 3 ideas rápidas sin juzgar\n- Elegir la que más energía te dé\n\n¿Quieres que exploremos alguna de estas ideas?`,
      memoryUpdate: {
        last_interaction: new Date().toISOString(),
        interaction_type: 'fallback'
      }
    };
  }
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
