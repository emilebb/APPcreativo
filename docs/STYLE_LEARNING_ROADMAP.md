# 🎨 Sistema de Aprendizaje de Estilo Creativo - Roadmap

## 🎯 Visión General

Este sistema **NO hace el trabajo del usuario**, sino que **aprende de sus patrones, colores y estética** para ofrecer sugerencias personalizadas basadas en su "ADN creativo".

---

## 📅 Fase 1: Recolección de Datos (Semanas 1-4)

### ✅ Infraestructura Completada

**Base de datos vectorial en Supabase:**
- ✅ Tabla `project_style_patterns` - Almacena patrones extraídos de proyectos
- ✅ Tabla `user_style_profile` - Perfil agregado del estilo del usuario
- ✅ Tabla `style_suggestions` - Sugerencias generadas
- ✅ Tabla `lora_training_queue` - Cola para entrenamiento de modelos (Fase 2)
- ✅ Extensión `pgvector` habilitada para búsqueda vectorial
- ✅ RLS policies configuradas

**Archivo de migración:** `supabase/migrations/003_create_style_learning_tables.sql`

### 🔄 Próximos Pasos (Fase 1)

1. **Ejecutar migración en Supabase:**
   ```bash
   # Copiar el contenido de 003_create_style_learning_tables.sql
   # Ejecutar en Supabase SQL Editor
   ```

2. **Implementar análisis de canvas:**
   - Extraer paleta de colores real de elementos dibujados
   - Analizar composición (balance, densidad, puntos focales)
   - Detectar patrones de trazo (ancho, presión, suavidad)
   - Clasificar formas (geométricas vs orgánicas)

3. **Integrar con OpenAI Embeddings API:**
   ```typescript
   // Generar embeddings vectoriales de 1536 dimensiones
   const embedding = await openai.embeddings.create({
     model: "text-embedding-3-small",
     input: JSON.stringify(styleData)
   });
   ```

4. **Hook de auto-análisis:**
   - Cuando el usuario guarda un proyecto en Canvas
   - Automáticamente analizar y guardar patrones
   - Actualizar perfil de estilo periódicamente

---

## 🧠 Fase 2: Entrenamiento de LoRA (Semanas 5-8)

### Objetivo
Entrenar modelos pequeños (LoRA - Low-Rank Adaptation) que se adapten al estilo del usuario.

### Tecnologías a Usar

**LoRA Training:**
- **Stable Diffusion** + LoRA adapters
- **Replicate API** o **Modal** para entrenamiento en la nube
- **Hugging Face Diffusers** para inferencia

### Implementación

1. **Preparar dataset de entrenamiento:**
   - Exportar proyectos del usuario como imágenes
   - Generar captions descriptivos del estilo
   - Mínimo 10-20 proyectos para entrenamiento efectivo

2. **Entrenar modelo LoRA:**
   ```python
   # Ejemplo con Replicate
   training = replicate.trainings.create(
     version="stability-ai/sdxl",
     input={
       "input_images": user_projects_zip,
       "token_string": "TOK",  # Token único del usuario
       "max_train_steps": 1000
     }
   )
   ```

3. **Guardar pesos entrenados:**
   - Almacenar en Supabase Storage
   - Referenciar en `lora_training_queue`
   - Versionar modelos por fecha

4. **Inferencia con modelo personalizado:**
   ```python
   # Generar con el estilo del usuario
   output = replicate.run(
     user_lora_model,
     input={
       "prompt": "logo design",
       "lora_scale": 0.8  # Intensidad del estilo
     }
   )
   ```

---

## 🎨 Fase 3: Interfaz de Sugerencias (Semanas 9-12)

### Panel Lateral de "Inspiración"

**Ubicación:** Sidebar derecho en Canvas

**Funcionalidades:**

1. **Sugerencias de Paleta de Colores:**
   - Basadas en colores favoritos del usuario
   - Armonías complementarias
   - Variaciones de saturación/brillo

2. **Sugerencias de Composición:**
   - Layouts similares a proyectos anteriores
   - Mejoras de balance y densidad
   - Puntos focales sugeridos

3. **Sugerencias de Formas:**
   - Formas que complementan el estilo
   - Variaciones de complejidad
   - Simetría/asimetría personalizada

