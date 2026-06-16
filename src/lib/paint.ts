/**
 * Watercolor color studies — the planning math a painter can't easily do by
 * hand. Deterministic and unit-tested.
 *
 * - Wash scale: a pigment thinned over paper, the way layered washes lighten.
 * - Value study: the tone (lightness) of a color — what a value sketch sees.
 * - Harmony: complement / analogous / triadic, by rotating hue on the wheel.
 */

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  return [
    parseInt(c.substring(0, 2), 16),
    parseInt(c.substring(2, 4), 16),
    parseInt(c.substring(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return [h, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

/** Warm paper to composite washes over. */
const PAPER: [number, number, number] = [250, 248, 242];

export interface Wash {
  pct: number;
  hex: string;
}

/** A pigment thinned over paper at decreasing concentration. */
export function washScale(hex: string): Wash[] {
  const [r, g, b] = hexToRgb(hex);
  return [1, 0.65, 0.4, 0.22, 0.1].map((a) => ({
    pct: Math.round(a * 100),
    hex: rgbToHex(
      a * r + (1 - a) * PAPER[0],
      a * g + (1 - a) * PAPER[1],
      a * b + (1 - a) * PAPER[2],
    ),
  }));
}

export interface ValueStudy {
  /** Grayscale equivalent (the color's tone). */
  hex: string;
  /** Lightness 0 (black) – 100 (white). */
  value: number;
}

/** The tone of a color — what a value sketch reduces it to (Rec.601 luma). */
export function valueStudy(hex: string): ValueStudy {
  const [r, g, b] = hexToRgb(hex);
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return { hex: rgbToHex(luma, luma, luma), value: Math.round((luma / 255) * 100) };
}

export interface Harmony {
  complement: string;
  analogous: [string, string];
  triadic: [string, string];
}

/** Color-wheel relationships for planning a limited palette. */
export function harmony(hex: string): Harmony {
  const [h, s, l] = rgbToHsl(...hexToRgb(hex));
  const at = (deg: number) => hslToHex(h + deg, s, l);
  return {
    complement: at(180),
    analogous: [at(-30), at(30)],
    triadic: [at(120), at(240)],
  };
}
