/**
 * Craft profiles — the Stage-3 generalization.
 *
 * The craft-agnostic core (capture, media, palette, search, notes) never needs
 * to know about a specific craft. A craft profile is pure config: the
 * collections it contributes and the extra structured fields its specimens
 * carry. Adding a new craft (watercolor below is the canonical example) is a new
 * entry here plus, at most, a few field defs — no changes to capture/search/etc.
 */
import type { CollectionKind } from "./types";

export interface CraftField {
  /** Stored under Specimen.fields[key]. */
  key: string;
  label: string;
  type: "text" | "number" | "select";
  /** Options for type: "select". */
  options?: string[];
  placeholder?: string;
  hint?: string;
}

export interface CollectionDef {
  kind: CollectionKind;
  label: string;
  /** CSS var encoding the collection — color is meaning, not decoration. */
  accent: string;
}

export interface CraftProfile {
  id: string;
  label: string;
  collections: CollectionDef[];
  /** Craft-specific fields captured into Specimen.fields. */
  fields: CraftField[];
}

export const CRAFTS: CraftProfile[] = [
  {
    id: "general",
    label: "General",
    collections: [
      { kind: "bouquets", label: "Bouquets", accent: "var(--coral)" },
      { kind: "foraged", label: "Foraged", accent: "var(--green)" },
      { kind: "pressings", label: "Pressings", accent: "var(--stone)" },
      { kind: "ceramics", label: "Ceramics", accent: "var(--gold)" },
    ],
    fields: [],
  },
  {
    id: "knitting",
    label: "Knitting",
    collections: [{ kind: "knitting", label: "Knitting", accent: "var(--lagoon)" }],
    fields: [
      { key: "yarn", label: "Yarn", type: "text", placeholder: "e.g. Malabrigo Rios" },
      { key: "needles", label: "Needles", type: "text", placeholder: "e.g. US 7 / 4.5 mm" },
      { key: "gauge", label: "Gauge", type: "text", placeholder: "e.g. 18 sts / 4 in" },
    ],
  },
  {
    // Canonical Stage-3 proof: a whole new craft, added as config + fields only.
    id: "watercolor",
    label: "Watercolor",
    collections: [{ kind: "watercolors", label: "Watercolors", accent: "var(--wine)" }],
    fields: [
      { key: "paper", label: "Paper", type: "text", placeholder: "e.g. cold-press 140 lb" },
      {
        key: "technique",
        label: "Technique",
        type: "select",
        options: ["Wet-on-wet", "Wet-on-dry", "Dry brush", "Glazing", "Lifting"],
      },
      { key: "pigments", label: "Pigments", type: "text", placeholder: "e.g. ultramarine, burnt sienna" },
    ],
  },
];

/** All collections across every craft, in profile order. */
export const COLLECTIONS: CollectionDef[] = CRAFTS.flatMap((c) => c.collections);

/** The craft profile that owns a given collection. */
export function craftForCollection(kind: CollectionKind): CraftProfile | undefined {
  return CRAFTS.find((c) => c.collections.some((col) => col.kind === kind));
}

/** Craft-specific fields for a collection (empty for the general craft). */
export function fieldsForCollection(kind: CollectionKind): CraftField[] {
  return craftForCollection(kind)?.fields ?? [];
}

/** The definition (label/accent) for a collection kind. */
export function collectionDef(kind: CollectionKind): CollectionDef | undefined {
  return COLLECTIONS.find((c) => c.kind === kind);
}
