import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, projectContext, conversationHistory } = await req.json()

    // Aquí integrarías con tu servicio de IA (OpenAI, Claude, etc.)
    // Por ahora, una respuesta simulada
    let response = ''

    // Lógica simple basada en el mensaje
    if (message.toLowerCase().includes('idea') || message.toLowerCase().includes('inspiración')) {
      response = `💡 **Ideas Creativas para tu ${projectContext?.type || 'proyecto'}**

Basado en tu contexto, te sugiero:

1. **Explora nuevos ángulos**: Intenta ver tu proyecto desde una perspectiva diferente
2. **Combina elementos inesperados**: Mezcla conceptos que normalmente no relacionarías
3. **Busca inspiración en la naturaleza**: Los patrones naturales son fuente de infinita creatividad
4. **Colabora con otros**: Dos mentes creativas pueden generar magia

¿Sobre qué aspecto específico te gustaría profundizar?`
    } else if (message.toLowerCase().includes('bloqueo') || message.toLowerCase().includes('atascado')) {
      response = `🎯 **Superando el Bloqueo Creativo**

Entiendo perfectamente esa sensación. Aquí tienes algunas estrategias probadas:

• **Cambía de entorno**: A veces un nuevo espacio desbloquea nuevas ideas
• **Haz un ejercicio de libre escritura**: Escribe sin parar durante 10 minutos
• **Camina y observa**: El movimiento físico estimula el pensamiento creativo
• **Establece micro-objetivos**: Divide el gran problema en piezas manejables
• **Revisa proyectos anteriores**: A veces la solución está en tu trabajo previo

¿Cuál de estas estrategias te gustaría intentar primero?`
    } else if (message.toLowerCase().includes('proyecto') || message.toLowerCase().includes('trabajo')) {
      response = `🚀 **Optimizando tu Proyecto Actual**

Analizando tu ${projectContext?.type || 'proyecto'}, te recomiendo:

• **Define tu objetivo principal**: ¿Qué quieres lograr con este proyecto?
• **Identifica tu audiencia**: ¿Para quién estás creando?
• **Establece hitos claros**: Divide el proyecto en fases concretas
• **Busca feedback temprano**: Comparte tu trabajo con otros
• **Itera y mejora**: No tengas miedo de cambiar dirección

¿Hay algún aspecto específico de tu proyecto que te gustaría discutir?`
    } else {
      response = `🎨 **Estoy aquí para ayudarte**

Entiendo tu mensaje: "${message}"

Como tu Creative Coach, puedo ayudarte con:
• 💡 Generación de ideas y conceptos
• 🎯 Superación de bloqueos creativos  
• 📊 Optimización de proyectos
• 🚀 Estrategias de desarrollo
• 🎭 Técnicas de brainstorming

¿En qué área específica te gustaría que nos enfoquemos? Cuéntame más sobre tu proyecto o desafío actual.`
    }

    return new Response(
      JSON.stringify({ response }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
