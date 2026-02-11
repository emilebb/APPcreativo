# 🤝 Sistema de Colaboración en Tiempo Real - "One-Click Review"

## 🎯 Visión General

Sistema de colaboración diseñado para profesionales creativos que necesitan aprobación de clientes sin complicaciones. El cliente puede revisar, comentar y aprobar diseños **sin necesidad de crear cuenta**.

---

## ✨ Características Principales

### **1. Enlaces Compartidos Únicos**
- ✅ Generación de enlaces únicos por proyecto
- ✅ Sin necesidad de login para el cliente
- ✅ Configuración de permisos granular
- ✅ Expiración configurable (1-30 días o sin expiración)
- ✅ Tracking de accesos

### **2. Comentarios con Pins**
- ✅ Comentarios ubicados en posiciones específicas del canvas
- ✅ Pins visuales que marcan la ubicación exacta
- ✅ Threads de respuestas
- ✅ Estados: Abierto, Resuelto, Archivado

### **3. Sistema de Tareas**
- ✅ Conversión automática de comentarios a tareas
- ✅ Asignación de tareas
- ✅ Prioridades (Low, Medium, High, Urgent)
- ✅ Estados (Todo, In Progress, Review, Done)
- ✅ Fechas de vencimiento

### **4. Aprobaciones**
- ✅ Solicitud de aprobación final
- ✅ Estados: Pending, Approved, Rejected, Changes Requested
- ✅ Feedback detallado
- ✅ Lista de cambios solicitados

### **5. Tiempo Real**
- ✅ Sincronización instantánea con Supabase Realtime
- ✅ Cursores de colaboradores en vivo
- ✅ Notificaciones de nuevos comentarios
- ✅ Actualización automática de tareas

---

## 🚀 Flujo de Usuario

### **Para el Creativo (Owner):**

1. **Compartir Proyecto**
   ```
   Click en "Share for Review"
   → Configurar permisos
   → Agregar info del cliente (opcional)
   → Generar enlace
   → Copiar o enviar por email
   ```

2. **Recibir Comentarios**
   ```
   Cliente deja comentarios con pins
   → Aparecen en tiempo real en el panel
   → Crear tarea desde comentario
   → Resolver comentario cuando esté listo
   ```

3. **Aprobación Final**
   ```
   Solicitar aprobación
   → Cliente recibe notificación
   → Cliente aprueba o solicita cambios
   → Proyecto marcado como aprobado
   ```

### **Para el Cliente:**

1. **Acceder al Proyecto**
   ```
   Abrir enlace compartido
   → Ver diseño sin login
   → Interfaz simplificada
   ```

2. **Dejar Comentarios**
   ```
   Click en ubicación específica
   → Escribir comentario
   → Comentario aparece con pin
   → Sincronización instantánea
   ```

3. **Aprobar o Solicitar Cambios**
   ```
   Revisar diseño completo
   → Aprobar o solicitar cambios
   → Dejar feedback
   → Notificación al creativo
   ```

---

## 📋 Instalación

### **Paso 1: Ejecutar Migración en Supabase**

1. Ve a Supabase Dashboard → SQL Editor
2. Copia el contenido de `supabase/migrations/004_create_collaboration_system.sql`
3. Ejecuta el SQL
4. Verifica que se crearon las tablas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'project_shares',
  'project_comments',
  'project_tasks',
  'project_approvals',
  'realtime_cursors'
);
```

### **Paso 2: Habilitar Supabase Realtime**

En Supabase Dashboard:
1. Ve a **Database** → **Replication**
2. Habilita replicación para estas tablas:
   - `project_comments`
   - `realtime_cursors`
   - `project_tasks`

---

## 💻 Uso en Código

### **Crear Share Link**

```typescript
import { useCollaboration } from '@/hooks/useCollaboration';

function CanvasPage() {
  const { createShareLink } = useCollaboration(projectId);

  const handleShare = async () => {
    const share = await createShareLink(
      {
        can_comment: true,
        can_suggest_colors: true,
        can_edit: false,
        can_download: false
      },
      {
        name: 'Juan Pérez',
        email: 'juan@cliente.com'
      },
      7 // Expira en 7 días
    );

    if (share) {
      const url = collaborationService.generateShareUrl(share.share_token);
      console.log('Share URL:', url);
    }
  };

  return (
    <button onClick={handleShare}>
      Compartir para Revisión
    </button>
  );
}
```

### **Agregar Comentario con Pin**

```typescript
const { addComment } = useCollaboration(projectId);

const handleCanvasClick = async (x: number, y: number) => {
  await addComment(
    'Este logo debería estar más a la derecha',
    { x, y }, // Posición del pin
    shareId
  );
};
```

### **Crear Tarea desde Comentario**

```typescript
const { createTaskFromComment } = useCollaboration(projectId);

const handleCreateTask = async (commentId: string) => {
  const taskId = await createTaskFromComment(commentId);
  console.log('Tarea creada:', taskId);
};
```

### **Suscribirse a Cambios en Tiempo Real**

```typescript
useEffect(() => {
  const unsubscribe = collaborationService.subscribeToProject(projectId, {
    onComment: (comment) => {
      console.log('Nuevo comentario:', comment);
      // Mostrar notificación
    },
    onCursor: (cursor) => {
      console.log('Cursor actualizado:', cursor);
      // Actualizar posición del cursor
    }
  });

  return () => unsubscribe?.();
}, [projectId]);
```

---

## 🎨 Componentes UI

### **ShareProjectModal**
Modal para generar enlaces compartidos con configuración de permisos.

```typescript
import ShareProjectModal from '@/components/ShareProjectModal';

