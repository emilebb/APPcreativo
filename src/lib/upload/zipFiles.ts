import { zipSync } from "fflate"

export async function zipFiles(files: File[]) {
  const entries: Record<string, Uint8Array> = {}
  
  for (const f of files) {
    const buf = new Uint8Array(await f.arrayBuffer())
    entries[f.name] = buf
  }
  
  // El fix: extraemos el resultado de zipSync
  const zipped = zipSync(entries, { level: 6 })
  // Forzamos a que lo vea como un Uint8Array plano, que es compatible con BlobPart
  return new Blob([new Uint8Array(zipped)], { type: "application/zip" })
}
