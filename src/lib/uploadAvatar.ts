import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Sube un avatar a Firebase Storage o localStorage como fallback
 * @param file - Archivo de imagen a subir
 * @param userId - ID del usuario
 * @returns URL de la imagen (Firebase URL o base64)
 */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  // Validar que sea una imagen
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen');
  }

  // Validar tamaño (máximo 1MB)
  if (file.size > 1024 * 1024) {
    throw new Error('La imagen debe ser menor a 1MB');
  }

  // Intentar subir a Firebase Storage
  if (storage) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `avatars/${userId}.${fileExt}`;
      const storageRef = ref(storage, fileName);

      // Subir archivo
      await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          uploadedBy: userId,
          uploadedAt: new Date().toISOString()
        }
      });

      // Obtener URL pública
      const downloadURL = await getDownloadURL(storageRef);
      
      console.log('✅ Avatar subido a Firebase Storage:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.warn('⚠️ Error al subir a Firebase Storage, usando fallback:', error);
      // Continuar con fallback a localStorage
    }
  }

  // Fallback: Convertir a base64 y guardar en localStorage
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      try {
        const base64String = reader.result as string;
        
        // Guardar en localStorage
        const avatarKey = `avatar_${userId}`;
        localStorage.setItem(avatarKey, base64String);
        
        console.log('✅ Avatar guardado en localStorage (fallback)');
        resolve(base64String);
      } catch (error) {
        reject(new Error('Error al procesar la imagen'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    // Convertir a base64
    reader.readAsDataURL(file);
  });
}
