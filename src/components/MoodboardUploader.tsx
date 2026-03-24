"use client";

import { useRef, useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { useMoodboardStore } from "@/store/useMoodboardStore";

interface MoodboardUploaderProps {
  className?: string;
}

export default function MoodboardUploader({ className = "" }: MoodboardUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { addImage, images } = useMoodboardStore();

  const processFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      Array.from(files).forEach((file, index) => {
        if (!file.type.startsWith("image/")) return;

        const url = URL.createObjectURL(file);

        // Create image to get dimensions
        const img = new window.Image();
        img.onload = () => {
          // Calculate initial size (max 250px while maintaining aspect ratio)
          const maxSize = 250;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          // Calculate position - spread images with offset
          const baseX = 100 + (images.length % 5) * 30;
          const baseY = 100 + (images.length % 5) * 30;

          addImage({
            src: url,
            x: baseX + index * 20,
            y: baseY + index * 20,
            width,
            height,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
          });
        };
        img.src = url;
      });
    },
    [addImage, images.length]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  return (
    <>
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          flex items-center justify-center gap-2 px-4 py-2
          bg-neutral-100 dark:bg-neutral-700 
          text-neutral-700 dark:text-neutral-300 
          rounded-lg cursor-pointer
          hover:bg-neutral-200 dark:hover:bg-neutral-600 
          transition-colors
          ${isDragging ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""}
          ${className}
        `}
      >
        <Upload className="w-4 h-4" />
        <span>Añadir Imágenes</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
}
