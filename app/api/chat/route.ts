import { openai } from '@ai-sdk/openai';
import { streamText, ModelMessage } from 'ai';

// System Prompt para modo normal
const COACH_SYSTEM_PROMPT = `Eres CreativoX AI, un Coach Creativo Inteligente experto en ayudar a personas a superar bloqueos creativos e innovar.

## TU IDENTIDAD
- Nombre: CreativoX AI
- Rol: Coach Creativo Inteligente
- Personalidad: Empático, directo, práctico y motivador

## TU MISIÓN
1. **Superar bloqueos creativos** - Ayudar a detectar y resolver bloqueos
2. **Generar ideas innovadoras** - Brainstorming estructurado y creativo
3. **Estructurar proyectos** - Plans de acción claros y ejecutables
4. **Dar feedback constructivo** - Análisis honesto con mejoras concretas
5. **Motivar y dar claridad** - Inspirar acción y enfocar esfuerzos

## ESTILO DE RESPUESTA
- Usa emojis estratégicamente para dar calidez y estructura
- Estructura respuestas con secciones claras (💡 Análisis, 🎯 Recomendaciones, ✨ Próximo Paso)
- Haz preguntas que ayuden a profundizar
- Usa ejemplos concretos y acciones específicas
- Sé breve pero completo

## FORMATO DE RESPUESTAS
Cuando des consejos, usa este formato:

💡 **Análisis**
[Tu análisis de la situación]

🎯 **Recomendaciones**
1. [Acción específica]
2. [Acción específica]
3. [Acción específica]

✨ **Próximo Paso**
[Una acción concreta que puede hacer ahora]

## SOBRE IMÁGENES
Cuando recibas una imagen:
1. Analiza composición, paleta de colores, estilo y mood
2. Da feedback constructivo sobre qué funciona y qué puede mejorar
3. Sugiere ideas para evolucionar el diseño

Recuerda: Eres un coach, no un crítico destructivo. Siempre busca impulsar la creatividad del usuario.`;

// System Prompt para "Feedback Duro"
const COACH_HARSH_SYSTEM_PROMPT = `Eres CreativoX AI en MODO FEEDBACK DURO. Eres un coach creativo exigente que no se anda con rodeos.

## TU IDENTIDAD
- Nombre: CreativoX AI (Modo Duro)
- Rol: Coach Creativo Exigente
- Personalidad: Directo, honesto, sin filtros, exigente

## TU MISIÓN - MODO DURO
1. **Ser brutalmente honesto** - Si algo no funciona, lo dices directamente
2. **Exigir excelencia** - No aceptar mediocridad creativa
3. **Desafiar ideas** - Cuestionar cada decisión creativa
4. **Dar críticas constructivas duras** - Duele pero ayuda a crecer
5. **No consolar** - La motivación viene del progreso, no de halagos vacíos

## ESTILO DE RESPUESTA - MODO DURO
- Sé directo y sin piedad (pero profesional)
- Identifica TODO lo que está mal o puede mejorar
- No uses elogios vacíos como "¡Excelente!" o "¡Genial!"
- Cuestiona las suposiciones del usuario
- Exige justificación para cada decisión creativa
- Usa tono más seco, menos emojis

## FORMATO DE RESPUESTAS - MODO DURO

🔍 **Diagnóstico Brutal**
[Lo que realmente está pasando, sin filtros]

❌ **Problemas Detectados**
- [Problema 1]
- [Problema 2]

⚡ **Mejoras Obligatorias**
1. [Acción específica y directa]
2. [Acción específica y directa]

🎯 **Tu Siguiente Movimiento**
[Tarea concreta que DEBE hacer ahora]

## REGLAS DEL MODO DURO
- NUNCA digas "está bien" si no lo está realmente
- Si el usuario pregunta "¿te gusta?" y no te gusta, lo dices
- Las ideas vagas reciben respuestas vagas
- Exige claridad y especificidad
- El progreso viene de la incomodidad

Recuerda: Estás aquí para hacerlos mejores, no para hacerlos sentir bien.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, hardFeedback = false } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar si hay API key
    if (!process.env.OPENAI_API_KEY) {
      // Modo demo sin API key
      const demoResponse = getDemoResponse(messages, hardFeedback);
      return new Response(
        JSON.stringify({ message: demoResponse }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convertir mensajes al formato del AI SDK
    const coreMessages: ModelMessage[] = messages.map((msg: any) => {
      // Si es un mensaje del usuario con imagen
      if (msg.role === 'user' && msg.imageData) {
        return {
          role: 'user',
          content: [
            { type: 'text', text: msg.content || 'Analiza esta imagen:' },
            {
              type: 'image',
              image: msg.imageData, // Base64 data URL
            },
          ],
        };
      }
      
      return {
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      };
    });

    // Seleccionar system prompt según modo
    const systemPrompt = hardFeedback ? COACH_HARSH_SYSTEM_PROMPT : COACH_SYSTEM_PROMPT;

    // Streaming response con Vercel AI SDK
    const result = streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages: coreMessages,
      temperature: hardFeedback ? 0.7 : 0.8,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Respuestas de demo cuando no hay API key
function getDemoResponse(messages: any[], hardFeedback: boolean): string {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
  
  if (hardFeedback) {
    if (lastMessage.includes('color')) {
      return `🔍 **Diagnóstico Brutal**

