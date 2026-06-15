import { AppHeader } from "@/components/app/AppHeader";
import { ExportButton } from "@/components/app/ExportButton";
import { ImportButton } from "@/components/app/ImportButton";

/** You — profile / settings / export. Local-first + export is non-negotiable. */
export default function YouPage() {
  return (
    <>
      <AppHeader title="You" />
      <section className="px-5 py-4">
        <div className="rounded-card border border-rule-soft bg-paper-white p-4">
          <h2 className="font-display text-[17px] text-ink-strong">Your archive</h2>
          <p className="mt-1 text-sm leading-body text-fg-quiet">
            Coltura keeps everything on this device first. Export the whole archive any time — your
            data is yours. Restore it on a new device, or after clearing your browser, by importing
            that file.
          </p>
          <ExportButton />
          <ImportButton />
        </div>
      </section>
    </>
  );
}
