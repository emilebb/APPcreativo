import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// CREATIVE COACH AI - Motor de Detección de Intención
// ============================================================================

// ============================================================================
// SISTEMA DE MAPEO DE RESPUESTAS
// ============================================================================

interface IntentCategory {
  keywords: string[];
  responses: string[];
}

const INTENT_CATEGORIES: Record<string, IntentCategory> = {
  // SALUDOS E IDENTIDAD
  saludos: {
    keywords: ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'quién eres', 'quien eres', 'qué eres', 'que eres', 'ayuda', 'hello', 'hi', 'hey', 'presenta', 'introduce', 'quién eres tú', 'como funciona', 'que haces'],
    responses: [
      `¡Hola! 👋 Soy **CreativoX AI**, tu Coach Creativo Inteligente.

Estoy aquí para ser tu compañero creativo las 24 horas del día. Puedo ayudarte con:

🎨 **Diseño y Estética** - Paletas, composición, tipografía
💡 **Generación de Ideas** - Brainstorming, conceptos, naming
🚀 **Estructura de Proyectos** - Planes, organización, ejecución
🔍 **Feedback Constructivo** - Análisis honesto, mejoras concretas
🧠 **Superar Bloqueos** - Técnicas, inspiración, momentum

Mi misión es simple: **ayudarte a convertir tus ideas en realidad**.

¿Por dónde quieres empezar? Puedes contarme sobre tu proyecto actual o simplemente preguntarme algo como "necesito ideas para un logo" o "tengo un bloqueo creativo". ¡Estoy listo para ayudarte!`,

      `¡Hey! 🎉 Me alegra verte aquí. Soy **CreativoX AI**, diseñado para ser el coach creativo que siempre quisiste tener.

**Lo que me hace diferente:**
- No soy un simple chatbot - entiendo el proceso creativo
- Mis respuestas están diseñadas para generar acción, no solo información
- Combino estructura con inspiración

**Puedo ayudarte con:**
→ 💬 "Tengo un bloqueo creativo"
→ 💡 "Necesito ideas para mi proyecto"
→ 🎨 "¿Qué colores usar para...?"
→ 📋 "Ayúdame a estructurar..."
→ 🔬 "Dame feedback sobre..."

**Consejo inicial:** Sé específico conmigo. Cuanto más me cuentes sobre tu proyecto, mejor podré ayudarte.

¿Qué tienes entre manos hoy?`
    ]
  },

  // BLOQUEOS CREATIVOS
  bloqueos: {
    keywords: ['bloqueo', 'bloqueada', 'bloqueado', 'estancado', 'estancada', 'atascado', 'atascada', 'no avanzo', 'no puedo crear', 'no se me ocurre', 'no sé qué hacer', 'no se que hacer', 'perdido', 'perdida', 'confundido', 'confundida', 'sin inspiración', 'sin inspiracion', 'sin ideas', 'no encuentro', 'no encuentro idea', 'no flujo'],
    responses: [
      `Detecto que estás atravesando un momento de bloqueo creativo. **Esto es completamente normal** - de hecho, es señal de que tu cerebro está procesando y buscando nuevas conexiones.

**🔍 Tu tipo de bloqueo probable:**

Basado en lo que describes, parece un bloqueo de **inercia creativa** - ese punto donde la mente se siente sobrecargada y no sabe por dónde empezar.

**⚡ 3 Acciones Inmediatas:**

**1. La Regla de los 5 Minutos**
Abre tu herramienta favorita y trabaja exactamente 5 minutos. No juzgues lo que produces, solo ejecuta. La inercia se rompe con movimiento, no con pensamiento.

**2. Cambio Físico**
Cambia tu entorno. Si estás en el escritorio, ve a otro cuarto. Si trabajas con música, silénciala. Si hay silencio, pon algo. El cambio de estímulos desbloquea patrones.

**3. Técnica del "Primer Trazo Malo"**
Dibuja o diseña algo deliberadamente malo. Al liberar la presión de ser perfecto, la creatividad fluye naturalmente.

**✨ Tu Movimiento Ahora:**

Elige UNA de estas tres técnicas y aplícala inmediatamente. No pienses en cuál es "mejor" - todas funcionan. Solo actúa.

¿Quieres que profundicemos en alguna de estas técnicas?`,

      `Entiendo perfectamente lo que sientes. El bloqueo creativo es como una niebla que nubla tu visión, pero **siempre hay un camino para salir**.

**🧠 ¿Por qué ocurre esto?**

Tu cerebro tiene dos modos: **convergente** (enfocar) y **divergente** (explorar). Cuando estás bloqueado, estás demasiado en modo convergente - buscando la respuesta "correcta" en lugar de explorar posibilidades.

**🎯 Estrategia de Desbloqueo:**

**Paso 1: Cambia la pregunta**
En lugar de "¿qué debo crear?" pregunta "¿qué pasaría si...?"

**Paso 2: Restringe para liberar**
Date limitaciones arbitrarias: solo 2 colores, solo 1 fuente, solo 30 minutos. Las restricciones fuerzan la creatividad.

**Paso 3: Conecta lo inconexo**
Toma dos elementos sin relación de tu proyecto y fúndelos. La innovación nace de conexiones inesperadas.

**📌 Ejercicio Rápido:**

Escribe aquí 3 palabras al azar relacionadas con tu proyecto. Te mostraré cómo conectarlas en algo nuevo.

¿Cuáles son esas 3 palabras?`
    ]
  },

  // GENERACIÓN DE IDEAS
  ideas: {
    keywords: ['idea', 'ideas', 'inspiración', 'inspiracion', 'brainstorm', 'generar', 'necesito ideas', 'se me ocurran', 'qué puedo hacer', 'concepto', 'naming', 'nombre', 'sugerencia', 'propuesta'],
    responses: [
      `¡Perfecto! Vamos a generar algunas ideas creativas. El brainstorming efectivo tiene reglas:

**🧩 Mi Proceso de Generación:**

1. **Inmersión** - Entiendo el contexto
2. **Divergencia** - Genero múltiples direcciones
3. **Convergencia** - Identifico las más prometedoras
4. **Refinamiento** - Las desarrollo con detalle

**💡 Para darte las mejores ideas, necesito saber:**

• ¿Qué tipo de proyecto es? (app, marca, sitio web, campaña...)
• ¿Cuál es el objetivo principal?
• ¿Hay alguna restricción? (colores, estilo, audiencia)
• ¿Qué te gusta y qué NO te gusta?

**⚡ Mientras tanto, aquí va un framework para generar ideas:**

**Técnica SCAMPER:**
- **S**ustituir: ¿Qué podrías reemplazar?
- **C**ombinar: ¿Qué podrías fusionar?
- **A**daptar: ¿Qué podrías adaptar de otro contexto?
- **M**odificar: ¿Qué podrías cambiar de escala?
- **P**oner en otro uso: ¿Qué otros usos tendría?
- **E**liminar: ¿Qué podrías quitar?
- **R**evertir: ¿Qué pasaría si lo hicieras al revés?

**Cuéntame más sobre tu proyecto** y te genero ideas específicas y accionables.`,

      `¡Excelente! Me encanta el brainstorming. Las mejores ideas nacen de **conexiones inesperadas**.

**🎨 Mi Método para Generar Ideas:**

**Nivel 1: Ideas Seguras** - Basadas en lo que funciona en tu industria
**Nivel 2: Ideas Innovadoras** - Combinaciones novedosas
**Nivel 3: Ideas Disruptivas** - Lo que nadie más ha hecho

**📊 Para ser más específico, dame contexto:**

**Ejemplo de buenas preguntas:**
✗ "Dame ideas" (muy amplio)
✓ "Necesito 5 ideas para el logo de una app de productividad"
✓ "¿Qué concepto visual usar para una marca de café premium?"
✓ "Ayúdame con nombres para un proyecto de diseño sostenible"

**🔥 Técnica Rápida - Conexión Forzada:**

Si me das tu tema y un objeto aleatorio, puedo generar conexiones creativas:

*Ejemplo: "App de finanzas" + "Jardín" = "Tu dinero crece como un jardín" - Concepto de nurturing y growth*

**Ahora es tu turno:** ¿Cuál es tu tema? Y si quieres ser extra creativo, dame un objeto aleatorio para la conexión forzada.`
    ]
  },

  // FEEDBACK Y CRÍTICA
  feedback: {
    keywords: ['feedback', 'opinión', 'opinion', 'revisar', 'revisa', 'criticar', 'crítica', 'critica', 'qué piensas', 'que piensas', 'evaluar', 'evalúa', 'evalua', 'analizar', 'analiza', 'mejorar', 'improvement', 'comentario', 'valorar'],
    responses: [
      `Listo para darte un feedback honesto y constructivo. Este es el espacio donde el crecimiento real ocurre.

**🔬 Mi Protocolo de Análisis:**

**1. Primera Impresión (3 segundos)**
¿Qué veo primero? ¿Dónde va mi mirada? ¿La jerarquía visual funciona?

**2. Claridad del Mensaje**
¿Entiendo qué es? ¿Sé qué debo hacer? ¿El propósito es evidente?

**3. Ejecución Técnica**
Espaciado, alineación, tipografía, color, contraste, consistencia.

**4. Impacto Emocional**
¿Cómo me hace sentir? ¿Es memorable? ¿Quiero interactuar más?

**📋 Para darte el mejor feedback, comparte:**

• Una descripción de tu diseño/proyecto
• Tu objetivo principal
• Tu audiencia objetivo
• ¿Qué aspecto específico quieres que enfoque?

**O si tienes una imagen:** Pégala o describe visualmente tu trabajo.

**Mi promesa:** Seré honesto pero constructivo. No buscaré defectos, buscaré oportunidades de mejora.

**¿Qué quieres que analice?`,

      `Perfecto. El feedback es el acelerador más poderoso del crecimiento creativo.

**🎯 Mi Filosofía de Feedback:**

*"El mejor feedback no dice qué está mal - dice qué podría ser mejor y por qué."*

**📊 Categorías que evalúo:**

| Categoría | Lo que busco |
|-----------|--------------|
| **Claridad** | ¿El mensaje es inmediato? |
| **Jerarquía** | ¿Sé dónde mirar primero? |
| **Consistencia** | ¿Todo pertenece junto? |
| **Emoción** | ¿Genera alguna sensación? |
| **Funcionalidad** | ¿Funciona para el usuario? |

**💡 Mi Feedback Inicial (sin ver tu trabajo):**

El hecho de que estés pidiendo feedback demuestra **mentalidad de crecimiento**. La mayoría de creativos evitan la crítica. Tú la buscas. Eso ya te pone por delante.

**🔑 Para un feedback más específico:**

Cuéntame sobre tu proyecto:
1. ¿Qué es? (1-2 frases)
2. ¿Para quién es?
3. ¿Cuál es tu mayor duda?
4. ¿Qué parte te gusta más?

Con esa info, puedo darte un análisis que realmente te ayude a avanzar.

**¿Empezamos?**`
    ]
  },

  // ESTRUCTURA Y PLANIFICACIÓN
  estructura: {
    keywords: ['estructura', 'estructurar', 'plan', 'planear', 'organizar', 'organiza', 'roadmap', 'paso a paso', 'guía', 'guia', 'framework', 'método', 'metodo', 'proceso', 'pasos', 'cronograma', 'proyecto', 'planificación'],
    responses: [
      `Excelente pregunta. La estructura es lo que separa las ideas de la realidad.

**🏗️ Mi Framework de Estructura Creativa:**

**FASE 1: Fundación**
→ Definir el "QUÉ" y el "POR QUÉ"
→ Identificar audiencia y objetivos
→ Establecer criterios de éxito

**FASE 2: Concepto**
→ Desarrollar la idea central
→ Crear moodboard/mood
→ Definir estilo visual

**FASE 3: Ejecución**
→ Tareas específicas con deadlines
→ Entregables por fase
→ Checkpoints de revisión

**FASE 4: Refinamiento**
→ Feedback loops
→ Iteraciones
→ Pulido final

**📊 Para estructurar TU proyecto necesito saber:**

• ¿Qué tipo de proyecto es?
• ¿Cuál es tu deadline realista?
• ¿Qué recursos tienes?
• ¿Cuál es tu nivel de experiencia?

**🎯 Ejemplo de Estructura:**

*Si es un sitio web de 5 páginas:*
- Semana 1: Wireframes y contenido
- Semana 2: Diseño visual
- Semana 3: Desarrollo
- Semana 4: Testing y ajustes

**Cuéntame sobre tu proyecto** y te creo una estructura personalizada con pasos accionables.`,

      `La estructura es el esqueleto de todo gran proyecto. Sin ella, incluso las mejores ideas se desmoronan.

**📐 Mi Método de Planificación:**

**1. Desglose Atómico**
Todo proyecto grande = tareas pequeñas ejecutables en 30-60 minutos

**2. Dependencias Primero**
Identifico qué debe pasar ANTES de qué. Nada se bloquea.

**3. Hitos Visibles**
Puntos de control que generan momentum y motivación.

**4. Flexibilidad Incorporada**
Los planes perfectos no sobreviven al contacto con la realidad. Mi estructura se adapta.

**🎯 Pregunta Clave:**

¿Cuál es el **primer entregable concreto** que necesitas? 

*Ejemplos de buenos entregables:*
- "Wireframe de la homepage"
- "Paleta de colores aprobada"
- "Lista de features priorizada"
- "Moodboard de estilo visual"

**⚡ Tu Movimiento:**

Escribe UN objetivo específico para esta semana. Solo uno. Luego te ayudo a desglosarlo en pasos.

**Ejemplo:**
❌ "Terminar mi proyecto" (demasiado amplio)
✓ "Completar el diseño del hero section" (específico y alcanzable)

**¿Cuál es tu objetivo de esta semana?**`
    ]
  },

  // MOTIVACIÓN
  motivacion: {
    keywords: ['motivación', 'motivacion', 'motivar', 'animo', 'ánimo', 'desanimado', 'desanimada', 'frustrado', 'frustrada', 'cansado', 'cansada', 'rendir', 'rendirse', 'abandonar', 'difficult', 'difícil', 'hard', 'complicado'],
    responses: [
      `Escucho lo que dices, y quiero que sepas algo: **lo que sientes es parte del proceso**. Cada creador que admiras ha sentido exactamente lo mismo.

**💪 La Verdad Sobre la Creatividad:**

*"La creatividad no es lineal. Es una montaña rusa de euforia y duda, de flujo y bloqueo."*

Los días difíciles no son señales de que debas parar. Son señales de que estás en el **límite de tu zona de confort**, justo donde ocurre el crecimiento real.

**🧠 Perspectiva:**

Los obstáculos que sientes hoy serán las habilidades que tendrás mañana. Cada "fracaso" es datos. Cada "bloqueo" es tu cerebro reorganizando patrones.

**⚡ 3 Cosas para Recordar:**

1. **Hecho es mejor que perfecto** - Lanza, comparte, avanza. La perfección es el enemigo del progreso.

2. **Tu progreso es invisible** - Como crecer un centímetro cada día, no lo notas hasta que miras atrás y ves la diferencia.

3. **La consistencia vence al talento** - Mostrarse cada día importa más que esperar la inspiración.

**🌟 Tu Reto de Hoy:**

Haz UNA cosa. Solo una. Algo pequeño que te acerque a tu meta. Puede ser:
- Escribir 100 palabras
- Dibujar un boceto en 5 minutos
- Organizar tu espacio de trabajo
- Leer algo inspirador durante 10 minutos

**¿Qué pequeña acción puedes tomar AHORA?**

Estoy aquí para apoyarte. Cuéntame qué sientes y trabajemos juntos.`,

      `Entiendo la frustración. Es real, es válido, y **es temporal**.

**🔥 Recordatorio Importante:**

Cada maestro fue alguna vez un principiante frustrado. Cada proyecto exitoso nació de la duda. Cada obra maestica tuvo una versión terrible antes.

**📊 La Matemática del Éxito Creativo:**

Para tener 1 gran idea, necesitas:
- 10 ideas buenas
- 100 ideas regulares  
- 1000 ideas que intentaste

**La mayoría de las personas se rinden en el paso 3.** Tú no.

**🎯 Estrategia Anti-Rendición:**

**1. Reduce el alcance**
No necesitas terminar todo. Solo necesitas avanzar un poco.

**2. Celebra el micro-progreso**
¿Completaste una tarea de 15 minutos? Eso cuenta. Celebralo.

**3. Conéctate con tu "por qué"**
¿Por qué empezaste esto? Escribe esa razón en un post-it y ponlo donde lo veas.

**4. Busca comunidad**
Comparte tu proceso con alguien. La vulnerabilidad genera conexión, y la conexión genera energía.

**✨ Acción Inmediata:**

Escribe aquí **una cosa** que lograste esta semana, por pequeña que sea. Reconocer el progreso es el primer paso para recuperar la motivación.

**¿Qué lograste?**`
    ]
  },

  // COLORES Y DISEÑO
  diseno: {
    keywords: ['color', 'colores', 'paleta', 'diseño', 'diseñar', 'tipografía', 'tipografia', 'fuente', 'fuentes', 'estilo', 'visual', 'composición', 'layout', 'interfaz', 'ui', 'ux', 'interface'],
    responses: [
      `El diseño es donde la estrategia se encuentra con la estética. Vamos a hacer que tu proyecto se vea tan bueno como sus ideas.

**🎨 Mi Enfoque de Diseño:**

**1. Psicología del Color**
Los colores no son decoración - son comunicación emocional. Cada tono envía un mensaje subconscious.

**2. Jerarquía Visual**
El ojo debe saber exactamente dónde ir. Sin jerarquía, hay caos.

**3. Espacio Negativo**
Lo que NO está ahí es tan importante como lo que sí. El espacio da respiración y elegancia.

**4. Consistencia Sistémica**
No diseñamos páginas, diseñamos sistemas. Todo debe sentir que pertenece.

**🎯 Para Darte Dirección Específica:**

Cuéntame:
• ¿Qué estás diseñando? (web, app, marca, poster...)
• ¿Cuál es el mood/emoción que quieres transmitir?
• ¿Quién es tu audiencia?
• ¿Hay referencias que te gusten?

**⚡ Consejo Inmediato:**

**La Regla 60-30-10:**
- 60% color neutro/dominante
- 30% color secundario
- 10% color de acento

Esta proporción crea equilibrio visual automáticamente.

**¿Qué específicamente necesitas ayuda? ¿Paleta de colores, tipografía, composición, o todo junto?**`,

      `El diseño es el lenguaje silencioso de tu marca. Cada decisión visual comunica algo.

**🧩 Mi Framework de Diseño:**

**FUNDAMENTOS → ESTILO → DETALLES**

**1. Fundamentos (la base)**
- ¿Qué necesita lograr visualmente?
- ¿Cuáles son las restricciones técnicas?
- ¿Cómo lo consumirá el usuario?

**2. Estilo (la personalidad)**
- 3 palabras que describan el mood
- Referencias visuales clave
- Paleta emocional

**3. Detalles (la ejecución)**
- Tipografía con personalidad
- Iconografía coherente
- Espaciado consistente

**🎯 Para Avanzar Rápido:**

Dame estas 3 cosas y te doy dirección concreta:

1. **El proyecto en una frase**
2. **Dos marcas que admires** (no necesariamente de tu industria)
3. **Un adjetivo que no quieres que describa tu diseño**

*Ejemplo: "App de productividad, me gusta Stripe y Linear, no quiero que se vea aburrido"*

Con eso puedo darte una dirección visual clara.

**¿Me das esos 3 puntos?**`
    ]
  },

  // MARCA Y LOGO
  marca: {
    keywords: ['marca', 'logo', 'logotipo', 'branding', 'identidad', 'logotipo', 'icono', 'símbolo', 'symbol', 'wordmark', 'brand'],
    responses: [
      `La marca es mucho más que un logo. Es la **promesa visual** que haces a tu audiencia.

**🏗️ Mi Proceso de Construcción de Marca:**

**FASE 1: Estrategia** (antes de diseñar)
→ ¿Cuál es la personalidad de la marca?
→ ¿Qué emociones debe evocar?
→ ¿Quién es el competidor y cómo diferenciarnos?

**FASE 2: Concepto**
→ 3 direcciones creativas diferentes
→ Moodboards de referencia
→ Paleta emocional

**FASE 3: Ejecución**
→ Logo que funcione en todos los tamaños
→ Sistema de identidad coherente
→ Guías de uso claras

**📐 Reglas de un Buen Logo:**

1. **Simplicidad** - Si un niño de 8 años no puede dibujarlo de memoria, es complejo
2. **Memorabilidad** - ¿Lo recordarían en 5 minutos?
3. **Versatilidad** - ¿Funciona en favicon Y billboard?
4. **Atemporalidad** - ¿Envejecerá bien?
5. **Relevancia** - ¿Comunica el mensaje correcto?

**🎯 Para Empezar:**

Describe tu marca como si fuera una persona:
• ¿Cómo habla? (formal, casual, divertida...)
• ¿Qué valora? (innovación, tradición, lujo...)
• ¿Cómo hace sentir a la gente?

**💡 Técnica Rápida:**

Piensa en 3 competidores. **¿Qué quieren que pienses sobre ellos?** Ahora, ¿qué quieres que piensen sobre ti que SEA DIFERENTE?

**¿Qué tipo de marca estás construyendo?**`,

      `El logo es el punto de entrada visual a tu marca. Debe ser magnético, memorable y significativo.

**🎯 Mi Filosofía de Logo:**

*"El mejor logo es el que puedes reconocer en 0.5 segundos y recordar para siempre."*

**Los 5 Tipos de Logos:**

**1. Símbolo Iconico** (Apple, Nike)
- Requiere construir reconocimiento
- Máxima flexibilidad una vez establecido

**2. Wordmark** (Google, Coca-Cola)
- La tipografía ES el logo
- Perfecto para nombres cortos y distintivos

**3. Monograma** (LV, HBO, IBM)
- Iniciales estilizadas
- Ideal para marcas con nombres largos

**4. Combination Mark** (Adidas, Burger King)
- Icono + texto
- Más fácil de reconocer para nuevas marcas

**5. Emblema** (Starbucks, Harley Davidson)
- Logo dentro de un contenedor
- Sensación de tradición y autoridad

**⚡ Tu Siguiente Paso:**

Determina qué tipo necesita tu marca:
- ¿Tu nombre es corto y memorable? → Wordmark
- ¿Tu nombre es largo o genérico? → Símbolo
- ¿Eres nuevo y necesitas claridad? → Combination Mark

**¿Cuál es el nombre de tu marca y qué tipo de producto/servicio ofreces?**

Con eso puedo darte una dirección específica.`
    ]
  },

  // RESPUESTA GENÉRICA INTELIGENTE
  generica: {
    keywords: [],
    responses: [
      `Interesante perspectiva. Como tu Coach Creativo, me gustaría entender mejor tu contexto para darte un feedback más preciso.

**Para ayudarte mejor, ¿podrías profundizar un poco más en:**

• ¿Qué tipo de proyecto o idea tienes en mente?
• ¿Cuál es el objetivo principal que buscas?
• ¿Hay algún desafío específico que enfrentas?

💡 **Tip:** Cuanto más específico seas conmigo, más útil y accionable será mi respuesta.

Mientras tanto, ¿te gustaría que exploremos alguna de estas áreas?
→ 🎨 Diseño y estética
→ 💡 Generación de ideas
→ 📊 Estructura de proyecto
→ 🔍 Feedback constructivo
→ 🧠 Superar bloqueos creativos`,

      `Me gusta que estés pensando en esto. Para darte el mejor consejo como tu Coach Creativo, necesito conectar los puntos.

**Cuéntame más sobre:**

1. **El contexto** - ¿Qué estás creando o mejorando?
2. **La audiencia** - ¿Para quién es esto?
3. **El desafío** - ¿Cuál es tu mayor duda o preocupación?

**O si prefieres, elige un camino:**

| Si quieres... | Pregúntame... |
|---------------|---------------|
| Ideas frescas | "Necesito ideas para..." |
| Feedback honesto | "Dame tu opinión sobre..." |
| Estructura clara | "Ayúdame a planificar..." |
| Inspiración | "Tengo un bloqueo con..." |

**¿Por dónde quieres empezar?**`
    ]
  }
};

