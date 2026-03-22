/**
 * Script de verificación de Firebase
 * Ejecuta esto para verificar que Firebase está configurado correctamente
 */

import { auth, db, googleProvider } from '@/lib/firebase';

export async function verifyFirebaseSetup() {
  const results = {
    auth: false,
    firestore: false,
    googleProvider: false,
    errors: [] as string[]
  };

  // Verificar Auth
  try {
    if (auth) {
      results.auth = true;
      console.log('✅ Firebase Auth inicializado correctamente');
    } else {
      results.errors.push('❌ Firebase Auth no está inicializado');
    }
  } catch (error: any) {
    results.errors.push(`❌ Error en Auth: ${error.message}`);
  }

  // Verificar Firestore
  try {
    if (db) {
      results.firestore = true;
      console.log('✅ Firestore inicializado correctamente');
    } else {
      results.errors.push('❌ Firestore no está inicializado');
    }
  } catch (error: any) {
    results.errors.push(`❌ Error en Firestore: ${error.message}`);
  }

  // Verificar Google Provider
  try {
    if (googleProvider) {
      results.googleProvider = true;
      console.log('✅ Google Provider configurado correctamente');
    } else {
      results.errors.push('❌ Google Provider no está configurado');
    }
  } catch (error: any) {
    results.errors.push(`❌ Error en Google Provider: ${error.message}`);
  }

  // Resumen
  console.log('\n📊 Resumen de Verificación:');
  console.log('Auth:', results.auth ? '✅' : '❌');
  console.log('Firestore:', results.firestore ? '✅' : '❌');
  console.log('Google Provider:', results.googleProvider ? '✅' : '❌');

  if (results.errors.length > 0) {
    console.log('\n⚠️ Errores encontrados:');
    results.errors.forEach(error => console.log(error));
  } else {
    console.log('\n🎉 ¡Firebase está configurado correctamente!');
  }

  return results;
}

// Para usar en la consola del navegador
if (typeof window !== 'undefined') {
  (window as any).verifyFirebase = verifyFirebaseSetup;
}
