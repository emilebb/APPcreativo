import { zipSync, strToU8 } from "fflate";

export async function processFile(file: File): Promise<Blob | File> {
  // 1. Si es imagen, comprimir a menos de 1MB
  if (file.type.startsWith("image/")) {
    // Dynamic import to avoid SSR issues with browser-image-compression
    if (typeof window !== 'undefined') {
      const imageCompression = (await import("browser-image-compression")).default;
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
      return await imageCompression(file, options);
    } else {
      // Fallback for SSR - return original file
      return file;
    }
  }
  
  // 2. Si es muy pesado (> 5MB) y no es imagen, empaquetarlo en ZIP
  if (file.size > 5 * 1024 * 1024) {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const zipped = zipSync({ [file.name]: buffer }, { level: 6 });
    // Asegura que zipped sea un Uint8Array compatible con Blob
    return new Blob([new Uint8Array(zipped)], { type: "application/zip" });
  }

  return file;
}
