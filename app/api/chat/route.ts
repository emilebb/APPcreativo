import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// CREATIVE COACH PRO - Motor de Respuestas Creativas
// Sistema 100% autónomo sin APIs externas
// ============================================================================

interface ResponseTemplate {
  keywords: string[];
  response: string;
}

// ============================================================================
// BASE DE CONOCIMIENTO CREATIVE COACH
// ============================================================================

const BLOCKAGE_RESPONSES: ResponseTemplate[] = [
  {
    keywords: ['bloqueo', 'bloqueada', 'estancado', 'estancada', 'atascado', 'atascada', 'no avanzo', 'no puedo crear'],
    response: `## 🔍 Análisis del Bloqueo Creativo

Detecto que estás experimentando un momento de resistencia creativa. Esto es **completamente normal** e incluso saludable - tu cerebro te está diciendo que necesita un enfoque diferente.

## 🎯 Diagnóstico Rápido

**Tipo de bloqueo detectado:** Resistencia al inicio
**Causa probable:** Perfeccionismo inconsciente o fatiga de decisiones

## ⚡ Acciones Inmediatas

1. **Técnica del "Primer Trazo Malo"** - Dibuja algo terrible a propósito. Al liberar la presión de ser perfecto, la creatividad fluye.

2. **Cambio de Contexto** - Trabaja en un espacio diferente por 15 minutos. A veces el entorno físico bloquea la mente.

3. **Restricción Creativa** - Limita tus herramientas: usa solo 2 colores, 1 fuente. Las restricciones liberan la creatividad.

## ✨ Tu Movimiento Ahora

Abre el Canvas y dibuja **3 círculos mal hechos**. No pienses, solo hazlo. Este acto simple romperá la inercia.`
  },
  {
    keywords: ['idea', 'ideas', 'inspiración', 'inspiracion', 'no se me ocurren', 'sin ideas'],
    response: `## 💡 Generador de Ideas Creativas

Perfecto, vamos a desbloquear tu mente. Las mejores ideas vienen de **conexiones inesperadas**.

## 🧠 Técnica: Conexión Forzada

**Tu prompt:** "${'{user_context}'}"

**5 Ideas Instantáneas:**

### 1. 🎨 Inversión Total
Toma el concepto opuesto y mira qué surge. Si piensas en "minimalista", ¿qué pasa si vas maximalista?

### 2. 🔀 Combinación Absurda
Mezcla dos industrias no relacionadas. ¿Qué si tu proyecto fuera una app de dating para plantas? El absurdo genera breakthroughs.

### 3. 📐 Escala Extrema
Imagina que es **enorme** (un mural) o **tiny** (un sello). ¿Cómo cambia el diseño?

### 4. 🕐 Viaje en el Tiempo
¿Cómo se vería esto en 1990? ¿Y en 2050? La perspectiva temporal revela nuevas posibilidades.

### 5. 👤 Cambio de Persona
Si esto lo creara un niño de 8 años, ¿cómo sería? Si lo hiciera un arquitecto suizo minimalista, ¿qué cambiaría?

## ✨ Próximo Paso

Elige UNA de estas técnicas y aplícala durante 5 minutos. No juzgues las ideas, solo genera.`
  },
  {
    keywords: ['logo', 'logotipo', 'marca', 'branding', 'identidad'],
    response: `## 🎨 Asesor de Identidad Visual

El logo es el corazón de tu marca. Vamos a trabajar en **claridad y memorabilidad**.

## 📐 Principios Fundamentales

**Regla de los 3 segundos:** Si no entienden tu logo en 3 segundos, es complejo de más.

**Escalabilidad:** Debe verse bien en un favicon de 16px y en un billboard.

**Versatilidad:** Funciona en blanco y negro? ¿En diferentes fondos?

## 🎯 5 Direcciones Creativas

1. **Símbolo Abstracto** - Una forma geométrica única que represente tu esencia
2. **Monograma Estilizado** - Las iniciales convertidas en arte
3. **Icono Metafórico** - Un objeto que simbolice tu valor principal
4. **Wordmark Único** - Typografía custom que sea la estrella
5. **Combinación Inteligente** - Icono + wordmark equilibrados

## ⚡ Ejercicio Rápido

Dibuja **5 bocetos en 3 minutos** cada uno. No pienses, solo dibuja. Luego elige el que te haga sonreír.

## 💡 Tip Pro

Los logos más memorables (Nike, Apple, Twitter) son **increíblemente simples**. Busca la esencia, no la complejidad.`
  },
  {
    keywords: ['color', 'colores', 'paleta', 'paleta de colores', 'tonos', 'chromatic'],
    response: `## 🎨 Psicología del Color Creativo

Los colores no son decoración - son **comunicación emocional**. Vamos a crear una paleta que hable.

## 🌈 Fundamentos de Color

| Emoción | Colores | Uso Creativo |
|---------|---------|--------------|
| Energía | Rojo, Naranja | CTAs, Urgencia |
| Confianza | Azul, Verde | Profesionalismo, Calma |
| Lujo | Negro, Dorado | Premium, Exclusividad |
| Frescura | Verde, Turquesa | Innovación, Naturaleza |
| Creatividad | Violeta, Magenta | Fantasía, Originalidad |

## 🎯 Tu Paleta Inteligente

Para proyectos creativos, te recomiendo:

**Paleta Equilibrada:**
- **Principal:** Un color que represente tu personalidad única
- **Secundario:** Su complementario para contraste
- **Neutro:** Un gris o beige para descanso visual
- **Acento:** Un color vibrante para momentos clave

## ⚡ Regla 60-30-10

- 60% color neutro/dominante
- 30% color secundario
- 10% color de acento

## ✨ Tu Movimiento

Elige **3 colores** ahora mismo: Uno que te haga feliz, uno que inspire confianza, y uno que sorprenda. Esa es tu base.`
  },
  {
    keywords: ['proyecto', 'estructurar', 'plan', 'planificar', 'organizar', 'roadmap'],
    response: `## 📊 Arquitecto de Proyectos Creativos

Un proyecto sin estructura es como un viaje sin mapa. Vamos a crear tu hoja de ruta.

## 🏗️ Framework: Los 5 Pilares

### 1. 🎯 VISIÓN (El Norte)
**Pregunta:** ¿Cómo se siente el usuario al ver tu proyecto?
**Ejemplo:** "Empoderado, inspirado, motivado a actuar"

### 2. 📐 ESTRUCTURA (El Esqueleto)
- Hero / Entrada principal
- Núcleo / Contenido central
- CTA / Acción deseada
- Cierre / Memoria

### 3. 🎨 ESTILO (La Personalidad)
Define en 3 palabras: __________, __________, __________

### 4. 📅 HITOS (El Tiempo)
- **Semana 1:** Concepto y bocetos
- **Semana 2:** Diseño principal
- **Semana 3:** Refinamiento
- **Semana 4:** Finalización

### 5. ✅ CRITERIO DE ÉXITO (La Meta)
**"Está terminado cuando..."**
- [ ] Funciona en móvil
- [ ] Carga en menos de 3 segundos
- [ ] Un extraño lo entiende en 10 segundos

## ✨ Tu Siguiente Movimiento

Escribe tu **VISIÓN** en una frase. Empieza por ahí, todo lo demás se deriva.`
  },
  {
    keywords: ['feedback', 'opinión', 'opinion', 'revisar', 'criticar', 'crítica', 'critica'],
    response: `## 🔬 Análisis Constructivo Profundo

Listo para un feedback honesto y accionable. Este es el espacio donde el crecimiento ocurre.

## 📋 Mi Protocolo de Feedback

### Nivel 1: 👁️ Primera Impresión (3 segundos)
¿Qué veo primero? ¿Dónde va mi mirada? ¿La jerarquía visual funciona?

### Nivel 2: 🧠 Comprensión (10 segundos)
¿Entiendo qué es? ¿Sé qué debo hacer? ¿El mensaje es claro?

### Nivel 3: 💜 Conexión Emocional
¿Cómo me hace sentir? ¿Quiero interactuar más? ¿Es memorable?

### Nivel 4: ⚙️ Ejecución Técnica
Espaciado, alineación, tipografía, color, contraste.

## 🎯 Puntos de Mejora (Ejemplo)

**✅ Lo que funciona:**
- Paleta de colores coherente
- Clear visual hierarchy
- Acciones claras

**🔧 Mejoras sugeridas:**
1. **Contraste** - El texto secundario necesita +20% opacidad
2. **Espaciado** - Aumenta padding en tarjetas (+16px mínimo)
3. **Foco** - Reduce elementos competiendo por atención

## 💡 Mi Veredicto

**Potencial:** ████████░░ 80%
**Claridad:** ███████░░░ 70%
**Ejecución:** █████████░ 90%

**Consejo final:** Muestra esto a 3 personas diferentes y observa QUÉ HACEN sin preguntarles. Su comportamiento es el mejor feedback.`
  },
  {
    keywords: ['típ', 'tip', 'consejo', 'ayuda', 'sugerencia', 'guía'],
    response: `## 💎 Consejo del Día - Creative Pro

Voy a compartir contigo un insight que cambia juegos.

## 🧠 Regla del "One Thing"

**La regla:** Cada elemento en tu diseño debe tener UNA sola razón de existir. Si no puedes explicar su propósito en 3 palabras, elimínalo.

## ⚡ Aplicación Inmediata

Mira tu proyecto ahora mismo. Para cada elemento, pregúntate:

> **"¿Qué pasaría si elimino esto?"**

Si la respuesta es "nada cambia significativamente" → **ELIMÍNALO.**

## 🎯 Ejercicio de 5 minutos

1. Abre tu proyecto
2. Selecciona un elemento al azar
3. Pregunta: "¿Aporta valor real?"
4. Si no → elimínalo
5. Repite con el siguiente

## 📊 El Resultado

Menos elementos = Más impacto = Mejor comunicación = Proyecto memorable

**Menos es más, pero cada "menos" debe ser perfecto.**

## ✨ Tu Movimiento

Elige UNO de tus proyectos y elimina 3 elementos hoy. Observa cómo mejora.`
  },
  {
    keywords: ['color', 'paleta', 'hex', '#', 'rgb', 'hsl'],
    response: `## 🎨 Experto en Colorimetría Creativa

El color es lenguaje. Vamos a que el tuyo hable con claridad y emoción.

## 🌈 Tu Herramienta: Teoría de Color Práctica

### Círculo Cromático Simplificado

**Colores Primarios:** 🔴 Rojo | 🔵 Azul | 🟡 Amarillo
**Colores Secundarios:** 🟣 Violeta | 🟠 Naranja | 🟢 Verde

### Armonías que Funcionan

| Armonía | Efecto | Ejemplo Hex |
|---------|--------|-------------|
| **Complementario** | Alto contraste, vibrante | #4F46E5 + #F59E0B |
| **Análogo** | Suave, armonioso | #4F46E5 + #7C3AED + #6366F1 |
| **Triádico** | Energético, diverso | #EF4444 + #F59E0B + #3B82F6 |
| **Monocromático** | Elegante, cohesivo | Tonalidades de un color |

## 🎯 Tu Paleta Express

**Paso 1:** Elige 1 color que ames
**Paso 2:** Usa su complementario para contraste
**Paso 3:** Añade neutros (gris claro, beige)
**Paso 4:** Un acento vibrante para CTA

## ✨ Reto Creativo

Elige **3 proyectos que admires** y extrae sus colores. Ahí está tu tendencia natural. Úsala como base y luego innova.`
  }
];

