// Sistema de análisis de imágenes con IA

export interface ImageAnalysisResult {
  description: string;
  colors: string[];
  style: string;
  mood: string;
  suggestions: string[];
  elements: string[];
}

// Analizar imagen usando IA (OpenAI Vision API)
export async function analyzeImage(imageData: string): Promise<ImageAnalysisResult> {
  try {
    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageData }),
    });

    if (!response.ok) {
      throw new Error('Error al analizar imagen');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error analyzing image:', error);
    // Fallback: análisis básico sin IA
    return analyzeImageBasic(imageData);
  }
}

// Análisis básico de imagen sin IA (fallback)
function analyzeImageBasic(imageData: string): ImageAnalysisResult {
  return {
    description: 'Imagen subida por el usuario',
    colors: ['#000000', '#FFFFFF'],
    style: 'Desconocido',
    mood: 'Neutral',
    suggestions: [
      'Considera agregar más contraste',
      'Prueba diferentes composiciones',
      'Experimenta con la iluminación'
    ],
    elements: ['Imagen', 'Contenido visual']
  };
}

// Extraer colores dominantes de una imagen
export function extractColors(imageData: string): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(['#000000']);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      const colorMap: { [key: string]: number } = {};

      // Muestrear cada 10 píxeles para performance
      for (let i = 0; i < pixels.length; i += 40) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        colorMap[hex] = (colorMap[hex] || 0) + 1;
      }

      // Obtener los 5 colores más comunes
      const sortedColors = Object.entries(colorMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([color]) => color);

      resolve(sortedColors);
    };
    img.src = imageData;
  });
}

// Convertir imagen a base64
export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Redimensionar imagen para optimizar envío a IA
export function resizeImage(imageData: string, maxWidth: number = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageData);
        return;
      }

      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = imageData;
  });
}
