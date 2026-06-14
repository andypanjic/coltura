import { AppHeader } from "@/components/app/AppHeader";

/**
 * Search — full-text + color search across all specimens and notes.
 * THE flagship behavior: the clearest sign of product-market fit is whether
 * the keeper searches her captured specimens and notes later.
 */
export default function SearchPage() {
  return (
    <>
      <AppHeader title="Search" />
      <section className="px-5 py-4">
        <label className="block">
          <span className="sr-only">Search specimens and notes</span>
          <input
            type="search"
            placeholder="Search a name, a place, a color…"
            className="w-full rounded-input border border-rule bg-paper-white px-4 py-3 text-[15px] text-ink placeholder:text-fg-faint focus:border-lagoon focus-visible:outline-none"
          />
        </label>
        <p className="mt-4 text-sm leading-body text-fg-quiet">
          Full-text and color search across every specimen and note. The thing paper and a shoebox
          can&apos;t do — find a past find by what it was, where it was, or the color it kept.
        </p>
      </section>
    </>
  );
}
