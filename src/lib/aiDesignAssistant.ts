// Sistema de asistencia de diseño con IA
export interface DesignSuggestion {
  id: string;
  type: 'color' | 'layout' | 'typography' | 'composition' | 'idea';
  title: string;
  description: string;
  data: any;
  confidence: number;
}

export interface ColorPalette {
  name: string;
  colors: string[];
  mood: string;
  usage: string;
}

export interface LayoutSuggestion {
  name: string;
  description: string;
  grid: string;
  elements: Array<{
    type: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
  }>;
}

// Generar ideas creativas basadas en un prompt
export async function generateCreativeIdeas(prompt: string, context?: string): Promise<string[]> {
  try {
    const response = await fetch('/api/generate-ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, context })
    });

    if (!response.ok) {
      throw new Error('Error generating ideas');
    }

    const data = await response.json();
    return data.ideas || [];
  } catch (error) {
    console.error('Error generating ideas:', error);
    // Fallback a ideas predefinidas
    return [
      `Explora ${prompt} desde una perspectiva minimalista`,
      `Combina ${prompt} con elementos naturales`,
      `Crea una versión abstracta de ${prompt}`,
      `Diseña ${prompt} con un estilo retro-futurista`,
      `Interpreta ${prompt} usando solo formas geométricas`
    ];
  }
}

// Generar paleta de colores basada en un concepto
export async function generateColorPalette(concept: string): Promise<ColorPalette> {
  try {
    const response = await fetch('/api/generate-palette', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concept })
    });

    if (!response.ok) {
      throw new Error('Error generating palette');
    }

    const data = await response.json();
    return data.palette;
  } catch (error) {
    console.error('Error generating palette:', error);
    // Fallback a paletas predefinidas
    return {
      name: 'Paleta Creativa',
      colors: ['#2D3748', '#4A5568', '#718096', '#A0AEC0', '#CBD5E0'],
      mood: 'Profesional y moderna',
      usage: 'Ideal para diseños corporativos y minimalistas'
    };
  }
}

// Analizar imagen y sugerir mejoras
export async function analyzeDesign(imageData: string): Promise<DesignSuggestion[]> {
  try {
    const response = await fetch('/api/analyze-design', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageData })
    });

    if (!response.ok) {
      throw new Error('Error analyzing design');
    }

    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error('Error analyzing design:', error);
    return [];
  }
}

// Sugerir layouts basados en tipo de proyecto
export function suggestLayouts(projectType: 'canvas' | 'moodboard' | 'mindmap'): LayoutSuggestion[] {
  const layouts: Record<string, LayoutSuggestion[]> = {
    canvas: [
      {
        name: 'Composición en Z',
        description: 'Guía la vista del espectador en forma de Z',
        grid: '3x3',
        elements: [
          { type: 'focal', position: { x: 0, y: 0 }, size: { width: 33, height: 33 } },
          { type: 'secondary', position: { x: 66, y: 0 }, size: { width: 33, height: 33 } },
          { type: 'tertiary', position: { x: 33, y: 66 }, size: { width: 33, height: 33 } }
        ]
      },
      {
        name: 'Regla de Tercios',
        description: 'Divide el espacio en tercios para balance visual',
        grid: '3x3',
        elements: [
          { type: 'focal', position: { x: 33, y: 33 }, size: { width: 33, height: 33 } }
        ]
      },
      {
        name: 'Simetría Central',
        description: 'Elemento principal centrado con balance simétrico',
        grid: '1x1',
        elements: [
          { type: 'focal', position: { x: 25, y: 25 }, size: { width: 50, height: 50 } }
        ]
      }
    ],
    moodboard: [
      {
        name: 'Grid Masonry',
        description: 'Diseño de mosaico dinámico',
        grid: 'masonry',
        elements: []
      },
      {
        name: 'Collage Libre',
        description: 'Disposición orgánica y creativa',
        grid: 'free',
        elements: []
      }
    ],
    mindmap: [
      {
        name: 'Radial',
        description: 'Idea central con ramificaciones',
        grid: 'radial',
        elements: []
      },
      {
        name: 'Jerárquico',
        description: 'Estructura de árbol vertical',
        grid: 'tree',
        elements: []
      }
    ]
  };

  return layouts[projectType] || [];
}

// Generar sugerencias de tipografía
export function suggestTypography(mood: string): Array<{ font: string; usage: string }> {
  const moods: Record<string, Array<{ font: string; usage: string }>> = {
    modern: [
      { font: 'Inter', usage: 'Títulos y cuerpo' },
      { font: 'Poppins', usage: 'Títulos destacados' },
      { font: 'Roboto', usage: 'Texto general' }
    ],
    elegant: [
      { font: 'Playfair Display', usage: 'Títulos principales' },
      { font: 'Cormorant', usage: 'Subtítulos' },
      { font: 'Lora', usage: 'Cuerpo de texto' }
    ],
    playful: [
      { font: 'Fredoka', usage: 'Títulos divertidos' },
      { font: 'Quicksand', usage: 'Texto general' },
      { font: 'Comfortaa', usage: 'Elementos destacados' }
    ],
    professional: [
      { font: 'Montserrat', usage: 'Títulos corporativos' },
      { font: 'Open Sans', usage: 'Cuerpo de texto' },
      { font: 'Source Sans Pro', usage: 'Texto secundario' }
    ]
  };

  return moods[mood.toLowerCase()] || moods.modern;
}
