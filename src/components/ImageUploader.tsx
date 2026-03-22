"use client";

import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (imageData: string, file: File) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  multiple?: boolean;
}

export default function ImageUploader({
  onImageSelect,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  multiple = false
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    try {
      const file = files[0]; // Por ahora solo primera imagen

      // Validar formato
      if (!acceptedFormats.includes(file.type)) {
        throw new Error(`Formato no soportado. Usa: ${acceptedFormats.join(', ')}`);
      }

      // Validar tamaño
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        throw new Error(`La imagen debe ser menor a ${maxSizeMB}MB. Tamaño actual: ${sizeMB.toFixed(2)}MB`);
      }

      // Convertir a base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        onImageSelect(imageData, file);
      };
      reader.onerror = () => {
        throw new Error('Error al leer la imagen');
      };
      reader.readAsDataURL(file);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-neutral-300 dark:border-neutral-700 hover:border-blue-400 dark:hover:border-blue-600'
          }
          ${uploading ? 'opacity-50 cursor-wait' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={uploading}
        />

        <div className="flex flex-col items-center gap-4">
          {uploading ? (
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          ) : (
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          )}

          <div>
            <p className="text-lg font-medium text-neutral-900 dark:text-white mb-1">
              {uploading ? 'Subiendo imagen...' : 'Sube una imagen'}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Arrastra y suelta o haz clic para seleccionar
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
              Máximo {maxSizeMB}MB • Formatos: JPG, PNG, WebP, GIF
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <X className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
