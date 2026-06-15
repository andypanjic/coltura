import Link from "next/link";
import { AppHeader } from "@/components/app/AppHeader";
import { COLLECTIONS } from "@/lib/collections";

/** Shelves — the collections, for browsing groupings. */
export default function ShelvesPage() {
  return (
    <>
      <AppHeader title="Shelves" meta={`${COLLECTIONS.length} collections`} />
      <section className="px-5 py-4">
        <div className="grid grid-cols-2 gap-3">
          {COLLECTIONS.map((c) => (
            <div
              key={c.kind}
              className="rounded-card border border-rule-soft bg-paper-white p-4 transition-colors duration-1 ease-ease hover:bg-paper-wash"
            >
              <span className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-pill"
                  style={{ background: c.accent }}
                  aria-hidden
                />
                <span className="smallcaps text-[13px] text-fg-quiet">{c.label}</span>
              </span>
              <div className="meta mt-3 text-[11px] text-fg-faint">0 specimens</div>
            </div>
          ))}
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