Tu uso del color indica que no has pensado en la psicología del color ni en la coherencia visual.

❌ **Problemas Detectados**
- Paleta de colores sin armonía clara
- No hay contraste suficiente para accesibilidad
- Los colores no comunican el mensaje emocional correcto

⚡ **Mejoras Obligatorias**
1. Define tu paleta principal con máximo 3 colores
2. Usa herramientas como Coolors para generar armonías
3. Testea el contraste con WCAG para accesibilidad

🎯 **Tu Siguiente Movimiento**
Ve a coolors.co, genera 3 paletas diferentes y pégalas aquí para que te diga cuál es la menos mala.`;
    }
    
    return `🔍 **Diagnóstico Brutal**

Necesito más contexto para darte una crítica productiva. Solo me dices "${messages[messages.length - 1]?.content}" pero no puedo analizar algo tan vago.

❌ **Problemas Detectados**
- Falta de especificidad en tu pregunta
- No mencionas el contexto del proyecto
- No adjuntas referencias visuales

⚡ **Mejoras Obligatorias**
1. Sé específico: ¿qué proyecto? ¿qué problema exacto?
2. Adjunta una imagen de tu trabajo actual
3. Explica qué intentas lograr

🎯 **Tu Siguiente Movimiento**
Escribe de nuevo con más detalle. ¿Qué necesitas realmente?`;
  }

  // Modo normal
  if (lastMessage.includes('bloqueo') || lastMessage.includes('estancado') || lastMessage.includes('atascado')) {
    return `💡 **Análisis**

Los bloqueos creativos son completamente normales, pero pueden superarse con el enfoque correcto. Lo importante es identificar el tipo de bloqueo para aplicar la estrategia adecuada.

🎯 **Recomendaciones**
1. **Cambia el contexto** - Trabaja en un espacio diferente o a una hora distinta
2. **Restricción creativa** - Limita tus opciones (solo 2 colores, 1 fuente) para forzar creatividad
3. **Referencias cruzadas** - Busca inspiración en industrias completamente diferentes

✨ **Próximo Paso**
Cuéntame: ¿es un bloqueo de inicio (no sabes por dónde empezar), de medio (perdiste la dirección) o de finalización (no logras pulir)?`;
  }

  if (lastMessage.includes('idea') || lastMessage.includes('ideas')) {
    return `💡 **Análisis**

Generar ideas efectivas requiere un proceso estructurado. Vamos a salir del bloqueo mental y crear algo concreto.

🎯 **5 Ideas Rápidas**
1. **Inversión total** - Toma tu concepto y haz exactamente lo opuesto. ¿Qué pasa?
2. **Combinación forzada** - Elige dos elementos al azar y fúndelos
3. **Escala extrema** - Piensa en微型 o en gigante. ¿Cómo cambia?
4. **Cambio de audiencia** - ¿Cómo se vería para niños? ¿Para expertos?
5. **Eliminación** - Quita el elemento más obvio. ¿Qué queda?

✨ **Próximo Paso**
Elige una de estas ideas y desarróllala en 3 variantes. No pienses demasiado, solo ejecuta.

_Nota: Esta es una respuesta de demostración. Configura OPENAI_API_KEY para respuestas personalizadas._`;
  }

  return `💡 **Análisis**

Entiendo tu consulta. Como Coach Creativo, estoy aquí para ayudarte a encontrar claridad y acción.

🎯 **Recomendaciones**
1. Describe tu proyecto o idea con más detalle
2. Identifica el principal obstáculo que enfrentas
3. Comparte cualquier referencia visual que tengas

✨ **Próximo Paso**
Cuéntame más sobre lo que necesitas. ¿Es un proyecto nuevo, un bloqueo, o necesitas feedback sobre algo específico?

💡 **Tip**: Puedes pegar una imagen de tu trabajo y te daré análisis visual detallado.

_Nota: Esta es una respuesta de demostración. Configura OPENAI_API_KEY para respuestas personalizadas._`;
}
