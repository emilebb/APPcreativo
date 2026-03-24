"use client";

import { useRef, useEffect } from "react";
import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { MoodboardImage } from "@/store/useMoodboardStore";

interface URLImageProps {
  image: MoodboardImage;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (attrs: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
  }) => void;
}

export default function URLImage({
  image,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
}: URLImageProps) {
  const imageRef = useRef<any>(null);
  
  // Usar useImage hook de react-use-konva para cargar la imagen
  const [loaded, status] = useImage(image.src, "anonymous");

  // Log para debugging
  useEffect(() => {
    if (status === "failed") {
      console.error("Failed to load image:", image.src);
    }
  }, [status, image.src]);

  // Si la imagen no cargó, no renderizar nada
  if (!loaded) {
    return null;
  }

  return (
    <KonvaImage
      ref={imageRef}
      image={loaded}
      x={image.x}
      y={image.y}
      width={image.width}
      height={image.height}
      rotation={image.rotation}
      scaleX={image.scaleX || 1}
      scaleY={image.scaleY || 1}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onDragEnd(e.target.x(), e.target.y());
      }}
      onTransformEnd={(e) => {
        const node = imageRef.current;
        if (!node) return;

        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // Reset scale y ajustar dimensions
        node.scaleX(1);
        node.scaleY(1);

        onTransformEnd({
          x: node.x(),
          y: node.y(),
          width: Math.max(50, node.width() * scaleX),
          height: Math.max(50, node.height() * scaleY),
          rotation: node.rotation(),
          scaleX: 1,
          scaleY: 1,
        });
      }}
      shadowColor={isSelected ? "#3b82f6" : undefined}
      shadowBlur={isSelected ? 10 : 0}
      shadowOpacity={isSelected ? 0.6 : 0}
    />
  );
}