// ============================================================================
// RESPUESTAS ALEATORIAS DE ALTO NIVEL
// ============================================================================

const GENERAL_TIPS: string[] = [
  `## 💎 Insight Creativo del Día

**La creatividad no es tener ideas originales, es hacer conexiones originales.**

Henry Rollins dijo: "La creatividad es inteligencia divirtiéndose." Y tenía razón.

### Tu Dosificación Diaria de Creatividad:

1. **Morning Brain Dump** - 5 minutos escribiendo TODO lo que piensas al despertar
2. **Inspiration Walk** - 15 minutos caminando sin teléfono, observando
3. **Cross-Pollination** - Lee algo de una industria totalmente diferente a la tuya

### Pregunta para Hoy:
> "Si mi proyecto fuera una persona, ¿qué defecto lo haría más interesante?"

**Esa imperfección es tu ventaja competitiva.** Embrázala.`,

  `## 🧠 Framework: 4-7-8 Creative Breathing

Cuando sientas bloqueo, usa esta técnica:

**4 segundos** - Inhala y piensa en el problema
**7 segundos** - Sostén y deja que tu subconsciente trabaje
**8 segundos** - Exhala y escribe la PRIMER IDEA que venga

No juzgues. Solo ejecuta.

### La Verdad Incómoda:

Las ideas "malas" de hoy son los breakthroughs de mañana. **Todo boceto cuenta.** Cada línea dibujada alimenta tu instinto creativo.

### Tu Movimiento:

Abraza un papel. Dibuja 10 círculos mal hechos. En cada uno, escribe una palabra aleatoria. Ahí hay un proyecto esperando.`,

  `## ⚡ Principio: "Show, Don't Tell"

**La regla de oro del diseño:**

| En lugar de esto... | Haz esto... |
|---------------------|-------------|
| Decir "somos creativos" | Mostrar creatividad en la ejecución |
| Decir "somos confiables" | Diseñar para generar confianza |
| Decir "somos innovadores" | Innovar en la experiencia |

### Aplicación Hoy:

Mira tu proyecto actual. ¿Estás **diciendo** o **mostrando**?

**Ejemplo concreto:**
- ❌ Texto: "Carga rápida"
- ✅ Diseño: Animaciones de 0.1 segundos

**La mejor comunicación es la que no necesita explicación.**`,

  `## 🎯 Mentalidad: El "Hecho es Mejor que Perfecto"

### La Paradoja Creativa:

Los creativos más exitosos no son los perfeccionistas. Son los que **terminan**.

**10 proyectos al 100%** > **1 proyecto al 10% perfecto**

### Tu Checklist de Finalización:

- [ ] ¿El usuario entiende en 3 segundos?
- [ ] ¿Funciona en móvil?
- [ ] ¿Es 80% bueno? (¡ENTONCES TERMINA!)
- [ ] ¿Puedes aprender más lanzando que perfeccionando?

### Regla de los 30 Minutos:

Si llevas más de 30 minutos en un detalle que nadie notará → **TERMINA y avanza.**

**El arte está en saber cuándo parar.**`,

  `## 🌊 Principio: Flow State Activation

Para entrar en estado de flujo creativo, necesitas 3 cosas:

### 1. 🎯 Objetivo Clara
"Voy a diseñar el hero section" ✓
"Voy a trabajar en el proyecto" ✗

### 2. ⚡ Feedback Inmediato
Cada trazo debe verse. Cada cambio debe mostrarse.
Trabaja en modo preview constante.

### 3. 🚫 Eliminación de Interrupciones
- Modo avión
- Solo tú y la pantalla
- 25 minutos sin mirar el teléfono

### Tu Ritual de Inicio:

1. ☕ Una bebida
2. 🎵 Tu playlist de enfoque
3. 🎯 Una tarea específica
4. ⏱️ Timer de 25 minutos
5. 🚀 GO

**El flow no se encuentra, se construye.**`,

  `## 🔥 Principio: "Constraints Breed Creativity"

### La verdad contra-intuitiva:

**Más opciones = Parálisis**
**Menos opciones = Creatividad**

### Aplicación Práctica:

**Reto de Restricción:**
Elige UNO para tu próximo proyecto:

- 🎨 Solo 2 colores
- 📝 Solo 1 fuente
- ⬜ Solo formas geométricas
- 📱 Solo para móvil primero
- ⏱️ Solo 2 horas de trabajo

### Resultado Esperado:

Cuando eliminas opciones, tu cerebro busca caminos creativos que antes no veía.

**Las mejores soluciones nacen de las restricciones más duras.**

### Tu Movimiento:

Elige una restricción. Trabaja 30 minutos con ella. Observa qué surge.`,

  `## 💡 Insight: "Find Your Creative Rhythm"

### No todos son iguales:

| Perfil | Hora Pico | Actividad Ideal |
|--------|-----------|-----------------|
| 🌅 Early Bird | 6-10 AM | Trabajo conceptual, decisiones |
| 🌞 Midday | 12-3 PM | Ejecución, diseño |
| 🌙 Night Owl | 8 PM-12 AM | Creatividad libre, experimentación |

### Descubre Tu Ritmo:

**Semana de Tracking:**
- Nota cuándo tienes más energía creativa
- Identifica tus "golden hours"
- Bloquea esas horas para trabajo creativo

### La Regla de los 90 Minutos:

Tu cerebro trabaja en ciclos de ~90 minutos:
- 90 min: Foco intenso
- 20 min: Descanso
- Repetir

**No luches contra tu biología. Úsala.**`,

  `## 🎨 Framework: "STEAL Like an Artist"

Austin Kleon tiene razón: todos somos comedores creativos.

### Tu Kit de Robo Creativo:

1. **Crea un "Swipe File"** - Captura todo lo que te inspire
2. **Estudia a los maestros** - No copies, analiza POR QUÉ funciona
3. **Combina lo incompatible** - Tu mezcla única = Tu voz creativa
4. **Remix, no copies** - Toma la esencia, transforma la ejecución

### Tu Tarea de Hoy:

1. Abre 3 proyectos que admires
2. Anota 1 cosa que te encante de cada uno
3. Pregunta: "¿Cómo la haría MÍA?"
4. Boceta tu versión en 10 minutos

**La originalidad es 10% invención y 90% remix inteligente.**`,

  `## ⚡ Técnica: "Two-Minute Brainstorm"

### Reglas del juego:

1. ⏱️ 2 minutos exactos
2. ✍️ Máximo 15 ideas
3. 🚫 CERO juicio
4. 💡 Lo absurdo es bienvenido

### Por qué funciona:

La presión de tiempo silencia al crítico interno. Tu mente racional se detiene y el creativo habla.

### Formato:

**Tema:** [Tu tema aquí]
1. _______
2. _______
3. _______
...hasta 15

### Después:

Circula las 3 más interesantes.
**Ahí está tu material creativo.**

### Reto:

Hazlo ahora. 2 minutos. 15 ideas. Ve qué surge.

**Las mejores ideas suelen venir del número 12, 13, 14.**`,

  `## 🧩 Principio: "Creative Problem Reframing"

### El problema nunca es el problema:

Cuando estás atorado, no es por falta de creatividad. Es por cómo formulaste el problema.

### Técnica de Reformulación:

**Original:** "¿Cómo hago un mejor logo?"

**Reformulado:**
- "¿Cómo hago algo que nadie olvide?"
- "¿Cómo lo reconozcan en 0.5 segundos?"
- "¿Cómo se ve igual en negro y blanco?"
- "¿Cómo lo tatuaría alguien?"

### Tu Turno:

Escribe tu problema actual. Luego reformúlalo 5 veces, cada vez más específico y diferente.

**El insight está en la pregunta correcta, no en la respuesta perfecta.**`
];

// ============================================================================
// FUNCIÓN PARA DETECTAR PALABRAS CLAVE
// ============================================================================

function findBestResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Buscar la respuesta más relevante
  let bestMatch: { response: string; score: number } = { response: '', score: 0 };
  
  for (const template of BLOCKAGE_RESPONSES) {
    let score = 0;
    for (const keyword of template.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        score += keyword.length; // Palabras más largas tienen más peso
      }
    }
    if (score > bestMatch.score) {
      bestMatch = { response: template.response, score };
    }
  }
  
  // Si encontró una coincidencia significativa
  if (bestMatch.score > 0) {
    return bestMatch.response;
  }
  
  // Respuesta aleatoria de alto nivel
  const randomIndex = Math.floor(Math.random() * GENERAL_TIPS.length);
  return GENERAL_TIPS[randomIndex];
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

    // Simular delay de procesamiento para UX realista
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generar respuesta
    const response = findBestResponse(lastUserMessage);

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
