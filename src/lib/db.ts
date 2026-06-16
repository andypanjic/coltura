/**
 * Local-first storage (IndexedDB via `idb`).
 *
 * Non-negotiable per the brief: local-first + one-tap export from day one.
 * Makers have a real, post-Ravelry fear of lock-in — owning your data is a feature.
 *
 * This is a thin starting layer. Cloud sync is optional and added later;
 * the source of truth always lives on the device.
 */
import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Specimen, Material } from "./types";
import type { CraftProfile } from "./crafts";

interface ColturaDB extends DBSchema {
  specimens: {
    key: string;
    value: Specimen;
    indexes: { "by-collection": string; "by-updated": string };
  };
  materials: {
    key: string;
    value: Material;
  };
  crafts: {
    key: string;
    value: CraftProfile;
  };
}

const DB_NAME = "coltura";
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<ColturaDB>> | null = null;

function getDB() {
  if (typeof indexedDB === "undefined") {
    throw new Error("IndexedDB unavailable (are you running on the server?)");
  }
  if (!dbPromise) {
    dbPromise = openDB<ColturaDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const specimens = db.createObjectStore("specimens", { keyPath: "id" });
          specimens.createIndex("by-collection", "collection");
          specimens.createIndex("by-updated", "updatedAt");
          db.createObjectStore("materials", { keyPath: "id" });
        }
        if (oldVersion < 2) {
          // User-created craft profiles (knitting + watercolor stay built-in).
          db.createObjectStore("crafts", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export async function allSpecimens(): Promise<Specimen[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex("specimens", "by-updated");
  return all.reverse(); // most-recent first
}

export async function getSpecimen(id: string): Promise<Specimen | undefined> {
  return (await getDB()).get("specimens", id);
}

export async function putSpecimen(s: Specimen): Promise<void> {
  await (await getDB()).put("specimens", s);
}

export async function specimensByCollection(kind: string): Promise<Specimen[]> {
  return (await getDB()).getAllFromIndex("specimens", "by-collection", kind);
}

export async function allMaterials(): Promise<Material[]> {
  const db = await getDB();
  return db.getAll("materials");
}

export async function getMaterial(id: string): Promise<Material | undefined> {
  return (await getDB()).get("materials", id);
}

export async function putMaterial(m: Material): Promise<void> {
  await (await getDB()).put("materials", m);
}

/** User-created craft profiles (merged with the built-in defaults at runtime). */
export async function allCustomCrafts(): Promise<CraftProfile[]> {
  return (await getDB()).getAll("crafts");
}

export async function putCustomCraft(c: CraftProfile): Promise<void> {
  await (await getDB()).put("crafts", c);
}

export async function deleteCustomCraft(id: string): Promise<void> {
  await (await getDB()).delete("crafts", id);
}

/** One-tap export — the whole archive as a single JSON blob. */
export async function exportArchive(): Promise<Blob> {
  const db = await getDB();
  const data = {
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    specimens: await db.getAll("specimens"),
    materials: await db.getAll("materials"),
    crafts: await db.getAll("crafts"),
  };
  return new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
}

export interface ImportResult {
  specimens: number;
  materials: number;
  crafts: number;
}

/**
 * Restore from an exported archive (the JSON `exportArchive` produces).
 * Upserts by id — a merge, never a wipe — so importing onto an existing
 * archive is safe and re-importing is idempotent. Throws on malformed input.
 */
export async function importArchive(json: string): Promise<ImportResult> {
  let data: { specimens?: Specimen[]; materials?: Material[]; crafts?: CraftProfile[] };
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  if (!data || (!Array.isArray(data.specimens) && !Array.isArray(data.materials))) {
    throw new Error("That doesn't look like a Coltura export.");
  }

  const db = await getDB();
  let specimens = 0;
  let materials = 0;
  let crafts = 0;

  if (Array.isArray(data.specimens)) {
    const tx = db.transaction("specimens", "readwrite");
    for (const s of data.specimens) {
      if (s && typeof s.id === "string") {
        await tx.store.put(s);
        specimens++;
      }
    }
    await tx.done;
  }

  if (Array.isArray(data.materials)) {
    const tx = db.transaction("materials", "readwrite");
    for (const m of data.materials) {
      if (m && typeof m.id === "string") {
        await tx.store.put(m);
        materials++;
      }
    }
    await tx.done;
  }

  if (Array.isArray(data.crafts)) {
    const tx = db.transaction("crafts", "readwrite");
    for (const c of data.crafts) {
      if (c && typeof c.id === "string") {
        await tx.store.put(c);
        crafts++;
      }
    }
    await tx.done;
  }

  return { specimens, materials, crafts };
}
