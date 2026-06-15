"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { allMaterials } from "@/lib/db";
import type { Material } from "@/lib/types";

const YARN_WEIGHT_LABELS = ["Lace", "Fingering", "Sport", "DK", "Worsted", "Bulky", "Super bulky", "Jumbo"];

function MaterialCard({ material }: { material: Material }) {
  const weightLabel = material.weight !== undefined ? YARN_WEIGHT_LABELS[material.weight] : "";
  
  return (
    <article className="group overflow-hidden rounded-card border border-rule bg-paper-white transition-colors duration-1 hover:bg-paper-wash">
      {material.imageUrl && (
        <div className="relative aspect-square overflow-hidden bg-paper">
          <img 
            src={material.imageUrl} 
            alt={material.name}
            className="h-full w-full object-cover"
          />
          {material.palette && material.palette.length > 0 && (
            <div className="absolute bottom-2 left-2 flex gap-0.5 rounded-pill border border-rule bg-paper-white/90 px-1.5 py-1 backdrop-blur-sm">
              {material.palette.slice(0, 3).map((color, i) => (
                <div
                  key={i}
                  className="h-3 w-3 rounded-full border border-rule-soft"
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="px-4 py-3">
        <h3 className="font-display text-base font-medium tracking-tight text-ink">
          {material.name}
        </h3>
        
        <div className="mt-1 space-y-0.5">
          {material.colorway && (
            <p className="font-mono text-xs uppercase text-fg-muted">
              {material.colorway}
            </p>
          )}
          
          {(material.fiber || weightLabel) && (
            <p className="text-xs text-fg-quiet">
              {[material.fiber, weightLabel].filter(Boolean).join(' · ')}
            </p>
          )}
          
          {material.yardage && (
            <p className="font-mono text-xs text-fg-quiet">
              {material.yardage} yards
              {material.quantity && material.quantity > 1 && ` × ${material.quantity}`}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default function StashPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const data = await allMaterials();
        // Filter for yarn materials (knitting stash)
        const yarnMaterials = data.filter(m => m.kind === "yarn");
        setMaterials(yarnMaterials);
      } catch (error) {
        console.error("Failed to load materials:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMaterials();
  }, []);

  const filteredMaterials = materials.filter(material => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      material.name.toLowerCase().includes(query) ||
      material.colorway?.toLowerCase().includes(query) ||
      material.fiber?.toLowerCase().includes(query) ||
      material.source?.toLowerCase().includes(query)
    );
  });

  const totalYardage = materials.reduce((sum, m) => {
    const yardage = m.yardage || 0;
    const quantity = m.quantity || 1;
    return sum + (yardage * quantity);
  }, 0);

  const metaText = `${materials.length} yarn${materials.length !== 1 ? 's' : ''} · ${totalYardage.toLocaleString()} total yards`;

  return (
    <>
      <AppHeader title="Yarn stash" meta={metaText} />

      <section className="px-5 py-4">
        <div className="mb-4">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, fiber, color…"
            className="w-full rounded-input border border-rule bg-paper-white px-3 py-2 text-sm placeholder:italic placeholder:text-fg-faint focus:border-lagoon focus:outline-none"
          />
        </div>

        {isLoading ? (
          <div className="rounded-card border border-dashed border-rule-strong bg-paper-edge px-6 py-12 text-center">
            <p className="font-display text-lg italic text-fg-muted">Loading stash…</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="rounded-card border border-dashed border-rule-strong bg-paper-edge px-6 py-12 text-center">
            <p className="font-display text-lg italic text-fg-muted">
              {searchQuery ? "No yarns match that." : "No yarns stashed yet."}
            </p>
            <p className="mx-auto mt-2 max-w-[34ch] text-sm leading-body text-fg-quiet">
              {searchQuery 
                ? "Try different search terms or add new yarns to your stash."
                : "Photograph a ball band to catalog your yarns with OCR extraction."}
            </p>
            {!searchQuery && (
              <Link
                href="/stash/new"
                className="mt-4 inline-block rounded-input border border-lagoon-strong bg-lagoon px-5 py-2.5 text-sm font-medium text-fg-on-ink transition-colors duration-1 ease-ease hover:bg-lagoon-strong"
              >
                Add first yarn
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredMaterials.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        )}

        <Link
          href="/stash/new"
          className="fixed bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full border border-lagoon-strong bg-lagoon text-fg-on-ink shadow-md transition-all duration-1 hover:bg-lagoon-strong hover:scale-105"
          aria-label="Add yarn to stash"
        >
          <Plus size={24} strokeWidth={1.5} />
        </Link>
      </section>
    </>
  );
}