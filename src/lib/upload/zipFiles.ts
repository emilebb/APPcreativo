import { zipSync } from "fflate"

export async function zipFiles(files: File[]) {
  const entries: Record<string, Uint8Array> = {}
  
  for (const f of files) {
    const buf = new Uint8Array(await f.arrayBuffer())
    entries[f.name] = buf
  }
  
  const zipped = zipSync(entries, { level: 6 })
  return new Blob([zipped], { type: "application/zip" })
}
