/**
 * Palette match — rank stash yarns by color against a target palette
 * (e.g. extracted from an inspiration image).
 *
 * Deterministic and unit-tested: reuses the same OKLCH perceptual distance the
 * color search uses. Yarns are matched on the colors captured from their photos
 * during ball-band capture, so a yarn with no color data is skipped.
 */
import type { Material, PaletteColor } from "./types";
import { hexToOklch, oklchDistance } from "./color";

export interface YarnColorMatch {
  material: Material;
  /** Min perceptual distance across all target×yarn color pairs (lower = closer). */
  distance: number;
  /** The target (image) color that matched best. */
  targetHex: string;
  /** The yarn color that matched best. */
  yarnHex: string;
}

/**
 * Rank the stash's yarns by closeness to a target palette. Excludes non-yarn
 * materials and yarns with no captured colors. Sorted nearest-first.
 */
export function matchStashToPalette(
  stash: Material[],
  target: PaletteColor[],
): YarnColorMatch[] {
  if (target.length === 0) return [];
  const targets = target.map((c) => ({ hex: c.hex, oklch: c.oklch ?? hexToOklch(c.hex) }));

  const matches: YarnColorMatch[] = [];
  for (const m of stash) {
    if (m.kind !== "yarn" || !m.palette || m.palette.length === 0) continue;

    let best = Infinity;
    let targetHex = "";
    let yarnHex = "";
    for (const yc of m.palette) {
      const yOklch = yc.oklch ?? hexToOklch(yc.hex);
      for (const t of targets) {
        const d = oklchDistance(yOklch, t.oklch);
        if (d < best) {
          best = d;
          targetHex = t.hex;
          yarnHex = yc.hex;
        }
      }
    }
    if (best < Infinity) {
      matches.push({ material: m, distance: best, targetHex, yarnHex });
    }
  }

  return matches.sort((a, b) => a.distance - b.distance);
}

/** A friendly closeness label from a perceptual distance. */
export function closenessLabel(distance: number): string {
  if (distance < 0.08) return "very close";
  if (distance < 0.18) return "close";
  if (distance < 0.32) return "in the family";
  return "distant";
}
