"use client";

import { useState, useEffect, useRef } from "react";
import { AppHeader } from "@/components/app/AppHeader";
import { SpecimenCard } from "@/components/app/SpecimenCard";
import { OrchidSpray } from "@/components/brand/Brand";
import { allSpecimens } from "@/lib/db";
import { textSearch, colorSearch } from "@/lib/search";
import { ACCENT_COLORS } from "@/lib/color";
import type { Specimen } from "@/lib/types";

type SearchMode = "text" | "color";

export default function SearchPage() {
  const [specimens, setSpecimens] = useState<Specimen[]>([]);
  const [results, setResults] = useState<Specimen[]>([]);
  const [searchMode, setSearchMode] = useState<SearchMode>("text");
  const [textQuery, setTextQuery] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadSpecimens = async () => {
      try {
        const data = await allSpecimens();
        setSpecimens(data);
      } catch (error) {
        console.error("Failed to load specimens:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSpecimens();
  }, []);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (textQuery.trim()) {
      setSearchMode("text");
      setSelectedColor("");
      debounceTimerRef.current = setTimeout(() => {
        const searchResults = textSearch(specimens, textQuery);
        setResults(searchResults);
        setHasSearched(true);
      }, 200);
    } else if (!selectedColor) {
      setResults([]);
      setHasSearched(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [textQuery, specimens]);

  const handleColorSearch = (color: string) => {
    setTextQuery("");
    setSelectedColor(color);
    setSearchMode("color");
    const searchResults = colorSearch(specimens, color);
    setResults(searchResults);
    setHasSearched(true);
  };

  const handleClearSearch = () => {
    setTextQuery("");
    setSelectedColor("");
    setResults([]);
    setHasSearched(false);
    setSearchMode("text");
  };

  const showResults = hasSearched || textQuery.trim() || selectedColor;

  return (
    <>
      <AppHeader title="Search" />
      
      <section className="px-5 py-4">
        <div className="space-y-3">
          <div>
            <label className="block">
              <span className="sr-only">Search specimens and notes</span>
              <input
                type="search"
                value={textQuery}
                onChange={(e) => setTextQuery(e.target.value)}
                placeholder="Search a name, a place, a color…"
                className="w-full rounded-input border border-rule bg-paper-white px-4 py-3 text-[15px] text-ink placeholder:text-fg-faint focus:border-lagoon focus-visible:outline-none"
              />
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase text-fg-muted">Colors</span>
            <div className="flex flex-1 gap-2 overflow-x-auto">
              {Object.entries(ACCENT_COLORS).map(([name, hex]) => (
                <button
                  key={name}
                  onClick={() => handleColorSearch(hex)}
                  className={`h-8 w-8 rounded-full border-2 transition-all duration-1 ${
                    selectedColor === hex
                      ? "border-lagoon scale-110 shadow-md"
                      : "border-rule hover:border-rule-strong"
                  }`}
                  style={{ backgroundColor: hex }}
                  title={name}
                />
              ))}
              
              <div className="relative">
                <button
                  onClick={() => colorInputRef.current?.click()}
                  className={`h-8 w-8 rounded-full border-2 bg-gradient-to-br from-coral via-lagoon to-gold transition-all duration-1 ${
                    selectedColor && !Object.values(ACCENT_COLORS).includes(selectedColor as any)
                      ? "border-lagoon scale-110 shadow-md"
                      : "border-rule hover:border-rule-strong"
                  }`}
                  title="Pick any color"
                />
                <input
                  ref={colorInputRef}
                  type="color"
                  onChange={(e) => handleColorSearch(e.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </div>
              
              {selectedColor && (
                <button
                  onClick={handleClearSearch}
                  className="ml-2 rounded-pill border border-rule px-3 py-1 font-mono text-xs uppercase text-fg-muted transition-colors duration-1 hover:bg-paper-wash"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="rounded-card border border-dashed border-rule-strong bg-paper-edge px-6 py-12 text-center">
              <p className="font-display text-lg italic text-fg-muted">Loading specimens…</p>
            </div>
          ) : !showResults ? (
            <div className="rounded-card border border-dashed border-rule-strong bg-paper-edge px-6 py-14 text-center">
              <OrchidSpray size={46} className="mx-auto mb-4 block opacity-50" />
              <p className="font-display text-lg italic text-fg-muted">
                What are you looking for?
              </p>
              <p className="mx-auto mt-2 max-w-[40ch] text-sm leading-body text-fg-quiet">
                Full-text and color search across every specimen and note. The thing paper and a 
                shoebox can&apos;t do — find a past find by what it was, where it was, or the color it kept.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-card border border-dashed border-rule-strong bg-paper-edge px-6 py-12 text-center">
              <p className="font-display text-lg italic text-fg-muted">
                Nothing matches that yet.
              </p>
              <p className="mx-auto mt-2 max-w-[34ch] text-sm leading-body text-fg-quiet">
                {searchMode === "color" 
                  ? "Try a different shade or document more finds with this palette."
                  : "Try different words or document more specimens to search."}
              </p>
            </div>
          ) : (
            <div>
              <p className="mb-4 font-mono text-xs uppercase text-fg-muted">
                {results.length} {results.length === 1 ? 'match' : 'matches'}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((specimen) => (
                  <SpecimenCard key={specimen.id} specimen={specimen} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}