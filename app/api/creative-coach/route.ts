import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, projectContext } = await request.json();

    // Aquí integrarías con tu servicio de IA (OpenAI, Claude, etc.)
    // Por ahora, una respuesta simulada
    let response = '';

    // Lógica simple basada en el mensaje
    if (message.toLowerCase().includes('idea') || message.toLowerCase().includes('inspiración')) {
      response = `💡 **Ideas Creativas para tu proyecto**

Basado en tu contexto, te sugiero:

1. **Explora nuevos ángulos**: Intenta ver tu proyecto desde una perspectiva diferente
2. **Combina elementos inesperados**: Mezcla conceptos que normalmente no relacionarías
3. **Busca inspiración en la naturaleza**: Los patrones naturales son fuente de infinita creatividad
4. **Colabora con otros**: Dos mentes creativas pueden generar magia

¿Sobre qué aspecto específico te gustaría profundizar?`;
    } else if (message.toLowerCase().includes('bloqueo') || message.toLowerCase().includes('atascado')) {
      response = `🎯 **Superando el Bloqueo Creativo**

Entiendo perfectamente esa sensación. Aquí tienes algunas estrategias probadas:

• **Cambía de entorno**: A veces un nuevo espacio desbloquea nuevas ideas
• **Haz un ejercicio de libre escritura**: Escribe sin parar durante 10 minutos
• **Camina y observa**: El movimiento físico estimula el pensamiento creativo
• **Establece micro-objetivos**: Divide el gran problema en piezas manejables

¿Cuál de estas estrategias te gustaría intentar primero?`;
    } else if (message.toLowerCase().includes('proyecto') || message.toLowerCase().includes('trabajo')) {
      response = `🚀 **Optimizando tu Proyecto Actual**

Analizando tu proyecto actual, te recomiendo:

• **Define tu objetivo principal**: ¿Qué quieres lograr con este proyecto?
• **Identifica tu audiencia**: ¿Para quién estás creando?
• **Establece hitos claros**: Divide el proyecto en fases concretas
• **Busca feedback temprano**: Comparte tu trabajo con otros
• **Itera y mejora**: No tengas miedo de cambiar dirección

¿Hay algún aspecto específico de tu proyecto que te gustaría discutir?`;
    } else {
      response = `🎨 **Estoy aquí para ayudarte**

Entiendo tu mensaje: "${message}"

Como tu Creative Coach, puedo ayudarte con:
• 💡 Generación de ideas y conceptos
• 🎯 Superación de bloqueos creativos  
• 📊 Optimización de proyectos
• 🚀 Estrategias de desarrollo
• 🎭 Técnicas de brainstorming

¿En qué área específica te gustaría que nos enfoquemos? Cuéntame más sobre tu proyecto o desafío actual.`;
    }

    return NextResponse.json({ reply: response });
  } catch (error) {
    console.error('Error in creative-coach API:', error);
    return NextResponse.json(
      { error: 'Error processing request' }, 
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
