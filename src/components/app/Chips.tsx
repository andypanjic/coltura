"use client";

import { useState } from "react";
import { CHIPS } from "@/lib/collections";

/** Category chips: All · Bouquets · Foraged · Pressings · Knitting · Ceramics. */
export function Chips() {
  const [active, setActive] = useState<string>("All");
  return (
    <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
      {CHIPS.map((c) => {
        const on = c === active;
        return (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`smallcaps whitespace-nowrap rounded-pill border px-3 py-1.5 text-[13px] transition-colors duration-1 ease-ease ${
              on
                ? "border-lagoon-strong bg-lagoon text-fg-on-ink"
                : "border-rule bg-paper text-fg-muted hover:bg-paper-wash"
            }`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
