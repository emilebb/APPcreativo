import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No se proporcionó imagen' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback sin API key
      return NextResponse.json({
        description: 'Imagen subida correctamente. Análisis básico disponible.',
        colors: ['#6366f1', '#8b5cf6', '#ec4899'],
        style: 'Creativo',
        mood: 'Inspirador',
        suggestions: [
          'Considera agregar más elementos visuales',
          'Prueba diferentes composiciones',
          'Experimenta con contrastes de color',
          'Agrega texto descriptivo',
          'Crea variaciones del concepto'
        ],
        elements: ['Imagen', 'Contenido visual', 'Composición']
      });
    }

    // Llamar a OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Eres un experto en análisis visual y diseño creativo. 
Analiza imágenes y proporciona insights detallados en formato JSON con:
- description: descripción detallada de la imagen
- colors: array de 5 colores dominantes en formato hex
- style: estilo visual (minimalista, moderno, vintage, etc)
- mood: estado de ánimo que transmite
- suggestions: array de 5 sugerencias creativas específicas
- elements: array de elementos visuales principales

Responde SOLO con JSON válido, sin texto adicional.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analiza esta imagen en detalle y proporciona insights creativos.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Error en OpenAI API');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No se recibió respuesta de la IA');
    }

    // Parsear JSON de la respuesta
    const analysis = JSON.parse(content);

    return NextResponse.json(analysis);

  } catch (error) {
    console.error('Error analyzing image:', error);
    
    // Fallback en caso de error
    return NextResponse.json({
      description: 'Imagen analizada. Análisis básico disponible.',
      colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
      style: 'Creativo',
      mood: 'Inspirador',
      suggestions: [
        'Considera agregar más elementos visuales',
        'Prueba diferentes composiciones',
        'Experimenta con contrastes de color',
        'Agrega texto descriptivo',
        'Crea variaciones del concepto'
      ],
      elements: ['Imagen', 'Contenido visual', 'Composición']
    });
  }
}
