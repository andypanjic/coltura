import Link from "next/link";
import { OrchidSpray, AppIcon } from "@/components/brand/Brand";

/**
 * Marketing — "a keeping place".
 * The public face of Coltura, ported from the desktop-web design handoff.
 * Left-aligned editorial hero + overlapping specimen cards + a three-cell strip.
 */

const SPECIMENS = [
  {
    src: "/specimens/white-phalaenopsis.jpg",
    title: "White phalaenopsis",
    meta: "11 JUL · ATHENS · BOUQUETS",
    ratio: "3 / 4",
    pos: "center",
    cls: "w-52 left-6 top-0 z-30 -rotate-3",
  },
  {
    src: "/specimens/allium-in-seed.jpg",
    title: "Allium, in seed",
    meta: "JUN · FORAGED",
    ratio: "1 / 1",
    pos: "center",
    cls: "w-[196px] right-2 top-9 z-20 rotate-[2.5deg]",
  },
  {
    src: "/specimens/coral-garden-roses.jpg",
    title: "Coral garden roses",
    meta: "11 JUL · BOUQUETS",
    ratio: "4 / 3",
    pos: "22% 62%",
    cls: "w-[184px] left-24 top-[236px] z-40 rotate-[1.5deg]",
  },
];

const FEATURES = [
  {
    title: "Every find is a specimen",
    body: "Each entry is one photograph and a short record — name, date, place, and the color it kept.",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </>
    ),
  },
  {
    title: "Shelves, not feeds",
    body: "Keep your knitting and watercolor work on its own shelf, with the depth each craft needs. Nothing scrolls forever.",
    icon: (
      <path d="M3 7.5a1.5 1.5 0 0 1 1.5-1.5H9l2 2h7.5A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />
    ),
  },
  {
    title: "No feed, no ads",
    body: "Coltura doesn't rank or recommend. It holds what you put in, and shows it back when you look.",
    icon: (
      <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />
    ),
  },
];

export default function MarketingPage() {
  return (
    <div className="mx-auto max-w-[1280px]">
      {/* nav */}
      <nav className="flex items-center justify-between border-b border-rule px-12 py-6">
        <div className="flex items-center gap-2.5">
          <OrchidSpray size={26} />
          <span className="font-display text-[26px] font-medium tracking-tight text-ink-strong">
            Coltura
          </span>
        </div>
        <div className="flex items-center gap-[30px]">
          <a className="text-[14.5px] text-fg-muted transition-colors duration-1 ease-ease hover:text-ink-strong" href="#collections">
            Collections
          </a>
          <a className="text-[14.5px] text-fg-muted transition-colors duration-1 ease-ease hover:text-ink-strong" href="#field-notes">
            Field notes
          </a>
          <a className="text-[14.5px] text-fg-muted transition-colors duration-1 ease-ease hover:text-ink-strong" href="#pricing">
            Pricing
          </a>
          <Link
            href="/finds"
            className="whitespace-nowrap rounded-input border border-lagoon-strong bg-lagoon px-[18px] py-[9px] text-sm font-medium text-fg-on-ink transition-colors duration-1 ease-ease hover:bg-lagoon-strong"
          >
            Get Coltura
          </Link>
        </div>
      </nav>

      {/* hero */}
      <section className="grid grid-cols-1 items-center gap-12 px-12 pb-16 pt-[72px] md:grid-cols-2">
        <div>
          <div className="text-xs uppercase tracking-label text-fg-quiet">a keeping place</div>
          <h1 className="mt-[18px] font-display text-[72px] font-medium leading-[0.98] tracking-display text-ink-strong max-[560px]:text-5xl">
            Keep what
            <br />
            you <em className="not-italic italic text-lagoon">make</em>.
          </h1>
          <p className="mt-[22px] max-w-[46ch] text-[19px] leading-body text-fg-muted">
            Coltura is an archive for the things you make and find. Photograph each one, add a few
            details, and file it on a shelf you can return to.
          </p>
          <div className="mt-8 flex items-center gap-3.5">
            <Link
              href="/finds"
              className="flex items-center gap-2 rounded-input border border-lagoon-strong bg-lagoon px-6 py-[13px] text-[15px] font-medium text-fg-on-ink transition-colors duration-1 ease-ease hover:bg-lagoon-strong"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Start a collection
            </Link>
            <a
              href="#sample"
              className="border-b border-dotted border-fg-quiet pb-0.5 text-[15px] text-ink transition-colors duration-1 ease-ease hover:border-solid hover:border-ink-strong hover:text-ink-strong"
            >
              See a sample shelf →
            </a>
          </div>
          <div className="meta mt-[30px] text-xs text-fg-quiet">
            33.9519° N, 83.3576° W · THE STATE BOTANICAL GARDEN OF GEORGIA
          </div>
        </div>

        {/* hero art — overlapping specimen cards */}
        <div className="relative h-[440px]">
          <AppIcon
            size={74}
            className="absolute right-[54px] top-[-18px] z-50 rounded-[18px] shadow-icon"
          />
          {SPECIMENS.map((s) => (
            <figure
              key={s.title}
              className={`absolute m-0 overflow-hidden rounded-card border border-rule-soft bg-paper-white shadow-floating ${s.cls}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.src}
                alt={`${s.title} specimen`}
                className="block w-full object-cover"
                style={{ aspectRatio: s.ratio, objectPosition: s.pos }}
              />
              <figcaption className="px-3 pb-3 pt-2.5">
                <div className="font-display text-[15px] text-ink">{s.title}</div>
                <div className="meta mt-1 text-[9.5px] text-fg-quiet">{s.meta}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* strip */}
      <section className="grid grid-cols-1 gap-px border-y border-rule bg-rule md:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="bg-paper px-10 py-[38px]">
            <svg
              className="text-lagoon"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {f.icon}
            </svg>
            <h3 className="mb-2 mt-3.5 font-display text-[21px] font-medium tracking-tight text-ink-strong">
              {f.title}
            </h3>
            <p className="m-0 text-[14.5px] leading-body text-fg-muted">{f.body}</p>
          </div>
        ))}
      </section>

      {/* footer */}
      <footer className="flex items-center justify-between px-12 pb-10 pt-7">
        <div className="flex items-center gap-2 font-display text-base text-ink">
          <OrchidSpray size={18} />
          <span>Coltura</span>
        </div>
        <div className="meta text-[11px] uppercase text-fg-quiet">A keeping place</div>
      </footer>
    </div>
  );
}