<ShareProjectModal
  projectId={projectId}
  projectName="Logo Empresa XYZ"
  isOpen={showShareModal}
  onClose={() => setShowShareModal(false)}
/>
```

### **CommentsPanel**
Panel lateral que muestra todos los comentarios del proyecto.

```typescript
import CommentsPanel from '@/components/CommentsPanel';

<CommentsPanel
  projectId={projectId}
  onPinClick={(position) => {
    // Hacer zoom a la ubicación del pin
    console.log('Pin en:', position);
  }}
/>
```

---

## 🔒 Seguridad y Permisos

### **Row Level Security (RLS)**

Todas las tablas tienen RLS habilitado:

- **project_shares**: Solo el owner puede crear/modificar
- **project_comments**: Cualquiera con enlace válido puede comentar
- **project_tasks**: Solo el owner puede gestionar
- **project_approvals**: Cualquiera con enlace puede aprobar

### **Permisos Configurables**

```typescript
interface SharePermissions {
  can_comment: boolean;        // Dejar comentarios
  can_suggest_colors: boolean; // Proponer paletas
  can_edit: boolean;           // Editar diseño (futuro)
  can_download: boolean;       // Descargar archivo
}
```

---

## 📊 Base de Datos

### **Tablas Principales**

1. **project_shares**
   - Enlaces compartidos únicos
   - Configuración de permisos
   - Tracking de accesos

2. **project_comments**
   - Comentarios con ubicación (pins)
   - Threads de respuestas
   - Estados (open, resolved, archived)

3. **project_tasks**
   - Tareas generadas desde comentarios
   - Asignación y prioridades
   - Estados de progreso

4. **project_approvals**
   - Solicitudes de aprobación
   - Feedback del cliente
   - Cambios solicitados

5. **realtime_cursors**
   - Posiciones de cursores en tiempo real
   - Colaboración sincronizada

---

## 🔄 Sincronización en Tiempo Real

### **Supabase Realtime**

El sistema usa Supabase Realtime para sincronización instantánea:

```typescript
// Suscripción automática a cambios
const { comments, tasks, cursors } = useCollaboration(projectId);

// Los datos se actualizan automáticamente cuando:
// - Se agrega un nuevo comentario
// - Se actualiza una tarea
// - Se mueve un cursor
// - Se responde a una aprobación
```

---

## 🎯 Casos de Uso

### **1. Revisión de Logo**
```
Diseñador comparte logo con cliente
→ Cliente comenta: "El texto muy pequeño"
→ Diseñador crea tarea
→ Corrige y marca como resuelto
→ Cliente aprueba versión final
```

### **2. Aprobación de Branding**
```
Diseñador comparte paleta de colores
→ Cliente sugiere cambio de tono
→ Diseñador aplica cambios
→ Cliente aprueba paleta
→ Proyecto marcado como aprobado
```

### **3. Iteración de Diseño**
```
Diseñador comparte mockup
→ Cliente deja 5 comentarios con pins
→ Diseñador convierte a tareas
→ Completa tareas una por una
→ Cliente revisa y aprueba
```

---

## 📈 Métricas y Analytics

### **Tracking de Shares**

```sql
-- Ver shares más activos
SELECT 
  ps.id,
  ps.client_name,
  ps.access_count,
  COUNT(pc.id) as total_comments
FROM project_shares ps
LEFT JOIN project_comments pc ON pc.share_id = ps.id
GROUP BY ps.id
ORDER BY ps.access_count DESC;
```

### **Tiempo de Respuesta**

```sql
-- Tiempo promedio de resolución de comentarios
SELECT 
  AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_hours
FROM project_comments
WHERE status = 'resolved';
```

---

## 🚀 Roadmap Futuro

### **Fase 2: Funcionalidades Avanzadas**
- [ ] Videollamadas integradas
- [ ] Anotaciones de voz
- [ ] Versionado de diseños
- [ ] Comparación lado a lado
- [ ] Exportar feedback como PDF

### **Fase 3: Integraciones**
- [ ] Slack notifications
- [ ] Email notifications automáticas
- [ ] Integración con Figma
- [ ] Webhooks para automatización

---

## 💡 Tips y Mejores Prácticas

1. **Configura expiración de enlaces** para proyectos sensibles
2. **Usa nombres descriptivos** para clientes
3. **Convierte comentarios a tareas** para mejor organización
4. **Resuelve comentarios** cuando estén completos
5. **Solicita aprobación final** antes de entregar

---

## 🐛 Troubleshooting

### **Los comentarios no aparecen en tiempo real**
- Verifica que Realtime esté habilitado en Supabase
- Revisa que las tablas tengan replicación activa

### **El enlace compartido no funciona**
- Verifica que el share esté en estado 'active'
- Revisa que no haya expirado

### **No se pueden crear tareas desde comentarios**
- Verifica que la función SQL `create_task_from_comment` exista
- Revisa permisos de RLS

---

## 📚 Recursos

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)

---

**¡Sistema de Colaboración listo para usar!** 🎉

Ahora tus clientes pueden revisar y aprobar diseños sin complicaciones.
