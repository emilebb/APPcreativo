# 🔥 Configuración de Firebase para CreationX

## ✅ Firebase Ya Configurado

El proyecto ya está configurado con Firebase y listo para usar:

**Proyecto Firebase**: `creationx-abd82`
**Auth Domain**: `creationx-abd82.firebaseapp.com`

## 📋 Variables de Entorno (Opcional)

Las credenciales ya están incluidas en el código como fallback, pero puedes crear un archivo `.env.local` para mayor seguridad:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDOh4LbA8v3tgg7lVI-fmcOfUEeOLbjgbM
NEXT_PUBLIC_FIREBASE_APP_ID=1:425259247669:web:9f8ac519ad480d836d297c
```

**Nota**: Puedes copiar el contenido de `ENV_TEMPLATE.txt` para crear tu `.env.local`

## 🔐 Configurar Autenticación con Google

1. En Firebase Console, ve a **Authentication**
2. Click en **Get Started**
3. En la pestaña **Sign-in method**, habilita **Google**
4. Configura el OAuth consent screen si es necesario
5. Agrega tu dominio autorizado (localhost:3000 para desarrollo)

## 💾 Configurar Firestore Database

1. En Firebase Console, ve a **Firestore Database**
2. Click en **Create database**
3. Selecciona **Start in test mode** (para desarrollo)
4. Elige la ubicación más cercana a tus usuarios

## 📁 Estructura de Colecciones

El sistema creará automáticamente estas colecciones:

- **projects**: Proyectos de los usuarios
- **moodboards**: Moodboards con imágenes y layouts
- **profiles**: Perfiles de usuario con configuraciones

## 🚀 Iniciar la Aplicación

Una vez configurado el `.env.local`:

```bash
npm run dev
```

## ✅ Verificar que Funciona

Abre la consola del navegador y deberías ver:
```
🔥 Firebase initialized: { projectId: 'creationx-490904', ... }
```

## 🔄 Migración desde localStorage

Los datos actuales en localStorage se mantendrán hasta que inicies sesión con Google. Una vez autenticado, puedes migrar manualmente los datos o empezar desde cero.

## 🆘 Soporte

Si tienes problemas:
1. Verifica que las variables de entorno estén correctas
2. Asegúrate de que Firebase esté habilitado en la consola
3. Revisa la consola del navegador para errores específicos
