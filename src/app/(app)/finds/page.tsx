import { AppHeader } from "@/components/app/AppHeader";
import { Chips } from "@/components/app/Chips";

/**
 * Finds — the specimen feed. The home of the app.
 * Shows recent specimens; for now, a quiet empty state until capture lands.
 */
export default function FindsPage() {
  return (
    <>
      <AppHeader title="Recent finds" meta="0 specimens · 6 collections">
        <Chips />
      </AppHeader>

      <section className="px-5 py-4">
        {/* Empty state — same quiet, literary voice as the rest of the app. */}
        <div className="rounded-card border border-dashed border-rule-strong bg-paper-edge px-6 py-12 text-center">
          <p className="font-display text-lg italic text-fg-muted">Nothing kept yet.</p>
          <p className="mx-auto mt-2 max-w-[34ch] text-sm leading-body text-fg-quiet">
            Tap the <span className="text-lagoon">+</span> below to document your first find — a
            photograph and a few words is all it takes.
          </p>
        </div>
      </section>
    </>
  );
}
