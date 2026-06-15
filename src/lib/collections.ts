/**
 * Collections are now derived from craft profiles (see crafts.ts) — this module
 * stays as the stable import surface the UI already uses. Color ENCODES the
 * collection type; it never just decorates.
 */
import { COLLECTIONS } from "./crafts";

export {
  COLLECTIONS,
  CRAFTS,
  craftForCollection,
  fieldsForCollection,
  collectionDef,
} from "./crafts";
export type { CollectionDef, CraftField, CraftProfile } from "./crafts";

/** Category chips shown on the Finds feed (All + each collection). */
export const CHIPS = ["All", ...COLLECTIONS.map((c) => c.label)] as const;
