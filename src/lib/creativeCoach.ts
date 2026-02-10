// Sistema completo de detección de bloqueos y protocolos para Creative Coach

export type BlockageType = 'inicio' | 'direccion' | 'motivacion' | 'general';

export interface BlockageDetection {
  type: BlockageType;
  confidence: number;
  keywords: string[];
}

export interface ExerciseResponse {
  blockageType: BlockageType;
  message: string;
  exercise: string;
  expectedResponse: string;
  shouldAdvanceProtocol: boolean;
  memoryUpdate: Record<string, any>;
}

// Detectar tipo de bloqueo basado en el mensaje del usuario
export function detectBlockage(message: string): BlockageDetection {
  const lowerMessage = message.toLowerCase();
  
  // Bloqueo de inicio
  const inicioKeywords = ['no sé por dónde empezar', 'no puedo empezar', 'cómo empiezo', 'por dónde comienzo', 'no sé qué hacer'];
  const inicioScore = inicioKeywords.filter(k => lowerMessage.includes(k)).length;
  
  // Bloqueo de dirección
  const direccionKeywords = ['muchas ideas', 'no sé cuál elegir', 'todo mezclado', 'confuso', 'perdido', 'sin dirección'];
  const direccionScore = direccionKeywords.filter(k => lowerMessage.includes(k)).length;
  
  // Bloqueo de motivación (perfeccionismo)
  const motivacionKeywords = ['perfecto', 'perfección', 'miedo', 'no es suficiente', 'no me gusta', 'no está bien'];
  const motivacionScore = motivacionKeywords.filter(k => lowerMessage.includes(k)).length;
  
  // Determinar el bloqueo más probable
  const scores = [
    { type: 'inicio' as BlockageType, score: inicioScore, keywords: inicioKeywords },
    { type: 'direccion' as BlockageType, score: direccionScore, keywords: direccionKeywords },
    { type: 'motivacion' as BlockageType, score: motivacionScore, keywords: motivacionKeywords }
  ];
  
  const maxScore = Math.max(...scores.map(s => s.score));
  const detected = scores.find(s => s.score === maxScore) || scores[0];
  
  return {
    type: detected.type,
    confidence: maxScore > 0 ? maxScore / 3 : 0.3,
    keywords: detected.keywords
  };
}

// Generar respuesta para bloqueo de inicio
export function generateInicioResponse(): ExerciseResponse {
  return {
    blockageType: 'inicio',
    message: `Detecto que estás en un **bloqueo de inicio**.
No te preocupes: la mayoría de proyectos buenos empiezan sin saber muy bien por dónde van.

Te propongo un ejercicio de máximo **3 minutos**:`,
    exercise: `1. Escribe aquí todas las palabras que se te vengan a la cabeza sobre tu proyecto (10–15).
2. Elige las **3 palabras** que más sientas que representan lo que realmente te importa.
3. Forma una **frase de máximo 10 palabras** interconectando esas 3 palabras.

Responde así:
- **Palabras:** ...
- **3 fuertes:** ...
- **Frase:** ...

En cuanto termines eso, seguimos.`,
    expectedResponse: 'Palabras, 3 fuertes, Frase',
    shouldAdvanceProtocol: false,
    memoryUpdate: {
      last_blockage_type: 'inicio',
      blockage_date: new Date().toISOString()
    }
  };
}

// Generar respuesta para bloqueo de dirección
export function generateDireccionResponse(): ExerciseResponse {
  return {
    blockageType: 'direccion',
    message: `Tu bloqueo hoy es de **dirección**: tienes ideas, pero todo se siente mezclado.

Para aclarar dirección, necesitas:
- Al menos 3 referencias visuales que realmente te gusten.
- Una frase muy corta de lo que todas tienen en común.
- Una decisión: elegir un estilo bastante firme (de momento).

Ejercicio de **5 minutos**:`,
    exercise: `1. Nombra **3 proyectos / marcas / trabajos** que te gusten.
2. Describe en **1 línea** qué elementos tienen en común (color, tipografía, sensación general).
3. Elige solo **1 estilo** como "base" para tu proyecto ahora.

Responde así:
- **Referencias:** ...
- **En común:** ...
- **Estilo elegido:** ...

Con eso podemos definir mucho mejor tu camino.`,
    expectedResponse: 'Referencias, En común, Estilo elegido',
    shouldAdvanceProtocol: false,
    memoryUpdate: {
      last_blockage_type: 'direccion',
      blockage_date: new Date().toISOString()
    }
  };
}

