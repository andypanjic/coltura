import Link from "next/link";
import { AppHeader } from "@/components/app/AppHeader";

/**
 * Document a find — the primary capture action.
 * Stage 1: photo + light label + collection. Knitting depth (handwriting
 * transcription, ball-band OCR) layers in later. Stub for now.
 */
export default function NewSpecimenPage() {
  return (
    <>
      <AppHeader title="Document a find" />
      <section className="px-5 py-4">
        <div className="rounded-card border border-dashed border-rule-strong bg-paper-edge px-6 py-12 text-center">
          <p className="font-display text-lg italic text-fg-muted">a new specimen</p>
          <p className="mx-auto mt-2 max-w-[34ch] text-sm leading-body text-fg-quiet">
            Capture flow goes here: a photo, then name · date · place · collection, and the color it
            kept, extracted from the image.
          </p>
          <Link
            href="/finds"
            className="mt-6 inline-block rounded-input border border-lagoon-strong bg-lagoon px-5 py-2.5 text-sm font-medium text-fg-on-ink transition-colors duration-1 ease-ease hover:bg-lagoon-strong"
          >
            Back to finds
          </Link>
        </div>
      </section>
    </>
  );
}