// ============================================================================
// FUNCIÓN DE DETECCIÓN DE INTENCIÓN
// ============================================================================

function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  let bestMatch = 'generica';
  let highestScore = 0;
  
  for (const [category, data] of Object.entries(INTENT_CATEGORIES)) {
    if (category === 'generica') continue;
    
    let score = 0;
    for (const keyword of data.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        // Palabras más largas tienen más peso
        score += keyword.length * 2;
        // Bonus por coincidencia exacta de frase
        if (lowerMessage.includes(keyword.toLowerCase())) {
          score += 5;
        }
      }
    }
    
    if (score > highestScore) {
      highestScore = score;
      bestMatch = category;
    }
  }
  
  return bestMatch;
}

function getResponse(intent: string, message: string): string {
  const category = INTENT_CATEGORIES[intent] || INTENT_CATEGORIES.generica;
  const responses = category.responses;
  
  // Seleccionar respuesta basada en hash simple del mensaje para variedad
  const hash = message.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % responses.length;
  
  return responses[index];
}

// ============================================================================
// SIMULACIÓN DE STREAMING
// ============================================================================

function simulateStreamingDelay(text: string): number {
  // Delay proporcional a la longitud del texto, entre 1-3 segundos
  const baseDelay = 800;
  const charDelay = text.length * 2;
  return Math.min(baseDelay + charDelay, 3000);
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Obtener el último mensaje del usuario
    const lastUserMessage = messages
      .filter((m: any) => m.role === 'user')
      .pop()?.content || '';

    // Detectar intención
    const intent = detectIntent(lastUserMessage);
    
    // Generar respuesta
    const response = getResponse(intent, lastUserMessage);
    
    // Calcular delay simulado
    const delay = simulateStreamingDelay(response);
    
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, delay));

    return NextResponse.json({ 
      message: response,
      intent // Debug: para ver qué intención detectó
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
