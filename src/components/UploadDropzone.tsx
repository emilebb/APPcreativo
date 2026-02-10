"use client"
import { useState } from "react"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { processFile } from "@/lib/upload/mediaHandler"
import { Upload, Loader2, FileCheck } from "lucide-react"

export default function UploadDropzone({ projectId, userId }: { projectId: string, userId: string }) {
  const [loading, setLoading] = useState(false)
  // Usa el cliente supabase compartido

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase no está configurado");
      
      const processed = await processFile(file)
      const fileName = `${userId}/${projectId}/${Date.now()}-${file.name}`
      // 1. Subir a Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('uploads')
        .upload(fileName, processed)

      if (storageError) throw storageError

      // 2. Registrar en DB
      const { error: dbError } = await supabase.from('assets').insert({
        user_id: userId,
        project_id: projectId,
        type: file.type,
        name: file.name,
        url: storageData.path
      } as any) // Use any type to avoid TypeScript errors

      if (dbError) throw dbError
      alert("Archivo listo y optimizado")
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-900 border-gray-300 dark:border-zinc-700">
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        {loading ? <Loader2 className="animate-spin text-blue-500" /> : <Upload className="mb-2 text-gray-400" />}
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          {loading ? "Optimizando..." : "Suelta archivos o haz clic"}
        </p>
      </div>
      <input type="file" className="hidden" onChange={handleUpload} disabled={loading} />
    </label>
  )
}
