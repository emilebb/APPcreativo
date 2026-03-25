/**
 * Diagnóstico de conexión con Supabase
 * Ejecuta pruebas básicas para identificar problemas
 */

import { supabase } from './supabase'

export async function testSupabaseConnection(): Promise<{
  success: boolean
  results: Record<string, any>
  errors: string[]
}> {
  const results: Record<string, any> = {}
  const errors: string[] = []

  try {
    // 1. Test de conexión básica (sin auth)
    console.log('🔍 Probando conexión básica...');
    console.log('📡 Usando URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔑 Usando Anon Key (comienzo):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
    
    const { data: health, error: healthError } = await supabase
      .from('projects') // Cambiado de 'proyectos' a 'projects' basado en el esquema visto en CREATE_PROJECTS_TABLE.sql
      .select('count')
      .limit(1)
      .single()
    
    if (healthError) {
      errors.push(`Conexión básica: ${healthError.message}`)
      results.basic = { success: false, error: healthError.message }
    } else {
      results.basic = { success: true, data: health }
    }

    // 2. Test de autenticación (simular signUp sin crear usuario)
    console.log('🔍 Probando servicio de autenticación...')
    const testEmail = `test-${Date.now()}@example.com`
    const { error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'test-password-123',
      options: { emailRedirectTo: window.location.origin }
    })

    // Error esperado: usuario no creado (email no confirmado)
    if (authError && authError.message.includes('Email rate limit')) {
      results.auth = { success: true, note: 'Auth responde (rate limit esperado)' }
    } else if (authError) {
      errors.push(`Auth: ${authError.message}`)
      results.auth = { success: false, error: authError.message }
    } else {
      results.auth = { success: true, note: 'Auth responde (usuario creado)' }
    }

    // 3. Test de storage
    console.log('🔍 Probando storage...')
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets()
    
    if (storageError) {
      errors.push(`Storage: ${storageError.message}`)
      results.storage = { success: false, error: storageError.message }
    } else {
      const assetsBucket = buckets?.find(b => b.name === 'assets')
      const uploadsBucket = buckets?.find(b => b.name === 'uploads')
      results.storage = { 
        success: true, 
        buckets: buckets?.map(b => b.name),
        assetsExists: !!assetsBucket,
        assetsPublic: assetsBucket?.public,
        uploadsExists: !!uploadsBucket,
        uploadsPublic: uploadsBucket?.public
      }
      if (!assetsBucket) errors.push('Falta el bucket "assets" en Storage');
      if (!uploadsBucket) errors.push('Falta el bucket "uploads" en Storage');
    }

    return {
      success: errors.length === 0,
      results,
      errors
    }

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    errors.push(`Error inesperado: ${message}`)
    return {
      success: false,
      results,
      errors
    }
  }
}