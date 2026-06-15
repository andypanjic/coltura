import type { PaletteColor } from "./types";

interface OklchColor {
  l: number; // Lightness 0-1
  c: number; // Chroma 0-0.4
  h: number; // Hue 0-360
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return [r, g, b];
}

function linearRgb(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function rgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const lr = linearRgb(r);
  const lg = linearRgb(g);
  const lb = linearRgb(b);
  
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
  ];
}

export function hexToOklch(hex: string): OklchColor {
  const [r, g, b] = hexToRgb(hex);
  const [L, a, b_] = rgbToOklab(r, g, b);
  
  const c = Math.sqrt(a * a + b_ * b_);
  let h = Math.atan2(b_, a) * (180 / Math.PI);
  if (h < 0) h += 360;
  
  return {
    l: L,
    c,
    h
  };
}

export function oklchDistance(a: OklchColor, b: OklchColor): number {
  // Weight components: lightness is most perceptually important
  const lightnessWeight = 2.0;
  const chromaWeight = 1.0;
  const hueWeight = 0.5;
  
  const deltaL = Math.abs(a.l - b.l);
  const deltaC = Math.abs(a.c - b.c);
  
  // Circular hue difference
  let deltaH = Math.abs(a.h - b.h);
  if (deltaH > 180) deltaH = 360 - deltaH;
  // Normalize hue to 0-1 range
  deltaH = deltaH / 360;
  
  // For low chroma colors, hue becomes less meaningful
  const minChroma = Math.min(a.c, b.c);
  const hueRelevance = minChroma > 0.01 ? 1 : minChroma / 0.01;
  
  return Math.sqrt(
    Math.pow(deltaL * lightnessWeight, 2) +
    Math.pow(deltaC * chromaWeight, 2) +
    Math.pow(deltaH * hueWeight * hueRelevance, 2)
  );
}

export function nearestPaletteDistance(
  palette: PaletteColor[],
  targetOklch: OklchColor
): number {
  if (palette.length === 0) return Infinity;
  
  let minDistance = Infinity;
  
  for (const color of palette) {
    const colorOklch = color.oklch || hexToOklch(color.hex);
    const distance = oklchDistance(colorOklch, targetOklch);
    if (distance < minDistance) {
      minDistance = distance;
    }
  }
  
  return minDistance;
}

// Design system accent colors for color search swatches
export const ACCENT_COLORS = {
  coral: "#e08560",
  green: "#36502f",
  stone: "#9b8e78",
  gold: "#c99a3a",
  lagoon: "#1f9aa6"
} as const;