4. **Diseños Completos (con LoRA):**
   - Miniaturas generadas con el modelo del usuario
   - Basadas en el contexto actual del canvas
   - Click para aplicar como referencia

### UI/UX

```typescript
// Componente de panel de inspiración
<InspirationPanel>
  <SuggestionCard type="color_palette">
    <ColorSwatches colors={suggestion.palette} />
    <Actions>
      <Button onClick={applySuggestion}>Aplicar</Button>
      <Button onClick={likeSuggestion}>👍</Button>
      <Button onClick={dislikeSuggestion}>👎</Button>
    </Actions>
  </SuggestionCard>
</InspirationPanel>
```

---

## 🔧 Stack Tecnológico

### Backend
- **Supabase** - Base de datos vectorial + Storage
- **OpenAI Embeddings API** - Vectorización de estilos
- **Replicate/Modal** - Entrenamiento de LoRA
- **Edge Functions** - Procesamiento de análisis

### Frontend
- **React** - UI del panel de inspiración
- **TailwindCSS** - Estilos
- **Framer Motion** - Animaciones
- **Canvas API** - Análisis de elementos dibujados

### ML/AI
- **Stable Diffusion XL** - Modelo base
- **LoRA** - Adaptación personalizada
- **CLIP** - Análisis de imágenes
- **OpenAI Embeddings** - Búsqueda semántica

---

## 📊 Métricas de Éxito

### Fase 1
- ✅ 100% de proyectos analizados automáticamente
- ✅ Perfil de estilo actualizado cada 5 proyectos
- ✅ Búsqueda vectorial < 100ms

### Fase 2
- 🎯 Modelo LoRA entrenado en < 30 minutos
- 🎯 Calidad de generación > 80% aprobación del usuario
- 🎯 Estilo reconocible en generaciones

### Fase 3
- 🎯 3-5 sugerencias relevantes por sesión
- 🎯 > 30% de sugerencias usadas por el usuario
- 🎯 Feedback positivo > 70%

---

## 💰 Costos Estimados

### Fase 1 (Recolección)
- **OpenAI Embeddings:** ~$0.0001 por proyecto
- **Supabase:** Tier gratuito suficiente
- **Total:** < $5/mes para 1000 usuarios

### Fase 2 (LoRA Training)
- **Replicate:** ~$0.50 por entrenamiento
- **Storage:** ~$0.10/GB/mes
- **Total:** ~$5-10/usuario (one-time)

### Fase 3 (Generación)
- **Replicate Inference:** ~$0.01 por imagen
- **Total:** ~$10-20/mes para usuario activo

---

## 🚀 Cómo Empezar

### 1. Ejecutar Migración
```sql
-- Copiar contenido de:
-- supabase/migrations/003_create_style_learning_tables.sql
-- Ejecutar en Supabase SQL Editor
```

### 2. Configurar Variables de Entorno
```env
OPENAI_API_KEY=sk-...
REPLICATE_API_TOKEN=r8_...
```

### 3. Integrar en Canvas
```typescript
import styleLearningService from '@/lib/styleLearningService';

// Al guardar proyecto
await styleLearningService.analyzeAndSaveProject(
  userId,
  projectId,
  'canvas',
  canvasData
);
```

### 4. Actualizar Perfil Periódicamente
```typescript
// Cada 5 proyectos o semanalmente
await styleLearningService.updateUserStyleProfile(userId);
```

---

## 📚 Recursos

- [Supabase Vector](https://supabase.com/docs/guides/ai/vector-columns)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [LoRA Training Guide](https://huggingface.co/docs/diffusers/training/lora)
- [Replicate API](https://replicate.com/docs)

---

## ⚠️ Consideraciones Importantes

1. **Privacidad:** Los datos de estilo son personales y privados
2. **Consentimiento:** Usuario debe aprobar uso de sus datos para entrenamiento
3. **Calidad:** Mínimo 10 proyectos para resultados significativos
4. **Performance:** Análisis debe ser asíncrono para no bloquear UI
5. **Costos:** Monitorear uso de APIs para evitar sorpresas

---

## 🎯 Visión a Largo Plazo

**El objetivo final es que CreationX sea el único asistente creativo que:**
- Conoce tu estilo único
- Aprende de cada proyecto
- Sugiere sin imponer
- Evoluciona contigo

**No reemplaza al creador, lo potencia.** 🚀
