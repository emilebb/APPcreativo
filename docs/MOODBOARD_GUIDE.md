# Guía de Uso del Sistema de Moodboards

## Descripción General

El sistema de moodboards mejorado permite a los usuarios crear, editar y organizar tableros de inspiración visual con múltiples estilos y plantillas personalizables.

## Características Principales

### 1. **Editor de Moodboard Completo**
- **Modo de edición dedicado**: Interfaz completa para trabajar en moodboards
- **Arrastrar y soltar**: Posiciona imágenes libremente en el canvas
- **Controles de zoom**: Ajusta la vista del canvas (50% - 200%)
- **Transformaciones**: Rotar, redimensionar y reposicionar imágenes
- **Guardado automático**: Los cambios se guardan en localStorage y Supabase (cuando esté configurado)

### 2. **Múltiples Estilos de Layout**

#### Estilos Predefinidos:
1. **Libre (Freeform)**: Posiciona imágenes donde quieras con total libertad
2. **Cuadrícula (Grid)**: Grid uniforme 3x3 con espaciado consistente
3. **Mosaico (Masonry)**: Estilo Pinterest con columnas dinámicas
4. **Collage**: Superposición artística de imágenes
5. **Revista (Magazine)**: Diseño editorial de 2 columnas
6. **Minimalista (Minimal)**: Espacios amplios entre imágenes

### 3. **Plantillas Personalizadas**

Los usuarios pueden crear y guardar sus propias plantillas:

#### Crear una Plantilla:
1. Organiza las imágenes en el canvas como desees
2. Haz clic en "Guardar como Plantilla"
3. Asigna un nombre y descripción
4. La plantilla se guarda y aparece en "Mis Plantillas"

#### Usar una Plantilla:
- Selecciona cualquier plantilla del panel lateral
- Las imágenes se reorganizarán según el patrón guardado
- Puedes modificar y ajustar después de aplicar la plantilla

### 4. **Gestión de Imágenes**

#### Añadir Imágenes:
- Arrastra archivos desde tu computadora
- Haz clic en "Añadir Imágenes" para seleccionar archivos
- Soporta múltiples formatos: JPG, PNG, GIF, WebP

#### Editar Imágenes:
- **Seleccionar**: Haz clic en una imagen para seleccionarla
- **Mover**: Arrastra la imagen (solo en modo Libre)
- **Rotar**: Botón "Rotar 90°" en el panel lateral
- **Redimensionar**: Botones "Agrandar" y "Reducir"
- **Eliminar**: Botón "Eliminar" para quitar la imagen

### 5. **Navegación y Acceso**

#### Desde la Página Principal:
- Ver todos tus moodboards
- Crear nuevo moodboard (botón "Nuevo Moodboard")
- Editar moodboard existente (icono de lápiz al pasar el mouse)
- Eliminar moodboard (icono de papelera)

#### Desde el Sidebar:
- Acceso rápido a la sección de Moodboards
- Crear nuevo proyecto tipo moodboard

## Flujo de Trabajo Típico

### Crear un Nuevo Moodboard:

1. **Inicio**
   - Ve a `/moodboard`
   - Haz clic en "Nuevo Moodboard"

2. **Edición**
   - Se abre el editor en `/moodboard/[id]/edit`
   - Añade un título descriptivo
   - Opcionalmente añade una descripción

3. **Añadir Contenido**
   - Arrastra imágenes al canvas
   - O haz clic en "Añadir Imágenes"

4. **Aplicar Estilo**
   - Selecciona un estilo predefinido del panel lateral
   - O usa modo "Libre" para personalizar completamente

5. **Personalizar**
   - Ajusta posiciones, tamaños y rotaciones
   - Usa el zoom para trabajar con precisión

6. **Guardar**
   - Haz clic en "Guardar"
   - El moodboard se guarda automáticamente

### Editar un Moodboard Existente:

1. Ve a `/moodboard`
2. Pasa el mouse sobre el moodboard que quieres editar
3. Haz clic en el icono de lápiz (Edit)
4. Realiza tus cambios
5. Guarda los cambios

### Crear y Usar Plantillas:

1. **Crear Plantilla**
   - Organiza tu moodboard como desees
   - Haz clic en "Guardar como Plantilla"
   - Asigna nombre y descripción
   - Confirma

2. **Aplicar Plantilla**
   - En cualquier moodboard, ve al panel lateral
   - Sección "Mis Plantillas"
   - Haz clic en la plantilla que quieres usar
   - Las imágenes se reorganizan automáticamente

3. **Eliminar Plantilla**
   - Haz clic en la X junto al nombre de la plantilla
   - Confirma la eliminación

## Almacenamiento de Datos

### LocalStorage (Fallback)
- Los moodboards se guardan en `localStorage` del navegador
- Clave: `moodboard-[id]`
- Las plantillas se guardan en `templates-[userId]`

### Supabase (Cuando esté configurado)
- Tabla `moodboards`: Almacena datos del moodboard
- Tabla `projects`: Referencia al proyecto
- Sincronización automática entre localStorage y Supabase

## Estructura de Datos

### Moodboard:
```typescript
{
  id: string;
  title: string;
  description?: string;
  layout: "freeform" | "grid" | "masonry" | "collage" | "magazine" | "minimal";
  images: Array<{
    id: string;
    url: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    zIndex: number;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

### Plantilla Personalizada:
```typescript
{
  id: string;
  name: string;
  description: string;
  userId: string;
  layout: string;
  gridCols?: number;
  gap?: number;
  imagePositions: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  }>;
  createdAt: string;
}
```

## Atajos de Teclado (Futuras Mejoras)

Planeados para futuras versiones:
- `Ctrl/Cmd + S`: Guardar
- `Delete`: Eliminar imagen seleccionada
- `Ctrl/Cmd + Z`: Deshacer
- `Ctrl/Cmd + Y`: Rehacer
- `+/-`: Zoom in/out

## Solución de Problemas

### Las imágenes no se cargan:
- Verifica que el formato sea compatible (JPG, PNG, GIF, WebP)
- Verifica el tamaño del archivo (máximo recomendado: 10MB)

### Los cambios no se guardan:
- Asegúrate de hacer clic en "Guardar" antes de salir
- Verifica que el título no esté vacío
- Revisa la consola del navegador para errores

### Las plantillas no aparecen:
- Asegúrate de haber iniciado sesión
- Verifica que hayas guardado la plantilla correctamente
- Revisa localStorage en las herramientas de desarrollo

## Próximas Características

- Exportar moodboard como imagen PNG/JPG
- Compartir moodboards con otros usuarios
- Colaboración en tiempo real
- Biblioteca de imágenes integrada
- Extracción automática de paleta de colores
- Filtros y efectos de imagen
- Capas y agrupación de elementos
- Historial de versiones
