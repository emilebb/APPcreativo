import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, context } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Verificar si hay API key de OpenAI
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      // Fallback a ideas generadas localmente
      return NextResponse.json({
        ideas: generateFallbackIdeas(prompt, context)
      });
    }

    // Llamar a OpenAI para generar ideas
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Eres un asistente creativo experto en diseño y arte. Genera ideas innovadoras y prácticas para proyectos creativos. ${context ? `Contexto adicional: ${context}` : ''}`
          },
          {
            role: 'user',
            content: `Genera 5 ideas creativas únicas y específicas para: ${prompt}. Cada idea debe ser concisa (máximo 2 líneas) y práctica de implementar.`
          }
        ],
        temperature: 0.9,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    // Parsear las ideas del texto
    const ideas = content
      .split('\n')
      .filter((line: string) => line.trim().length > 0)
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
      .filter((idea: string) => idea.length > 10);

    return NextResponse.json({ ideas: ideas.slice(0, 5) });

  } catch (error) {
    console.error('Error generating ideas:', error);
    
    // Fallback en caso de error
    const { prompt, context } = await request.json();
    return NextResponse.json({
      ideas: generateFallbackIdeas(prompt, context)
    });
  }
}

function generateFallbackIdeas(prompt: string, context?: string): string[] {
  const templates = [
    `Crea ${prompt} con un enfoque minimalista y moderno`,
    `Diseña ${prompt} inspirándote en la naturaleza y formas orgánicas`,
    `Desarrolla ${prompt} con una paleta de colores vibrantes y energéticos`,
    `Interpreta ${prompt} usando geometría y patrones abstractos`,
    `Construye ${prompt} con un estilo retro-futurista único`,
    `Explora ${prompt} desde una perspectiva surrealista`,
    `Combina ${prompt} con elementos de diferentes culturas`,
    `Reimagina ${prompt} con texturas y capas visuales`,
    `Presenta ${prompt} con un diseño asimétrico y dinámico`,
    `Transforma ${prompt} usando solo formas básicas y colores primarios`
  ];

  // Seleccionar 5 ideas aleatorias
  const shuffled = templates.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}
