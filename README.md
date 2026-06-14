# Coltura

> A keeping place. A calm, local-first archive for the things you make and find —
> each catalogued as a *specimen*: a photograph and a quiet label.

Coltura is a personal archive app for crafts, foraging, pressed flowers, bouquets,
and works in progress. It augments a handwritten / physical workflow rather than
replacing it. Knitting is the depth focus; the capture layer is craft-agnostic.

Built with **Next.js (App Router) · TypeScript · Tailwind CSS**, local-first via
**IndexedDB**, designed as an installable **PWA**.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 — the marketing page ("a keeping place").
The app shell lives at **/finds** (Finds · Shelves · Search · You).

Useful scripts:

```bash
npm run dev        # local dev server
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

### Environment

Copy `.env.example` to `.env.local`. Nothing is required to run the local-first
app shell; `ANTHROPIC_API_KEY` powers the Stage-1/2 AI features (handwriting
transcription, ball-band OCR, synthesis) from server-side routes only.

## Project layout

See **`CLAUDE.md`** for the full map, the design-system rules, the roadmap, and the
guardrails. In short:

- `src/app/page.tsx` — marketing page (the public face)
- `src/app/(app)/*` — the mobile-first product (Finds / Shelves / Search / You)
- `src/lib/*` — domain model, collections, local-first IndexedDB + export
- `src/components/*` — brand marks and app UI
- `src/app/globals.css` + `tailwind.config.ts` — the design tokens

## Working with Claude Code

This repo includes a `CLAUDE.md` so [Claude Code](https://docs.claude.com/en/docs/claude-code)
picks up the full project context (the brief, the design system, the roadmap, the
guardrails). From the repo root:

```bash
claude
```

Then describe the next piece (e.g. "build the document-a-find capture flow" or
"wire up color extraction on specimen save"). Claude Code will follow the design
rules and conventions in `CLAUDE.md`.

## Push to GitHub

A local git repo with an initial commit is already set up. To publish it:

```bash
# create the repo and push (GitHub CLI):
gh repo create coltura --private --source=. --remote=origin --push

# — or, if you created an empty repo on github.com manually:
git remote add origin https://github.com/<you>/coltura.git
git push -u origin main
```

You'll authenticate with GitHub yourself (`gh auth login`, or your normal git
credentials). After that, push commits as usual.

## Deploy

Designed for **Vercel**: import the GitHub repo and deploy. Add `ANTHROPIC_API_KEY`
in the Vercel project's environment variables when you wire up the AI features.

---

Scaffolded from a Claude Design handoff (Kestle → Coltura). The orchid mark is
author-drawn — swap it if a designer produces a final mark.
