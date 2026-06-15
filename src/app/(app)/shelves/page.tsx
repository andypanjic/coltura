"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app/AppHeader";
import { COLLECTIONS } from "@/lib/collections";
import { allSpecimens } from "@/lib/db";
import type { Specimen } from "@/lib/types";

/** Shelves — the collections, for browsing groupings. Color encodes the craft. */
export default function ShelvesPage() {
  const [specimens, setSpecimens] = useState<Specimen[]>([]);

  useEffect(() => {
    allSpecimens()
      .then(setSpecimens)
      .catch((e) => console.error("Failed to load specimens:", e));
  }, []);

  const countFor = (kind: string) => specimens.filter((s) => s.collection === kind).length;

  return (
    <>
      <AppHeader title="Shelves" meta={`${COLLECTIONS.length} collections`} />
      <section className="px-5 py-4">
        <div className="grid grid-cols-2 gap-3">
          {COLLECTIONS.map((c) => {
            const count = countFor(c.kind);
            return (
              <div
                key={c.kind}
                className="overflow-hidden rounded-card border border-rule-soft bg-paper-white"
              >
                <div className="h-16 w-full" style={{ background: c.accent }} aria-hidden />
                <div className="p-4">
                  <div className="font-display text-[17px] tracking-tight text-ink">{c.label}</div>
                  <div className="meta mt-1 text-[11px] uppercase text-fg-faint">
                    {count} specimen{count !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 border-t border-rule pt-6">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-fg-muted">
            Knitting depth
          </h2>
          <div className="space-y-3">
            <Link
              href="/stash"
              className="block rounded-card border border-rule-soft bg-paper-white p-4 transition-colors duration-1 ease-ease hover:bg-paper-wash"
            >
              <span className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-pill"
                  style={{ background: "var(--lagoon)" }}
                  aria-hidden
                />
                <span className="smallcaps text-[13px] text-fg-quiet">Yarn stash</span>
              </span>
              <div className="meta mt-3 text-[11px] text-fg-faint">
                Ball-band OCR · palette extraction
              </div>
            </Link>

            <Link
              href="/tools"
              className="block rounded-card border border-rule-soft bg-paper-white p-4 transition-colors duration-1 ease-ease hover:bg-paper-wash"
            >
              <span className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-pill"
                  style={{ background: "var(--gold)" }}
                  aria-hidden
                />
                <span className="smallcaps text-[13px] text-fg-quiet">Tools</span>
              </span>
              <div className="meta mt-3 text-[11px] text-fg-faint">
                Cast-on · gauge converter · yardage
              </div>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
