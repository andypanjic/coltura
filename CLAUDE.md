# CLAUDE.md — Coltura

Context for Claude Code working in this repo. Read this first, then `README.md`.

## What Coltura is

**A keeping place.** A calm, local-first archive for the things Elyse makes and
finds — crafts, flowers, and small natural beauty. It **augments a handwritten /
physical workflow; it does not replace it.** It is an archive, not a feed:
nothing autoplays, nothing scrolls forever. It rewards *returning*, not refreshing.

Built for **Elyse**, a specific, named maker. Product copy speaks in her register
("a keeping place"; "the small natural beauty she finds"). Designing for one
person keeps scope honest and the voice warm.

## Core concepts

- **Specimen** — the atomic unit. Every find becomes a specimen: *a photograph and
  a quiet label* (name, date, place, the color it kept). A knit, a bouquet, a
  pressed flower, a foraged seed-head, a ceramic piece are all specimens; only
  their fields differ.
- **Collection (a "shelf")** — a named grouping of specimens: bouquets, pressings,
  foraged, knitting, ceramics, works in progress.
- **Knitting is the depth focus.** The generic specimen/collection layer holds every
  kind of find for free; the deep, can't-do-by-hand machinery (handwritten-note
  transcription, ball-band OCR, yarn stash, gauge/yardage/substitution math) is
  built for knitting first.

## Guiding philosophy (don't drift from this)

- **Augment, don't replace.** Don't rebuild what pen, paper, and a shoebox already do well.
- **Image-first.** The original artifact (handwriting photo, ball-band photo, the find
  itself) is the source of truth. AI transcription/extraction is a fallible,
  always-editable convenience and index layer — always shown next to the original.
- **Prioritization lens.** Build features that are both (a) feasible in a lightweight
  web app and (b) something she **cannot easily do by hand**: capture, organization,
  search, reference aggregation, synthesis.
- **Local-first and exportable.** One-tap export from day one. Owning your data is a feature.
- **A quiet, literary voice.** Labels read like specimen cards, not form fields.
- **Success signal:** the clearest sign of product-market fit is whether she
  **searches her captured specimens and notes later.** Search is the flagship.

**Deliberately de-prioritized** (building these is the signal you've drifted from the
thesis): live row counters, stitch markers, manual row-by-row logging, chart designers.

## Tech stack

- **Next.js (App Router) + React + TypeScript + Tailwind CSS.**
- **Local-first storage: IndexedDB** via `idb` (`src/lib/db.ts`). Cloud sync is optional, later.
- **Serverless route handlers** (`src/app/api/*`) call LLM/vision APIs. Keys are
  **server-side only** (`ANTHROPIC_API_KEY`); never ship a key to the client.
- Deploy target: **Vercel**, as an add-to-home-screen **PWA** (`public/manifest.webmanifest`).
- Icons: **lucide-react** at ~1.6–1.7px stroke. The orchid SVGs in `public/brand` are the
  only filled glyphs.

## Project structure

```
src/
  app/
    layout.tsx              root layout — fonts (Newsreader/Geist/Geist Mono), metadata, PWA
    globals.css             design tokens (CSS vars) + Tailwind layers — token source of truth
    page.tsx                marketing "a keeping place" (the public face)
    (app)/                  the product, mobile-first app shell
      layout.tsx            centered column + bottom tab bar
      finds/page.tsx        the specimen feed (home)
      finds/new/page.tsx    document-a-find capture (stub)
      shelves/page.tsx      collections
      search/page.tsx       full-text + color search (flagship)
      you/page.tsx          profile / settings / export
    api/transcribe/route.ts vision-LLM note transcription (stub)
  components/
    brand/Brand.tsx         orchid marks + wordmark (rules in the file)
    app/                    BottomNav, AppHeader, Chips, ExportButton
  lib/
    types.ts                domain model (craft-agnostic core + knitting profile)
    collections.ts          collection definitions; color encodes collection type
    db.ts                   local-first IndexedDB + one-tap export
public/
  brand/                    coltura-app-icon, orchid-spray(-light), orchid-bloom SVGs
  specimens/                sample marketing photos
  manifest.webmanifest
tailwind.config.ts          maps tokens → utilities (bg-paper, text-ink, rounded-card, …)
```

