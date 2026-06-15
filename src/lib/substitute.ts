/**
 * Yarn substitution — rank stash yarns against a pattern's requirements.
 *
 * Bridges the stash (captured via ball-band OCR) and the calculators: given a
 * pattern's yarn weight, total yardage, and optional fiber, score each stash
 * yarn by how well it fits and whether you actually have enough.
 *
 * Deterministic and unit-tested. Like the calculators, an aid not an authority —
 * substituting yarn always wants a gauge swatch.
 */
import type { Material } from "./types";

/** Standard weight scale, index = the 0–7 weight number. */
export const YARN_WEIGHTS = [
  "Lace",
  "Fingering",
  "Sport",
  "DK",
  "Worsted",
  "Bulky",
  "Super bulky",
  "Jumbo",
] as const;

export interface SubstitutionCriteria {
  /** Target yarn weight, 0 (lace) – 7 (jumbo). */
  weight?: number;
  /** Total yards the project needs. */
  yardageNeeded?: number;
  /** Fiber keyword to prefer (e.g. "wool", "merino"). */
  fiber?: string;
}

export interface SubstitutionMatch {
  material: Material;
  /** 0–100, higher = better fit. */
  score: number;
  /** Total yards on hand = yardage × quantity. */
  availableYards: number;
  /** Whether on-hand yardage covers the need (null if either is unknown). */
  enoughYardage: boolean | null;
  /** |material weight − target| (null if either is unknown). */
  weightDelta: number | null;
  /** Whether the fiber matched the keyword (null if not compared). */
  fiberMatch: boolean | null;
  /** Human-readable rationale for the UI. */
  reasons: string[];
}

/** Total yards on hand for a material (per-skein yardage × quantity). */
export function availableYards(m: Material): number {
  return (m.yardage ?? 0) * (m.quantity ?? 1);
}

/**
 * Rank the stash's yarns against the criteria. Non-yarn materials are excluded.
 * Scoring: weight ≤50, yardage ≤40, fiber ≤10.
 */
export function substituteYarn(
  stash: Material[],
  criteria: SubstitutionCriteria,
): SubstitutionMatch[] {
  const yarns = stash.filter((m) => m.kind === "yarn");
  const { weight, yardageNeeded, fiber } = criteria;
  const wantFiber = fiber?.trim().toLowerCase() ?? "";

  const matches = yarns.map((m): SubstitutionMatch => {
    const reasons: string[] = [];
    let score = 0;

    // Weight — up to 50
    let weightDelta: number | null = null;
    if (weight != null && m.weight != null) {
      weightDelta = Math.abs(m.weight - weight);
      if (weightDelta === 0) {
        score += 50;
        reasons.push("exact weight match");
      } else if (weightDelta === 1) {
        score += 30;
        reasons.push("one weight off");
      } else if (weightDelta === 2) {
        score += 12;
        reasons.push("two weights off");
      } else {
        reasons.push("weight quite different");
      }
    } else if (weight != null) {
      score += 15;
      reasons.push("weight unknown");
    }

    // Yardage — up to 40
    const avail = availableYards(m);
    let enoughYardage: boolean | null = null;
    if (yardageNeeded != null && yardageNeeded > 0) {
      if (avail > 0) {
        enoughYardage = avail >= yardageNeeded;
        if (enoughYardage) {
          score += 40;
          reasons.push(`enough yardage (${avail} ≥ ${yardageNeeded} yds)`);
        } else {
          score += Math.round(40 * (avail / yardageNeeded));
          reasons.push(`short ${yardageNeeded - avail} yds`);
        }
      } else {
        reasons.push("yardage unknown");
      }
    }

    // Fiber — up to 10
    let fiberMatch: boolean | null = null;
    if (wantFiber && m.fiber) {
      const have = m.fiber.toLowerCase();
      fiberMatch = have.includes(wantFiber) || wantFiber.includes(have);
      if (fiberMatch) {
        score += 10;
        reasons.push("fiber matches");
      }
    }

    return {
      material: m,
      score,
      availableYards: avail,
      enoughYardage,
      weightDelta,
      fiberMatch,
      reasons,
    };
  });

  return matches.sort(
    (a, b) => b.score - a.score || b.availableYards - a.availableYards,
  );
}
