import type { PaletteColor } from "./types";

/**
 * Extract dominant colors from image data using a simple quantization algorithm.
 * Returns the top N colors by frequency with their relative weights.
 */
export function extractColors(imageData: ImageData, count: number = 5): PaletteColor[] {
  const pixels = imageData.data;
  const colorMap = new Map<string, number>();
  
  // Quantize colors to reduce similar shades
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    
    // Skip transparent pixels
    if (a < 128) continue;
    
    // Quantize to reduce color space (group similar colors)
    const quantR = Math.floor(r / 32) * 32;
    const quantG = Math.floor(g / 32) * 32;
    const quantB = Math.floor(b / 32) * 32;
    
    const hex = `#${[quantR, quantG, quantB]
      .map(c => c.toString(16).padStart(2, '0'))
      .join('')}`;
    
    colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
  }
  
  // Sort by frequency and take top N colors
  const sorted = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count);
  
  const total = sorted.reduce((sum, [, count]) => sum + count, 0);
  
  return sorted.map(([hex, count]) => ({
    hex,
    weight: count / total
  }));
}

/**
 * Extract palette from an image file using canvas.
 * Returns a promise that resolves to the extracted colors.
 */
export function extractPaletteFromFile(file: File, maxColors: number = 5): Promise<PaletteColor[]> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve([]);
        return;
      }

      // Resize for faster processing
      const maxSize = 400;
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const colors = extractColors(imageData, maxColors);
      
      URL.revokeObjectURL(url);
      resolve(colors);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve([]);
    };
    
    img.src = url;
  });
}