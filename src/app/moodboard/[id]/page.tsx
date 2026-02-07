"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import UploadDropzone from "@/components/UploadDropzone"

export default function MoodboardPage({ params }: { params: { id: string } }) {
  const [assets, setAssets] = useState<any[]>([])
  // Usa el cliente supabase compartido

  useEffect(() => {
    const fetchAssets = async () => {
      if (!supabase) return;
      const { data } = await supabase
        .from('assets')
        .select('*')
        .eq('project_id', params.id)
      if (data) setAssets(data)
    }
    fetchAssets()
  }, [params.id])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Tu Tablero de Ideas</h2>
      <UploadDropzone projectId={params.id} userId="TU_USER_ID_AQUÍ" /> {/* Luego lo sacamos del auth */}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {assets.map((asset) => (
          <div key={asset.id} className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden border dark:border-zinc-700">
             {asset.type.includes('image') ? (
               <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${asset.url}`} className="object-cover w-full h-full" />
             ) : (
               <div className="flex items-center justify-center h-full text-xs p-2 text-center">{asset.name}</div>
             )}
          </div>
        ))}
      </div>
    </div>
  )
}