// Generar respuesta para bloqueo de motivación
export function generateMotivacionResponse(): ExerciseResponse {
  return {
    blockageType: 'motivacion',
    message: `Lo que siento hoy es un **bloqueo de motivación**: quieres que todo sea perfecto, entonces evitas empezar o seguir.

Te propongo la estrategia de **atacar a conciencia el perfeccionismo**:`,
    exercise: `1. Decide que el próximo paso será deliberadamente **"mal hecho"**.
2. Fija una herramienta / tipo de trabajo: dibujo, texto, paleta, logo, etc.
3. Haz solo **2 minutos sin revisar** lo que haces.

Responde:
- **¿En qué quieres fallar a propósito?** (logo, paleta, texto, imagen, etc.)
- **¿Qué estás dispuesto/a a romper para avanzar?**

En cuanto me respondas, te doy un micro-ejercicio para ese punto concreto.`,
    expectedResponse: 'Fallar a propósito, Romper para avanzar',
    shouldAdvanceProtocol: false,
    memoryUpdate: {
      last_blockage_type: 'motivacion',
      blockage_date: new Date().toISOString()
    }
  };
}

// Protocolo de 7 días - Definiciones de cada día
export const PRIMEROS_7_DIAS = {
  dia1: {
    title: 'Día 1 – Definir propósito y bloque',
    message: `Vamos a arrancar este protocolo de 7 días con algo muy importante:
**Definir el propósito real de tu proyecto.**`,
    exercise: `Responde:

1. **Nombre del proyecto:** [___]
2. **¿Para quién es?** (tipo de persona o cliente)
3. **¿Qué sensación nueva quieres que le genere?** (texto corto)
4. **¿Qué estás bloqueando realmente?** (nervios por el resultado, miedo al rechazo, perfeccionismo…)

Una vez que lo escribas, resumiremos: *"El propósito es: … y tu bloque es: …"* para que tengamos una base sólida desde donde avanzar.`,
    nextDay: `¡Perfecto! 🎯

Has definido claramente el propósito de tu proyecto. Eso es fundamental.

**Para mañana (Día 2):** Tu tarea será esbozar 3 ideas rápidas sin pulir.

No tienen que ser perfectas, solo registrar ideas sin juzgarlas.`
  },
  
  dia2: {
    title: 'Día 2 – 3 ideas rápidas (sin pulir)',
    message: `Hoy no pensamos en "bello completamente finalizado". 
Hoy pensamos en **registrar ideas sin juzgarlas**.`,
    exercise: `Quiero que me contestes:

1. **3 adjetivos** que describan a tu proyecto.
2. **1 ejemplo** de proyecto parecido que te inspire.
3. **1 diferencia clave** que quieres que tenga tu proyecto respecto a eso.

Luego convertiremos eso en 3 variaciones simples (tipo bocetos en tu Canvas).`,
    nextDay: `¡Excelente trabajo creativo! 💡

Tienes 3 ideas iniciales. Eso es perfecto para empezar.

**Para mañana (Día 3):** Vamos a definir una paleta mínima de colores.

Piensa: ¿Qué 3-5 colores representan mejor tu proyecto?`
  },
  
  dia3: {
    title: 'Día 3 – Paleta mínima',
    message: `Ahora vamos a definir una **paleta mínima**, sin ensayar 100 combinaciones.`,
    exercise: `Responde:

1. **2–3 colores base** (puedes poner nombres, códigos o solo sensaciones)
2. **¿Qué sensación visual quiere transmitir cada uno?**
3. **¿Hay algún color que excluyas a propósito?**

Con eso definiremos una pequeña paleta funcional que puedas usar en tu Canvas.`,
    nextDay: `¡Buena elección de colores! 🎨

Una paleta definida le da personalidad a tu proyecto.

**Para mañana (Día 4):** Define el estilo visual.

¿Será minimalista, ilustrativo, tipográfico, fotográfico?`
  },
  
  dia4: {
    title: 'Día 4 – Estilo visual',
    message: `Hoy elegimos el **estilo visual base** de tu proyecto.`,
    exercise: `Te propongo:

1. Escribe **3 estilos posibles** (por ejemplo: minimalista, ilustrado, tipográfico, romántico, técnico…)
2. Elige solo **1 como estilo principal**
3. Nombra **2 cosas concretas** que rigen su uso (tipografía principal, tipo de iconos, tipo de simetría)

No puedes irte de la sesión sin decidir 1 estilo clave. Lo necesitamos para focalizar.`,
    nextDay: `¡Gran decisión! 🎯

Tener un estilo definido te da dirección clara.

**Para mañana (Día 5):** Vamos a generar 3 variantes rápidas.

No busques perfección, solo claridad.`
  },
  
  dia5: {
    title: 'Día 5 – 3 variantes rápidas',
    message: `Hoy vamos a generar **3 variantes rápidas**.
No busques perfección, solo claridad.`,
    exercise: `Para cada variante, escríbeme:

1. **1 frase** que describa visualmente (como si le fueras a explicar a alguien ciego)
2. **1 palabra clave** que rige esa variante
3. **Pregúntate:** ¿Qué variante te deja menos tensión interna cuando la imaginas?

Así empezamos a filtrar las direcciones que realmente funcionan para ti.`,
    nextDay: `¡Excelente progreso! 🌟

Ya tienes 3 variantes claras para comparar.

**Para mañana (Día 6):** Nos deshacemos de opciones y nos quedamos con una.

La decisión es clave.`
  },
  
  dia6: {
    title: 'Día 6 – Elección y refinamiento ligero',
    message: `Hoy nos deshacemos de opciones y **nos quedamos con una**.`,
    exercise: `Elige **1 variante** de las 3 como "base de proyecto".

Escríbeme:

1. **1 razón visual**
2. **1 razón emocional**
3. Nombra **2 elementos** que puedes eliminar inmediatamente

La perfección llegará después. Hoy solo afinamos la elección.`,
    nextDay: `¡Decisión tomada! ✅

Tienes tu base de proyecto definida.

**Para mañana (Día 7):** Damos por cerrada la idea base y definimos cómo usaremos el proyecto.

El último paso del protocolo.`
  },
  
  dia7: {
    title: 'Día 7 – Definición final y uso',
    message: `Hoy damos por cerrada la idea base y definimos **cómo usaremos el proyecto**.`,
    exercise: `Responde:

1. **Frase corta** de por qué tu proyecto funciona tal como está
2. **3 cosas** que no se ajustan al propósito aún
3. **Cuál será el siguiente paso** en tu Canvas (dibujar, pulir, compartir, etc.)

Con esto, tu protocolo de 7 días llega a un estado claro, y puedes seguir puliendo solo cuando sientas que lo necesitas.`,
    nextDay: `🎉 **¡Protocolo de 7 días completado!**

Has construido tu proyecto paso a paso, desde el propósito hasta la definición final.

Ahora tienes:
- Propósito claro
- Ideas validadas
- Paleta definida
- Estilo elegido
- Variante seleccionada
- Dirección concreta

**Siguiente paso:** Lleva esto a tu Canvas y empieza a crear con confianza.

¿Quieres iniciar un nuevo protocolo o trabajar en este proyecto?`
  }
};

