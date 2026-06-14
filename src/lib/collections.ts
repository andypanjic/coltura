import type { CollectionKind } from "./types";

/**
 * Collection definitions. Color ENCODES the collection type — it never just
 * decorates. These accent tokens come straight from the design system.
 */
export const COLLECTIONS: {
  kind: CollectionKind;
  label: string;
  /** CSS var name for the encoded accent dot. */
  accent: string;
}[] = [
  { kind: "bouquets", label: "Bouquets", accent: "var(--coral)" },
  { kind: "foraged", label: "Foraged", accent: "var(--green)" },
  { kind: "pressings", label: "Pressings", accent: "var(--stone)" },
  { kind: "knitting", label: "Knitting", accent: "var(--lagoon)" },
  { kind: "ceramics", label: "Ceramics", accent: "var(--gold)" },
];

/** Category chips shown on the Finds feed (All + each collection). */
export const CHIPS = ["All", ...COLLECTIONS.map((c) => c.label)] as const;
