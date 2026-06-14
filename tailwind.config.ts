import type { Config } from "tailwindcss";

/**
 * Coltura design tokens, mapped into Tailwind's theme.
 * Source of truth for raw values is src/app/globals.css (CSS custom properties);
 * this file exposes them as Tailwind utilities (bg-paper, text-ink, rounded-card, etc.).
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces (warm, never pure white)
        paper: "var(--paper)",
        "paper-wash": "var(--paper-wash)",
        "paper-deep": "var(--paper-deep)",
        "paper-edge": "var(--paper-edge)",
        "paper-white": "var(--paper-white)",
        // Ink (warm graphite, never pure black)
        ink: "var(--ink)",
        "ink-strong": "var(--ink-strong)",
        "fg-muted": "var(--fg-muted)",
        "fg-quiet": "var(--fg-quiet)",
        "fg-faint": "var(--fg-faint)",
        "fg-on-ink": "var(--fg-on-ink)",
        // Rules & borders
        rule: "var(--rule)",
        "rule-soft": "var(--rule-soft)",
        "rule-strong": "var(--rule-strong)",
        // Lagoon (primary)
        lagoon: "var(--lagoon)",
        "lagoon-strong": "var(--lagoon-strong)",
        "lagoon-soft": "var(--lagoon-soft)",
        "lagoon-wash": "var(--lagoon-wash)",
        // Orchid gold — the single jewel accent
        gold: "var(--gold)",
        "gold-soft": "var(--gold-soft)",
        // Wedding-palette accents (encode collection types)
        coral: "var(--coral)",
        green: "var(--green)",
        wine: "var(--wine)",
        stone: "var(--stone)",
      },
      fontFamily: {
        display: "var(--font-display)",
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
      },
      letterSpacing: {
        display: "-0.025em",
        tight: "-0.02em",
        label: "0.14em",
        eyebrow: "0.04em",
      },
      lineHeight: {
        tight: "1.04",
        snug: "1.2",
        body: "1.55",
        loose: "1.7",
      },
      borderRadius: {
        none: "0",
        input: "2px",
        card: "6px",
        sheet: "12px",
        icon: "20px",
        pill: "999px",
      },
      boxShadow: {
        floating: "0 1px 2px rgba(27,26,23,0.06), 0 4px 12px rgba(27,26,23,0.04)",
        icon: "0 6px 18px rgba(31,154,166,0.28)",
      },
      spacing: {
        // 4px base scale (token names mirror the design system)
        "s1": "4px", "s2": "8px", "s3": "12px", "s4": "16px",
        "s6": "24px", "s8": "32px", "s12": "48px", "s16": "64px", "s24": "96px",
      },
      transitionTimingFunction: {
        ease: "cubic-bezier(0.2,0,0,1)",
      },
      transitionDuration: {
        "1": "120ms",
        "2": "200ms",
        "3": "320ms",
      },
      maxWidth: {
        page: "1200px",
        prose: "64ch",
      },
    },
  },
  plugins: [],
};

export default config;
