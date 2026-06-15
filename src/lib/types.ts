/**
 * Coltura domain model — the craft-agnostic core.
 *
 * Everything is built generically so a new craft profile (watercolor, ceramics…)
 * is a config + a few fields, not a rewrite. Knitting is the depth focus, so it
 * gets the only specialized profile at launch.
 *
 * The atomic unit is a Specimen: a photograph and a quiet label.
 */

/**
 * A collection's kind. Open by design (Stage 3): the real set lives in the
 * craft profiles (crafts.ts), so adding a craft never edits this type. Known
 * kinds today: knitting, watercolors.
 */
export type CollectionKind = string;

/**
 * Status lifecycle. Open by design — the vocabulary is craft-specific and lives
 * in the craft profiles (crafts.ts): e.g. knitting is Queued / In progress /
 * Finished / Frogged; watercolor is Sketch / In progress / Finished / Set aside.
 */
export type SpecimenStatus = string;

/** An extracted color — "the color it kept". Stored as hex + perceptual coords. */
export interface PaletteColor {
  hex: string;
  /** OKLCH for perceptual color-distance matching (search-by-color). */
  oklch?: { l: number; c: number; h: number };
  weight?: number; // share of the image, 0..1
}

export interface MediaItem {
  id: string;
  /** The captured image is the source of truth. Stored as a blob/object URL. */
  url: string;
  capturedAt: string; // ISO
  caption?: string;
}

/** Handwritten note: image + (fallible, editable) transcription + extracted entities. */
export interface Note {
  id: string;
  imageUrl: string; // original — always the source of truth
  transcript?: string; // editable; shown next to the original
  entities?: Record<string, string>; // yarn, needle size, gauge, mods, dates…
  createdAt: string;
}

/** The atomic captured find. */
export interface Specimen {
  id: string;
  name: string;
  collection: CollectionKind;
  status?: SpecimenStatus;
  date?: string; // ISO; the find date
  place?: string;
  recipient?: string;
  tags: string[];
  notes: Note[];
  media: MediaItem[];
  palette: PaletteColor[]; // "the color it kept"
  /** Free-form text for lightweight profiles; structured fields live in `fields`. */
  body?: string;
  /** Craft-profile-specific fields (e.g. knitting: gauge, mods, techniques). */
  fields?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/** A named grouping of specimens — a "shelf". */
export interface Collection {
  id: string;
  kind: CollectionKind;
  title: string;
  count?: number;
}

/** Reusable material referenced by specimens (knitting: yarn). */
export interface Material {
  id: string;
  name: string;
  kind: "yarn" | "paint" | "other";
  quantity?: number;
  source?: string;
  cost?: number;
  location?: string;
  imageUrl?: string;
  palette?: PaletteColor[];
  // knitting yarn specifics
  fiber?: string;
  weight?: number; // 0 lace … 7 jumbo
  yardage?: number;
  dyeLot?: string;
  colorway?: string;
}
