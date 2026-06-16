"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  CRAFTS as BUILTIN_CRAFTS,
  type CraftProfile,
  type CollectionDef,
  type CraftField,
} from "@/lib/crafts";
import { allCustomCrafts } from "@/lib/db";

interface CraftsContextValue {
  crafts: CraftProfile[];
  customCrafts: CraftProfile[];
  collections: CollectionDef[];
  chips: string[];
  collectionDef: (kind: string) => CollectionDef | undefined;
  craftForCollection: (kind: string) => CraftProfile | undefined;
  fieldsForCollection: (kind: string) => CraftField[];
  statusesForCollection: (kind: string) => string[];
  reload: () => Promise<void>;
}

const CraftsContext = createContext<CraftsContextValue | null>(null);

/**
 * Loads user-created crafts from IndexedDB and merges them with the built-in
 * defaults (knitting, watercolor). Every screen reads crafts through this so
 * an added hobby gets the same capture / browse / search / status machinery.
 */
export function CraftsProvider({ children }: { children: React.ReactNode }) {
  const [customCrafts, setCustomCrafts] = useState<CraftProfile[]>([]);

  const reload = useCallback(async () => {
    try {
      setCustomCrafts(await allCustomCrafts());
    } catch (e) {
      console.error("Failed to load custom crafts:", e);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const crafts = [...BUILTIN_CRAFTS, ...customCrafts];
  const collections = crafts.flatMap((c) => c.collections);
  const craftForCollection = (kind: string) =>
    crafts.find((c) => c.collections.some((col) => col.kind === kind));

  const value: CraftsContextValue = {
    crafts,
    customCrafts,
    collections,
    chips: ["All", ...collections.map((c) => c.label)],
    collectionDef: (kind) => collections.find((c) => c.kind === kind),
    craftForCollection,
    fieldsForCollection: (kind) => craftForCollection(kind)?.fields ?? [],
    statusesForCollection: (kind) => craftForCollection(kind)?.statuses ?? [],
    reload,
  };

  return <CraftsContext.Provider value={value}>{children}</CraftsContext.Provider>;
}

export function useCrafts(): CraftsContextValue {
  const ctx = useContext(CraftsContext);
  if (!ctx) throw new Error("useCrafts must be used within CraftsProvider");
  return ctx;
}
