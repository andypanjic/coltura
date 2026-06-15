/**
 * Knitting math — deterministic helpers for the Stage-2 calculators.
 *
 * Gauge is expressed the standard way: stitches (or rows) per 4 inches / 10 cm —
 * the number you'll find on a ball band or pattern. Lengths are inches.
 *
 * These are aids, not authorities. Cast-on and gauge conversion are exact
 * arithmetic; the yardage estimate is genuinely approximate (stitch pattern,
 * tension, and blocking all move the real number), so it's labelled as such and
 * pads the buy-quantity with a margin.
 */

export interface CastOnOptions {
  /** Round to a whole multiple (e.g. a stitch-pattern repeat). */
  multipleOf?: number;
  /** Extra edge / selvedge / seam stitches added after rounding. */
  edgeStitches?: number;
}

/** Cast-on stitches for a target width at a given stitch gauge (sts per 4"). */
export function castOnStitches(
  gaugeStsPer4in: number,
  widthInches: number,
  opts: CastOnOptions = {},
): number {
  if (gaugeStsPer4in <= 0 || widthInches <= 0) return 0;
  const stsPerInch = gaugeStsPer4in / 4;
  let sts = Math.round(widthInches * stsPerInch);

  const { multipleOf, edgeStitches = 0 } = opts;
  if (multipleOf && multipleOf > 0) {
    sts = Math.max(multipleOf, Math.round(sts / multipleOf) * multipleOf);
  }
  return sts + edgeStitches;
}

/** Finished width (inches) a stitch count gives at a stitch gauge. */
export function widthForStitches(gaugeStsPer4in: number, stitches: number): number {
  if (gaugeStsPer4in <= 0) return 0;
  return stitches / (gaugeStsPer4in / 4);
}

/**
 * Re-figure a pattern's count for YOUR gauge, keeping the finished size the
 * same. Works for stitches (pass stitch gauges) or rows (pass row gauges).
 */
export function convertGaugeCount(
  patternGaugePer4in: number,
  yourGaugePer4in: number,
  patternCount: number,
): number {
  if (patternGaugePer4in <= 0 || patternCount <= 0) return 0;
  return Math.round(patternCount * (yourGaugePer4in / patternGaugePer4in));
}

export type StitchPattern = "stockinette" | "garter" | "ribbing" | "cables" | "lace";

/** Rough yarn consumption relative to stockinette. */
const PATTERN_FACTOR: Record<StitchPattern, number> = {
  stockinette: 1.0,
  garter: 1.3,
  ribbing: 1.2,
  cables: 1.5,
  lace: 0.9,
};

export interface YardageInput {
  gaugeStsPer4in: number;
  gaugeRowsPer4in: number;
  widthInches: number;
  heightInches: number;
  pattern?: StitchPattern;
}

export interface YardageEstimate {
  stitches: number;
  /** Best-guess yards. Approximate. */
  yards: number;
  /** Yards to actually buy: +15% margin, rounded up to the nearest 10. */
  yardsToBuy: number;
}

/**
 * Rough yarn estimate. Models a worked stitch as ~2×(stitch width + height) of
 * yarn, scaled by a stitch-pattern factor. Real usage varies a lot — treat as a
 * guide and keep the margin.
 */
export function estimateYardage(input: YardageInput): YardageEstimate {
  const { gaugeStsPer4in, gaugeRowsPer4in, widthInches, heightInches } = input;
  const pattern = input.pattern ?? "stockinette";

  if (
    gaugeStsPer4in <= 0 ||
    gaugeRowsPer4in <= 0 ||
    widthInches <= 0 ||
    heightInches <= 0
  ) {
    return { stitches: 0, yards: 0, yardsToBuy: 0 };
  }

  const stsPerInch = gaugeStsPer4in / 4;
  const rowsPerInch = gaugeRowsPer4in / 4;
  const stitchWidthIn = 1 / stsPerInch;
  const stitchHeightIn = 1 / rowsPerInch;
  const yarnPerStitchIn = 2 * (stitchWidthIn + stitchHeightIn) * PATTERN_FACTOR[pattern];

  const stitches = Math.round(widthInches * stsPerInch * heightInches * rowsPerInch);
  const yards = (stitches * yarnPerStitchIn) / 36;
  const yardsToBuy = Math.ceil((yards * 1.15) / 10) * 10;

  return { stitches, yards: Math.round(yards), yardsToBuy };
}
