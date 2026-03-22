# 🔥 Guía Completa: Configurar Firebase para CreationX

Sigue estos pasos **EN ORDEN** para que tu aplicación funcione completamente con Firebase.

---

## 📋 Requisitos Previos

- Cuenta de Google
- Acceso a Firebase Console
- Proyecto Firebase: `creationx-abd82`

---

## 🔐 PASO 1: Habilitar Authentication

### 1.1 Acceder a Authentication
1. Ve a: https://console.firebase.google.com/project/creationx-abd82/authentication
2. Click en **"Get started"** (si es la primera vez)

### 1.2 Habilitar Email/Password
1. Click en la pestaña **"Sign-in method"**
2. Click en **"Email/Password"**
3. Activa el toggle de **"Email/Password"**
4. Click en **"Save"**

### 1.3 Habilitar Google Sign-In
1. En la misma pestaña **"Sign-in method"**
2. Click en **"Google"**
3. Activa el toggle
4. Selecciona un **email de soporte** (tu email)
5. Click en **"Save"**

### 1.4 Autorizar Dominios
1. Click en la pestaña **"Settings"**
2. Scroll hasta **"Authorized domains"**
3. Verifica que estén estos dominios:
   - ✅ `localhost` (agrégalo si no está)
   - ✅ `creationx-abd82.firebaseapp.com`
   - ✅ `creationx-abd82.web.app`
4. Si falta `localhost`, click en **"Add domain"** y agrégalo

**✅ PASO 1 COMPLETADO** - Ya puedes hacer login con Google y Email/Password

---

## 💾 PASO 2: Habilitar Firestore Database

### 2.1 Crear Database
1. Ve a: https://console.firebase.google.com/project/creationx-abd82/firestore
2. Click en **"Create database"**

### 2.2 Configurar Modo
1. Selecciona **"Start in test mode"** (para desarrollo)
   - Esto permite lectura/escritura sin autenticación por 30 días
2. Click en **"Next"**

### 2.3 Seleccionar Ubicación
1. Elige la ubicación más cercana:
   - **us-central1** (Iowa) - Recomendado para América
   - **southamerica-east1** (São Paulo) - Para Sudamérica
2. Click en **"Enable"**
3. Espera unos segundos mientras se crea

### 2.4 Configurar Reglas de Seguridad (Importante)
1. Una vez creada, click en la pestaña **"Rules"**
2. Reemplaza las reglas con esto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Perfiles - solo el usuario puede leer/escribir su propio perfil
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Proyectos - solo el usuario puede leer/escribir sus proyectos
    match /projects/{projectId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null;
    }
    
    // Moodboards - solo el usuario puede leer/escribir sus moodboards
    match /moodboards/{moodboardId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null;
    }
  }
}
```

3. Click en **"Publish"**

**✅ PASO 2 COMPLETADO** - Firestore está listo para guardar datos

---

## 📦 PASO 3: Habilitar Storage

### 3.1 Crear Storage
1. Ve a: https://console.firebase.google.com/project/creationx-abd82/storage
2. Click en **"Get started"**

### 3.2 Configurar Modo
1. Selecciona **"Start in test mode"**
2. Click en **"Next"**

### 3.3 Seleccionar Ubicación
1. Usa la **misma ubicación** que elegiste para Firestore
2. Click en **"Done"**

### 3.4 Configurar Reglas de Seguridad
1. Click en la pestaña **"Rules"**
2. Reemplaza las reglas con esto:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Avatares de usuario
    match /avatars/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Imágenes de moodboards
    match /moodboards/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Imágenes de proyectos
    match /projects/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click en **"Publish"**

**✅ PASO 3 COMPLETADO** - Storage está listo para subir archivos

---

## 🧪 PASO 4: Probar la Aplicación

### 4.1 Reiniciar el Servidor
```bash
# Detén el servidor (Ctrl+C)
# Inicia de nuevo
npm run dev
```

### 4.2 Probar Login
1. Ve a: http://localhost:3000
2. Click en **"Registrarse"**
3. Prueba registrarte con:
   - Email/Password
   - Google Sign-In

### 4.3 Verificar en Firebase Console
1. Ve a Authentication → Users
2. Deberías ver tu usuario registrado
3. Ve a Firestore → Data
4. Deberías ver las colecciones creándose automáticamente

---

## ✅ Verificación Final

Marca cada uno cuando esté funcionando:

- [ ] Puedo registrarme con email/password
- [ ] Puedo iniciar sesión con Google
- [ ] No hay errores en la consola del navegador
- [ ] Los datos se guardan en Firestore
- [ ] Puedo cerrar sesión correctamente

---

## 🆘 Solución de Problemas

### Error: "auth/unauthorized-domain"
- Verifica que `localhost` esté en dominios autorizados
- Settings → Authorized domains → Add domain → `localhost`

### Error: "Bucket not found"
- Asegúrate de haber habilitado Storage (Paso 3)
- Verifica que el bucket esté creado en Storage

### Error: "Permission denied"
- Revisa las reglas de seguridad en Firestore
- Asegúrate de estar autenticado antes de hacer operaciones

### Los datos no se guardan
- Verifica que Firestore esté habilitado
- Revisa la consola del navegador para errores
- Asegúrate de que las reglas permitan escritura

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Revisa la consola de Firebase
3. Verifica que todos los servicios estén habilitados
4. Asegúrate de que las reglas de seguridad estén correctas

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu aplicación CreationX estará funcionando completamente con Firebase:

- ✅ Autenticación con Google y Email/Password
- ✅ Base de datos en tiempo real con Firestore
- ✅ Almacenamiento de archivos con Storage
- ✅ Reglas de seguridad configuradas
- ✅ Sincronización entre dispositivos

**¡Disfruta de tu aplicación!** 🚀
