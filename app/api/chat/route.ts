import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
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
