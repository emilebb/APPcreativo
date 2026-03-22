import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Si no hay API key, devolver respuesta de demostración
    if (!openai) {
      const demoResponses = [
        '💡 **Análisis**\n\nVeo que estás buscando inspiración creativa. Es completamente normal tener momentos donde las ideas no fluyen como quisieras.\n\n🎯 **Recomendaciones**\n1. Toma un descanso de 10 minutos y cambia de ambiente\n2. Haz un brainstorming rápido sin juzgar las ideas\n3. Mira referencias de proyectos similares para inspirarte\n\n✨ **Próximo Paso**\nEscribe 3 palabras que describan lo que quieres crear. No pienses demasiado, solo escribe lo primero que venga a tu mente.',
        '💡 **Análisis**\n\nEntiendo tu situación. Los bloqueos creativos son parte del proceso, pero podemos superarlos juntos.\n\n🎯 **Recomendaciones**\n1. Define claramente qué quieres lograr (objetivo específico)\n2. Divide el proyecto en tareas pequeñas y manejables\n3. Empieza por la parte que más te emociona\n\n✨ **Próximo Paso**\nElige UNA tarea pequeña que puedas completar en los próximos 15 minutos y hazla ahora mismo.',
        '💡 **Análisis**\n\n¡Excelente pregunta! La creatividad se nutre de la curiosidad y la experimentación.\n\n🎯 **Recomendaciones**\n1. Explora referencias fuera de tu área habitual\n2. Combina dos ideas aparentemente no relacionadas\n3. Pregúntate "¿Y si...?" para abrir posibilidades\n\n✨ **Próximo Paso**\nBusca 3 ejemplos de proyectos que admires y anota qué te gusta de cada uno.'
      ];
      
      const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
      
      return NextResponse.json({ 
        message: randomResponse + '\n\n_Nota: Esta es una respuesta de demostración. Configura OPENAI_API_KEY para respuestas personalizadas con IA._'
      });
    }

    const systemPrompt = `Eres un Coach Creativo con IA llamado CreativoX AI. Tu misión es ayudar a personas creativas a:

1. Superar bloqueos creativos
2. Generar ideas innovadoras
3. Estructurar proyectos
4. Dar feedback constructivo
5. Motivar y dar claridad

ESTILO DE RESPUESTA:
- Empático y motivador
- Directo y práctico
- Usa ejemplos concretos
- Estructura tus respuestas con secciones claras
- Incluye emojis ocasionalmente para dar calidez
- Haz preguntas que ayuden a profundizar

FORMATO:
Cuando des consejos, estructura así:

💡 **Análisis**
[Tu análisis de la situación]

🎯 **Recomendaciones**
1. [Acción específica]
2. [Acción específica]
3. [Acción específica]

✨ **Próximo Paso**
[Una acción inmediata que pueden hacer ahora mismo]

Sé conciso pero completo. Máximo 300 palabras por respuesta.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.8,
      max_tokens: 800,
    });

    const assistantMessage = completion.choices[0]?.message?.content || 
      'Lo siento, no pude generar una respuesta. Por favor, intenta de nuevo.';

    return NextResponse.json({ message: assistantMessage });

  } catch (error: any) {
    console.error('Error in chat API:', error);
    
    if (error?.error?.type === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'API quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
