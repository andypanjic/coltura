import { AppHeader } from "@/components/app/AppHeader";
import { COLLECTIONS } from "@/lib/collections";

/** Shelves — the collections, for browsing groupings. */
export default function ShelvesPage() {
  return (
    <>
      <AppHeader title="Shelves" meta="6 collections" />
      <section className="grid grid-cols-2 gap-3 px-5 py-4">
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
      </section>
    </>
  );
}
