"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app/AppHeader";
import { SpecimenCard } from "@/components/app/SpecimenCard";
import { OrchidSpray } from "@/components/brand/Brand";
import { useCrafts } from "@/components/app/CraftsProvider";
import { allSpecimens } from "@/lib/db";
import type { Specimen } from "@/lib/types";

function CategoryChips({ 
  activeCategory, 
  onCategoryChange,
  specimenCount 
}: { 
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  specimenCount: number;
}) {
  const { chips } = useCrafts();

  return (
    <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
      {chips.map((chip) => {
        const isActive = chip === activeCategory;
        return (
          <button
            key={chip}
            onClick={() => onCategoryChange(chip)}
            className={`smallcaps whitespace-nowrap rounded-pill border px-3 py-1.5 text-[13px] transition-colors duration-1 ease-ease ${
              isActive
                ? "border-lagoon-strong bg-lagoon text-fg-on-ink"
                : "border-rule-strong bg-paper-white text-fg-muted hover:bg-paper-wash"
            }`}
          >
            {chip}
          </button>
        );
      })}
    </div>
  );
}

export default function FindsPage() {
  const { collections } = useCrafts();
  const [specimens, setSpecimens] = useState<Specimen[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSpecimens = async () => {
      try {
        setSpecimens(await allSpecimens());
      } catch (error) {
        console.error("Failed to load specimens:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSpecimens();
  }, []);

  const activeKind =
    activeCategory === "All" ? null : collections.find((c) => c.label === activeCategory)?.kind;
  const filteredSpecimens = activeKind
    ? specimens.filter((s) => s.collection === activeKind)
    : specimens;

  const collectionCount = new Set(specimens.map(s => s.collection)).size;
  const metaText =
    specimens.length === 0
      ? undefined
      : `${specimens.length} specimen${specimens.length !== 1 ? "s" : ""}${
          collectionCount ? ` · ${collectionCount} collection${collectionCount !== 1 ? "s" : ""}` : ""
        }`;

  return (
    <>
      <AppHeader title="Recent finds" meta={metaText}>
        <CategoryChips 
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          specimenCount={specimens.length}
        />
      </AppHeader>

      <section className="px-5 py-4">
        {isLoading ? (
          <div className="mx-auto max-w-lg rounded-card border border-dashed border-rule-strong bg-paper-edge px-6 py-12 text-center">
            <p className="font-display text-lg italic text-fg-muted">Loading...</p>
          </div>
        ) : filteredSpecimens.length === 0 ? (
          <div className="mx-auto max-w-lg rounded-card border border-dashed border-rule-strong bg-paper-edge px-6 py-14 text-center">
            <OrchidSpray size={46} className="mx-auto mb-4 block opacity-50" />
            <p className="font-display text-lg italic text-fg-muted">
              {activeCategory === "All" ? "Nothing kept yet." : `No ${activeCategory.toLowerCase()} yet.`}
            </p>
            <p className="mx-auto mt-2 max-w-[34ch] text-sm leading-body text-fg-quiet">
              {activeCategory === "All" 
                ? "Tap the + below to document your first find — a photograph and a few words is all it takes."
                : `Document a ${activeCategory.toLowerCase()} specimen to see it here.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSpecimens.map((specimen) => (
              <SpecimenCard key={specimen.id} specimen={specimen} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}