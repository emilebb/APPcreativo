import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  trending?: boolean;
  recent?: boolean;
}

// Base de datos de ejemplo - en producción esto vendría de una base de datos real
const searchDatabase: SearchResult[] = [
  {
    id: "1",
    title: "Técnicas de brainstorming visual",
    description: "Métodos creativos para generar ideas usando diagramas y mapas mentales. Incluye mind mapping, diagramas de flujo y técnicas de pensamiento visual.",
    category: "técnicas",
    tags: ["brainstorming", "visual", "ideas", "diagramas"],
    trending: true
  },
  {
    id: "2", 
    title: "Superar el bloqueo creativo",
    description: "Estrategias probadas para vencer la página en blanco y encontrar inspiración cuando te sientes atascado.",
    category: "bloqueo",
    tags: ["bloqueo", "creatividad", "inspiración", "motivación"],
    recent: true
  },
  {
    id: "3",
    title: "Teoría del color para diseñadores",
    description: "Fundamentos de teoría del color y cómo aplicarla en proyectos creativos. Psicología del color y armonías cromáticas.",
    category: "diseño",
    tags: ["color", "diseño", "teoría", "psicología"]
  },
  {
    id: "4",
    title: "Writing prompts para creativos",
    description: "Prompts y ejercicios para estimular la escritura creativa y la imaginación. Más de 100 ideas para empezar.",
    category: "escritura",
    tags: ["writing", "prompts", "creatividad", "ejercicios"],
    trending: true
  },
  {
    id: "5",
    title: "Método SCAMPER para innovar",
    description: "Técnica estructurada para generar ideas innovadoras mediante preguntas guía: Sustituir, Combinar, Adaptar, Modificar, Proponer otros usos, Eliminar y Reordenar.",
    category: "técnicas",
    tags: ["scamper", "innovación", "ideas", "método"]
  },
  {
    id: "6",
    title: "Rutinas matutinas creativas",
    description: "Establece hábitos que potencien tu creatividad desde la primera hora del día. Ejercicios y prácticas para empezar con inspiración.",
    category: "hábitos",
    tags: ["rutinas", "mañana", "hábitos", "creatividad"],
    recent: true
  },
  {
    id: "7",
    title: "Sketchnoting y apuntes visuales",
    description: "Aprende a tomar apuntes de forma visual para mejorar el aprendizaje y la retención de información creativa.",
    category: "técnicas",
    tags: ["sketchnoting", "visual", "apuntes", "aprendizaje"]
  },
  {
    id: "8",
    title: "Creatividad con limitaciones",
    description: "Cómo las restricciones pueden potenciar tu creatividad en lugar de limitarla. Técnicas para trabajar con recursos limitados.",
    category: "bloqueo",
    tags: ["limitaciones", "creatividad", "recursos", "restricciones"]
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';
    const category = searchParams.get('category') || 'all';

    // Si no hay consulta, devolver resultados vacíos
    if (!query.trim()) {
      return NextResponse.json({ results: [] });
    }

    // Filtrar resultados
    let filtered = searchDatabase.filter(result =>
      result.title.toLowerCase().includes(query) ||
      result.description.toLowerCase().includes(query) ||
      result.tags.some(tag => tag.toLowerCase().includes(query))
    );

    // Filtrar por categoría si no es "all"
    if (category !== 'all') {
      filtered = filtered.filter(result => result.category === category);
    }

    // Ordenar resultados (trending y recent primero)
    filtered.sort((a, b) => {
      if (a.trending && !b.trending) return -1;
      if (!a.trending && b.trending) return 1;
      if (a.recent && !b.recent) return -1;
      if (!a.recent && b.recent) return 1;
      return 0;
    });

    return NextResponse.json({ 
      results: filtered,
      total: filtered.length,
      query,
      category
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Error en la búsqueda' },
      { status: 500 }
    );
  }
}
