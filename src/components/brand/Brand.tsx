/**
 * Coltura brand marks — the white phalaenopsis.
 *
 * The mark is author-drawn (see design system README). Rules:
 *  - never recolor the petals, use the outline alone, or scatter the blooms
 *  - app icon = paper spray on a lagoon squircle, gold throats
 *  - in-product = the ink spray beside the wordmark
 *  - single bloom = favicon / tight-space glyph
 *
 * SVGs live in /public/brand. Rendered as <img> for simplicity; swap to inline
 * SVG if you need currentColor theming.
 */

type MarkProps = {
  size?: number;
  className?: string;
  alt?: string;
};

/** The primary in-product mark: ink spray on paper. viewBox 64×82. */
export function OrchidSpray({ size = 26, className, alt = "" }: MarkProps) {
  return (
    <img
      src="/brand/orchid-spray.svg"
      width={size}
      height={Math.round((size * 82) / 64)}
      className={className}
      alt={alt}
      draggable={false}
    />
  );
}

/** Paper spray for teal / dark headers. */
export function OrchidSprayLight({ size = 26, className, alt = "" }: MarkProps) {
  return (
    <img
      src="/brand/orchid-spray-light.svg"
      width={size}
      height={Math.round((size * 82) / 64)}
      className={className}
      alt={alt}
      draggable={false}
    />
  );
}

/** Single bloom — favicon / tight glyph. viewBox 64×64. */
export function OrchidBloom({ size = 24, className, alt = "" }: MarkProps) {
  return (
    <img
      src="/brand/orchid-bloom.svg"
      width={size}
      height={size}
      className={className}
      alt={alt}
      draggable={false}
    />
  );
}

/** App icon: paper orchid spray on a lagoon squircle, gold throats. viewBox 120×120. */
export function AppIcon({ size = 74, className, alt = "Coltura" }: MarkProps) {
  return (
    <img
      src="/brand/coltura-app-icon.svg"
      width={size}
      height={size}
      className={className}
      alt={alt}
      draggable={false}
    />
  );
}

/** Wordmark lockup: in-product spray + "Coltura" in Newsreader. */
export function Wordmark({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <OrchidSpray size={size} />
      <span
        className="font-display text-ink-strong tracking-tight"
        style={{ fontWeight: 600, fontSize: size }}
      >
        Coltura
      </span>
    </span>
  );
}
