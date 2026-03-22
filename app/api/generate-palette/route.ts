import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { concept } = await request.json();

    if (!concept) {
      return NextResponse.json(
        { error: 'Concept is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        palette: generateFallbackPalette(concept)
      });
    }

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
            content: 'Eres un experto en teoría del color y diseño. Genera paletas de colores armoniosas y profesionales en formato hexadecimal.'
          },
          {
            role: 'user',
            content: `Genera una paleta de 5 colores hexadecimales para el concepto: "${concept}". Responde SOLO con un JSON en este formato exacto: {"name": "nombre de la paleta", "colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"], "mood": "descripción del mood", "usage": "sugerencia de uso"}`
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    try {
      const palette = JSON.parse(content);
      return NextResponse.json({ palette });
    } catch {
      return NextResponse.json({
        palette: generateFallbackPalette(concept)
      });
    }

  } catch (error) {
    console.error('Error generating palette:', error);
    const { concept } = await request.json();
    return NextResponse.json({
      palette: generateFallbackPalette(concept)
    });
  }
}

function generateFallbackPalette(concept: string) {
  const palettes: Record<string, any> = {
    ocean: {
      name: 'Océano Profundo',
      colors: ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087'],
      mood: 'Tranquilo y profundo',
      usage: 'Ideal para diseños relacionados con agua, calma y profesionalismo'
    },
    sunset: {
      name: 'Atardecer Cálido',
      colors: ['#ff6b6b', '#ee5a6f', '#c44569', '#774c60', '#2d132c'],
      mood: 'Cálido y energético',
      usage: 'Perfecto para diseños vibrantes y emotivos'
    },
    forest: {
      name: 'Bosque Natural',
      colors: ['#1a535c', '#4ecdc4', '#f7fff7', '#ff6b6b', '#ffe66d'],
      mood: 'Natural y fresco',
      usage: 'Excelente para diseños ecológicos y naturales'
    },
    modern: {
      name: 'Moderno Minimalista',
      colors: ['#2d3748', '#4a5568', '#718096', '#cbd5e0', '#f7fafc'],
      mood: 'Limpio y profesional',
      usage: 'Ideal para diseños corporativos y minimalistas'
    },
    vibrant: {
      name: 'Vibrante Creativo',
      colors: ['#f72585', '#7209b7', '#3a0ca3', '#4361ee', '#4cc9f0'],
      mood: 'Energético y creativo',
      usage: 'Perfecto para proyectos artísticos y llamativos'
    }
  };

  // Buscar paleta relacionada o usar moderna por defecto
  const conceptLower = concept.toLowerCase();
  for (const [key, palette] of Object.entries(palettes)) {
    if (conceptLower.includes(key)) {
      return palette;
    }
  }

  return palettes.modern;
}
