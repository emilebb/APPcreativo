"use client"
import { zipFiles } from "@/lib/upload/zipFiles"
import { Download } from "lucide-react"

export default function ExportProject({ assets, projectName }: { assets: any[], projectName: string }) {
  const handleExport = async () => {
    const filesToZip = await Promise.all(
      assets.map(async (a) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${a.url}`)
        const blob = await res.blob()
        return new File([blob], a.name, { type: a.type })
      })
    )

    const zipBlob = await zipFiles(filesToZip)
    const link = document.createElement("a")
    link.href = URL.createObjectURL(zipBlob)
    link.download = `${projectName.replace(/\s+/g, '_')}_bundle.zip`
    link.click()
  }

  return (
    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
      <Download size={18} />
      <span>Exportar Proyecto (.zip)</span>
    </button>
  )
}
