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
}

const DB_NAME = "coltura";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ColturaDB>> | null = null;

function getDB() {
  if (typeof indexedDB === "undefined") {
    throw new Error("IndexedDB unavailable (are you running on the server?)");
  }
  if (!dbPromise) {
    dbPromise = openDB<ColturaDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const specimens = db.createObjectStore("specimens", { keyPath: "id" });
        specimens.createIndex("by-collection", "collection");
        specimens.createIndex("by-updated", "updatedAt");
        db.createObjectStore("materials", { keyPath: "id" });
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

/** One-tap export — the whole archive as a single JSON blob. */
export async function exportArchive(): Promise<Blob> {
  const db = await getDB();
  const data = {
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    specimens: await db.getAll("specimens"),
    materials: await db.getAll("materials"),
  };
  return new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
}
