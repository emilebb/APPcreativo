# 🚀 Guía de Instalación - Sistema de Aprendizaje de Estilo

## ✅ Paso 1: Ejecutar Migración en Supabase

### 1.1 Acceder a Supabase Dashboard

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. En el menú lateral, haz click en **SQL Editor**

### 1.2 Ejecutar la Migración

1. Abre el archivo: `supabase/migrations/003_create_style_learning_tables.sql`
2. Copia **TODO** el contenido del archivo
3. Pega el contenido en el SQL Editor de Supabase
4. Haz click en **Run** (botón verde en la esquina inferior derecha)

### 1.3 Verificar que se crearon las tablas

Ejecuta este query para verificar:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'project_style_patterns',
  'user_style_profile',
  'style_suggestions',
  'lora_training_queue'
);
```

Deberías ver las 4 tablas listadas.

---

## ✅ Paso 2: Verificar Extensión pgvector

Ejecuta este query:

```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

Si no aparece nada, ejecuta:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## ✅ Paso 3: Configurar Variables de Entorno

Agrega estas variables a tu archivo `.env.local`:

```env
# OpenAI API Key (para generar embeddings)
OPENAI_API_KEY=sk-...

# Opcional: Para Fase 2 (LoRA Training)
REPLICATE_API_TOKEN=r8_...
```

---

## ✅ Paso 4: Probar el Sistema

### 4.1 Verificar que las tablas existen

```sql
-- Ver estructura de project_style_patterns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'project_style_patterns';
```

### 4.2 Insertar un patrón de prueba

```sql
-- Insertar patrón de prueba (reemplaza USER_ID con tu ID de usuario)
INSERT INTO project_style_patterns (
  user_id,
  project_type,
  color_palette,
  composition_data,
  confidence_score
) VALUES (
  'USER_ID_AQUI',
  'canvas',
  '{"dominant": ["#FF5733", "#3498DB"], "accent": ["#E74C3C"], "distribution": {}}'::jsonb,
  '{"balance": "asymmetric", "density": 0.7, "focal_points": []}'::jsonb,
  0.8
);
```

### 4.3 Verificar que se guardó

```sql
SELECT * FROM project_style_patterns 
WHERE user_id = 'USER_ID_AQUI';
```

---

## ✅ Paso 5: Integrar en Canvas

El sistema ya está listo para usarse. Cuando guardes un proyecto en Canvas, automáticamente se analizará y guardará el patrón de estilo.

### Ejemplo de uso en código:

```typescript
import { useStyleLearning } from '@/hooks/useStyleLearning';

function CanvasPage() {
  const { analyzeProject, analyzing } = useStyleLearning(projectId);

  const handleSave = async () => {
    // Guardar canvas normalmente
    await saveCanvas();

    // Analizar y guardar patrón de estilo
    await analyzeProject('canvas', {
      elements: canvasElements,
      tags: ['logo', 'diseño']
    });
  };

  return (
    <div>
      {/* Tu canvas aquí */}
      <button onClick={handleSave}>
        {analyzing ? 'Guardando y analizando...' : 'Guardar'}
      </button>
    </div>
  );
}
```

---

## ✅ Paso 6: Agregar Panel de Inspiración

Para mostrar el panel de inspiración en Canvas:

```typescript
import InspirationPanel from '@/components/InspirationPanel';

function CanvasPage() {
  const [showInspiration, setShowInspiration] = useState(true);

  const handleApplySuggestion = (suggestion: any) => {
    // Aplicar la sugerencia al canvas
    if (suggestion.context_type === 'color_palette') {
      const colors = suggestion.suggestion_data.palette;
      // Usar estos colores en el canvas
    }
  };

  return (
    <div className="flex h-screen">
      {/* Canvas */}
      <div className="flex-1">
        {/* Tu canvas aquí */}
      </div>

      {/* Panel de Inspiración */}
      {showInspiration && (
        <InspirationPanel
          projectId={projectId}
          onApplySuggestion={handleApplySuggestion}
        />
      )}
    </div>
  );
}
```

---

## 🔧 Troubleshooting

### Error: "extension 'vector' does not exist"

**Solución:**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Error: "permission denied for schema public"

**Solución:** Verifica que tu usuario de Supabase tenga permisos de escritura.

### Error: "relation 'project_style_patterns' does not exist"

**Solución:** La migración no se ejecutó correctamente. Vuelve a ejecutar el SQL completo.

### Las sugerencias no se generan

**Solución:** 
1. Verifica que tengas al menos 5 proyectos analizados
2. Ejecuta manualmente:
```sql
-- Actualizar perfil de estilo
-- (Esto normalmente se hace automáticamente)
```

---

## 📊 Monitoreo

### Ver cuántos patrones tienes

```sql
SELECT 
  user_id,
  COUNT(*) as total_patterns,
  MIN(created_at) as first_pattern,
  MAX(created_at) as last_pattern
FROM project_style_patterns
GROUP BY user_id;
```

### Ver tus colores más usados

```sql
SELECT 
  color_palette->'dominant' as dominant_colors,
  COUNT(*) as frequency
FROM project_style_patterns
WHERE user_id = 'USER_ID_AQUI'
GROUP BY color_palette->'dominant'
ORDER BY frequency DESC
LIMIT 5;
```

### Ver sugerencias generadas

```sql
SELECT 
  context_type,
  user_feedback,
  COUNT(*) as total
FROM style_suggestions
WHERE user_id = 'USER_ID_AQUI'
GROUP BY context_type, user_feedback;
```

---

## 🎯 Próximos Pasos

Una vez que el sistema esté funcionando:

1. **Recolectar datos:** Usa la app normalmente, cada proyecto se analizará automáticamente
2. **Revisar patrones:** Después de 10-20 proyectos, verás sugerencias más precisas
3. **Fase 2:** Cuando tengas suficientes datos, podrás entrenar tu modelo LoRA personalizado
4. **Fase 3:** El panel de inspiración mostrará diseños completos generados con tu estilo

---

## 📚 Recursos Adicionales

- [Documentación completa](./STYLE_LEARNING_ROADMAP.md)
- [Supabase Vector Docs](https://supabase.com/docs/guides/ai/vector-columns)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)

---

## ⚠️ Importante

- Los datos de estilo son **privados** y solo tú puedes verlos
- El análisis es **automático** y no requiere acción manual
- Las sugerencias son **opcionales**, nunca se aplican automáticamente
- El sistema **aprende** con cada proyecto que creas

**¡Disfruta creando con tu asistente de estilo personalizado!** 🎨✨