## Design system — the rules that matter

Full tokens live in `src/app/globals.css` and `tailwind.config.ts`.

- **Surfaces are warm paper, never pure white.** `--paper #F5F1E8` is the canonical
  background. `--paper-white` is reserved for the inside of inputs and photographs.
- **Ink is warm graphite, never pure black** (`--ink #1B1A17`).
- **One primary: lagoon teal `--lagoon #1F9AA6`** (actions, active states, app-icon ground).
- **One decorative accent: orchid gold `--gold #C99A3A`** — the flower's throat, used as a
  jewel, never as a fill.
- **Color encodes collection type** (it never just decorates): coral = bouquets,
  green = foraged, stone = dried/seed, gold = ceramics, lagoon = knitting.
- **Type:** Newsreader *names* things (titles, wordmark) — upright, 500, tracking -0.025em;
  italic only for asides and unfilled placeholders. Geist for UI/body. Geist Mono for
  dates, counts, coordinates, labels (often uppercased, tabular numerals).
  Category labels use small caps (`.smallcaps`).
- **Casing:** sentence case everywhere — headings, buttons, chips.
- **No emoji, anywhere.** The one ornament is the orchid. Functional glyphs only: `·` `—` `→` `°` `′`.
- **Borders, not shadows.** Cards have a 1px hairline border (`--rule` on paper,
  `--rule-soft` on white). The single shadow `--shadow-1` is for floating menus/modals only;
  the lagoon app icon carries `--shadow-icon`. Use protection gradients over hard lines where
  content scrolls under a bar.
- **Radii:** 0 tables/rails · 2px inputs · 6px cards/menus/tiles · 12px sheets ·
  20px in-app icon chip · pill for chips/tags/FAB.
- **Motion:** fast, almost imperceptible — 120ms state, 200ms panel, 320ms route,
  ease `cubic-bezier(0.2,0,0,1)`. Fades and short translates only; **press deepens tint, no scale change.**
- **The orchid mark:** never recolor the petals, use the outline alone, scatter the blooms,
  or replace the spray with a single flower in the lockup.

## Roadmap (where to take it)

- **Stage 1 — prove the capture loop (MVP).** Universal capture across all collections
  (photo + light label + extracted color + collection); knitting depth: photograph a
  handwritten note → transcription + entity extraction + search; stash with ball-band OCR;
  color extraction on every specimen; local-first + export. _Advance when she can later
  **find** a past specimen/note/mod by search._
- **Stage 2 — synthesis & calculators.** Yardage estimator, gauge converter,
  yarn-substitution helper, cast-on calculator; AI synthesis (summarize a project's notes,
  shopping list from a pattern, palette-match an image to stash yarns, "identify this" as a
  labeled guess); Ravelry link-out + optional read-only personal import.
- **Stage 3 — generalize the schema, add a full craft profile (watercolor is canonical).**
  Adding watercolor should require only a new craft-profile config + a few fields, with zero
  changes to capture, media, palette, search, reference.

## Guardrails

- **Ravelry API is a reference/import layer, not a backend.** Read-only personal import +
  link-out only. Never scrape or store other users' data. Degrade gracefully to manual capture.
- **Pattern copyright:** store only the user's own purchased/downloaded PDFs, privately. No sharing.
- **AI output is a fallible index, never the authority.** "Identify this" is a guess to confirm.
- **Local-first + export is non-negotiable.**

## Conventions

- Path alias `@/*` → `src/*`.
- Server components by default; add `"use client"` only when a component needs state/effects/DOM.
- Keep the core craft-agnostic — a new craft profile should be config + fields, not a rewrite.
- `npm run typecheck` and `npm run lint` should stay clean.

## Provenance

This codebase was scaffolded from a Claude Design handoff bundle
("Wedding Kestle Design System" → Coltura). The brand was renamed Kestle → Coltura.
The orchid mark is author-drawn; swap if a designer produces a final mark.
