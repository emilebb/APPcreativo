/**
 * storageService - Servicios para Supabase Storage
 * Subida de imágenes al bucket 'assets' (público)
 */

import { supabase } from './supabase'

/**
 * Sube una imagen al bucket 'assets' de Supabase Storage
 * @param file Archivo de imagen a subir
 * @param userId ID del usuario (para organizar en carpetas)
 * @returns URL pública de la imagen subida
 */
export const uploadImage = async (file: File, userId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  // Subir el archivo al Bucket 'assets'
  const { data, error } = await supabase.storage
    .from('assets')
    .upload(filePath, file)

  if (error) {
    console.error('Error subiendo imagen:', error)
    throw error
  }

  // Obtener la URL pública para guardarla en tu tabla de 'moodboard_items'
  const { data: { publicUrl } } = supabase.storage
    .from('assets')
    .getPublicUrl(filePath)

  return publicUrl
}

/**
 * Elimina una imagen del bucket 'assets'
 * @param filePath Ruta completa de la imagen (userId/filename)
 */
export const deleteImage = async (filePath: string): Promise<void> => {
  const { error } = await supabase.storage
    .from('assets')
    .remove([filePath])

  if (error) {
    console.error('Error eliminando imagen:', error)
    throw error
  }
}

/**
 * Obtiene la URL pública de una imagen existente
 * @param filePath Ruta de la imagen
 * @returns URL pública
 */
export const getPublicImageUrl = (filePath: string): string => {
  const { data: { publicUrl } } = supabase.storage
    .from('assets')
    .getPublicUrl(filePath)
  
  return publicUrl
}