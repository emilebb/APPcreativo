import { 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  AuthError
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

// Mensajes de error en español
const getErrorMessage = (error: AuthError): string => {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'Este email ya está registrado',
    'auth/invalid-email': 'Email inválido',
    'auth/operation-not-allowed': 'Operación no permitida',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/user-not-found': 'No existe una cuenta con este email',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
    'auth/popup-closed-by-user': 'Ventana de login cerrada',
    'auth/cancelled-popup-request': 'Login cancelado',
  };

  return errorMessages[error.code] || error.message;
};

// Login con Google
export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) {
    throw new Error('Firebase no está inicializado');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('✅ Usuario autenticado con Google:', result.user.email);
    return result.user;
  } catch (error: any) {
    console.error('❌ Error en autenticación con Google:', error);
    throw new Error(getErrorMessage(error));
  }
};

// Registro con email y contraseña
export const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
  if (!auth) {
    throw new Error('Firebase no está inicializado');
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Actualizar perfil con nombre si se proporciona
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }
    
    console.log('✅ Usuario registrado:', result.user.email);
    return result.user;
  } catch (error: any) {
    console.error('❌ Error en registro:', error);
    throw new Error(getErrorMessage(error));
  }
};

// Login con email y contraseña
export const signInWithEmail = async (email: string, password: string) => {
  if (!auth) {
    throw new Error('Firebase no está inicializado');
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Usuario autenticado:', result.user.email);
    return result.user;
  } catch (error: any) {
    console.error('❌ Error en login:', error);
    throw new Error(getErrorMessage(error));
  }
};

// Recuperar contraseña
export const resetPassword = async (email: string) => {
  if (!auth) {
    throw new Error('Firebase no está inicializado');
  }

  try {
    await sendPasswordResetEmail(auth, email);
    console.log('✅ Email de recuperación enviado a:', email);
  } catch (error: any) {
    console.error('❌ Error al enviar email de recuperación:', error);
    throw new Error(getErrorMessage(error));
  }
};

// Cerrar sesión
export const signOut = async () => {
  if (!auth) {
    throw new Error('Firebase no está inicializado');
  }

  try {
    await firebaseSignOut(auth);
    console.log('✅ Sesión cerrada');
  } catch (error: any) {
    console.error('❌ Error al cerrar sesión:', error);
    throw new Error(getErrorMessage(error));
  }
};

// Listener de cambios de autenticación
export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    console.warn('⚠️ Firebase no está inicializado');
    callback(null);
    return () => {};
  }
  
  return onAuthStateChanged(auth, callback);
};

export { auth };
