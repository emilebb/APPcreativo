# Configuración de Firebase Storage para Avatares

## 1. Habilitar Firebase Storage

1. Ve a la [Consola de Firebase](https://console.firebase.google.com)
2. Selecciona tu proyecto `creationx-abd82`
3. En el menú lateral, click en **Storage**
4. Click en **Comenzar** (Get Started)
5. Acepta las reglas de seguridad predeterminadas
6. Selecciona la ubicación (elige la más cercana a tus usuarios)
7. Click en **Listo**

## 2. Configurar Reglas de Seguridad

En la consola de Firebase Storage, ve a la pestaña **Rules** y reemplaza con:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Reglas para avatares
    match /avatars/{userId}.{extension} {
      // Permitir lectura a todos
      allow read: if true;
      
      // Permitir escritura solo al usuario autenticado dueño del avatar
      allow write: if request.auth != null 
                   && request.auth.uid == userId
                   && request.resource.size < 1 * 1024 * 1024  // Máximo 1MB
                   && request.resource.contentType.matches('image/.*');  // Solo imágenes
    }
    
    // Denegar todo lo demás
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## 3. Verificar Configuración

La aplicación ya está configurada para usar Firebase Storage automáticamente.

### Cómo funciona:

1. **Con Firebase disponible:**
   - Sube la imagen a `avatars/{userId}.{extension}`
   - Retorna la URL pública de Firebase
   - Persistente y accesible desde cualquier dispositivo

2. **Sin Firebase (fallback):**
   - Convierte la imagen a base64
   - Guarda en localStorage
   - Solo disponible en el navegador actual

### Verificar que funciona:

```javascript
// En la consola del navegador
import { storage } from '@/lib/firebase';
console.log('Firebase Storage:', storage ? '✅ Disponible' : '❌ No disponible');
```

## 4. Límites y Consideraciones

- **Tamaño máximo por imagen:** 1MB
- **Formato:** Cualquier formato de imagen (jpg, png, gif, webp, etc.)
- **Cuota gratuita de Firebase:**
  - 5GB de almacenamiento
  - 1GB/día de transferencia de descarga
  - 20,000 operaciones de descarga/día

## 5. Estructura de Archivos

```
storage/
└── avatars/
    ├── user123.jpg
    ├── user456.png
    └── user789.webp
```

Cada usuario tiene un solo archivo de avatar que se sobrescribe al subir uno nuevo.

## 6. Seguridad

✅ **Implementado:**
- Solo el usuario puede subir/actualizar su propio avatar
- Validación de tamaño (máx 1MB)
- Validación de tipo (solo imágenes)
- Lectura pública para mostrar avatares

❌ **No permitido:**
- Subir archivos que no sean imágenes
- Archivos mayores a 1MB
- Usuarios no autenticados subiendo archivos
- Usuarios modificando avatares de otros

## 7. Monitoreo

Puedes ver el uso de Storage en:
- Firebase Console → Storage → Usage
- Ver archivos subidos
- Estadísticas de almacenamiento y transferencia