// Generar respuesta para un día específico del protocolo
export function generateProtocolDayResponse(day: number, projectTitle?: string): ExerciseResponse {
  const dayKey = `dia${day}` as keyof typeof PRIMEROS_7_DIAS;
  const dayData = PRIMEROS_7_DIAS[dayKey];
  
  if (!dayData) {
    return {
      blockageType: 'general',
      message: '¡Gran progreso! 🌟',
      exercise: 'Tu respuesta demuestra compromiso con el proceso.\n\n**Para mañana:** Continuamos con el siguiente paso del protocolo.',
      expectedResponse: '',
      shouldAdvanceProtocol: false,
      memoryUpdate: {}
    };
  }
  
  const projectText = projectTitle ? `\n\n**Proyecto:** "${projectTitle}"` : '';
  
  return {
    blockageType: 'general',
    message: `${dayData.title}${projectText}\n\n${dayData.message}`,
    exercise: dayData.exercise,
    expectedResponse: '',
    shouldAdvanceProtocol: true,
    memoryUpdate: {
      last_completed_step: day,
      [`day_${day}_completed`]: new Date().toISOString()
    }
  };
}

// Generar mensaje de bienvenida contextual
export function generateWelcomeMessage(context: {
  role?: string;
  creativeMode?: 'calm' | 'direct';
  projectTitle?: string;
  protocolId?: string;
  currentStep?: number;
  hasActiveProtocol?: boolean;
}): string {
  const { role, creativeMode, projectTitle, protocolId, currentStep, hasActiveProtocol } = context;
  
  let message = `¡Bienvenido! Soy tu Creative Coach aquí en CreationX 🌟\n\n`;
  message += `He leído tu perfil y tus sesiones anteriores, así que hoy puedo ayudarte paso a paso.\n\n`;
  
  message += `**Según lo que veo:**\n`;
  if (role) message += `- Eres: ${role}\n`;
  if (creativeMode) message += `- Tu modo: ${creativeMode === 'direct' ? 'directo (3x más rápido)' : 'calm (ritmo estándar)'}\n`;
  
  if (hasActiveProtocol && projectTitle && protocolId && currentStep !== undefined) {
    message += `- Tu último proyecto: "${projectTitle}"\n`;
    message += `- Estás en el **día ${currentStep + 1}** del protocolo "${protocolId}"\n\n`;
    message += `¿Quieres continuar con tu protocolo actual?`;
  } else {
    message += `\n¿Qué te gustaría empezar hoy?\n\n`;
    message += `1. **Detectar mi bloqueo creativo actual**\n`;
    message += `2. **Comenzar un nuevo proyecto con protocolo de 7 días**\n`;
    message += `3. **Hablar de un proyecto específico**`;
  }
  
  return message;
}

export default {
  detectBlockage,
  generateInicioResponse,
  generateDireccionResponse,
  generateMotivacionResponse,
  generateProtocolDayResponse,
  generateWelcomeMessage,
  PRIMEROS_7_DIAS
};
