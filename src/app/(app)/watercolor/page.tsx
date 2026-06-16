"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { washScale, valueStudy, harmony } from "@/lib/paint";

function Card({ title, blurb, children }: { title: string; blurb: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-rule bg-paper-white p-4">
      <h2 className="font-display text-lg text-ink">{title}</h2>
      <p className="mb-3 mt-0.5 text-[13px] leading-snug text-fg-quiet">{blurb}</p>
      {children}
    </section>
  );
}

function Chip({ hex, label }: { hex: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="h-12 w-12 rounded-full border border-rule" style={{ background: hex }} />
      <span className="font-mono text-[10px] uppercase text-fg-muted">{label}</span>
    </div>
  );
}

/** Watercolor depth — color studies (washes, value, harmony). */
export default function WatercolorPage() {
  const [color, setColor] = useState("#1f6fb2");

  const washes = washScale(color);
  const value = valueStudy(color);
  const harm = harmony(color);

  return (
    <>
      <AppHeader title="Color studies" meta="Watercolor" />
      <div className="space-y-4 px-5 py-4 pb-24 md:mx-auto md:max-w-2xl">
        <Link
          href="/shelves"
          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase text-fg-muted hover:text-ink"
        >
          <ArrowLeft size={14} strokeWidth={1.7} /> Shelves
        </Link>

        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            aria-label="Pick a pigment"
            className="h-14 w-14 shrink-0 cursor-pointer rounded-card border border-rule bg-transparent p-0"
          />
          <div>
            <div className="font-mono text-sm text-ink">{color.toUpperCase()}</div>
            <div className="font-mono text-[11px] uppercase tracking-wide text-fg-muted">Pick a pigment</div>
          </div>
        </div>

        <Card title="Wash scale" blurb="The pigment thinned over paper — how layered washes lighten.">
          <div className="overflow-hidden rounded-card border border-rule">
            <div className="flex h-16">
              {washes.map((w) => (
                <div key={w.pct} className="flex-1" style={{ background: w.hex }} />
              ))}
            </div>
          </div>
          <div className="mt-1 flex">
            {washes.map((w) => (
              <div key={w.pct} className="flex-1 text-center font-mono text-[10px] uppercase text-fg-muted">
                {w.pct}%
              </div>
            ))}
          </div>
        </Card>

        <Card title="Value" blurb="The tone a value sketch sees — plan your darks and lights.">
          <div className="flex items-center gap-3">
            <span className="h-14 w-14 rounded-card border border-rule" style={{ background: color }} />
            <span className="font-mono text-fg-faint">→</span>
            <span className="h-14 w-14 rounded-card border border-rule" style={{ background: value.hex }} />
            <span className="font-mono text-sm text-fg-muted">value {value.value}</span>
          </div>
        </Card>

        <Card title="Harmony" blurb="Color-wheel relationships for a limited palette.">
          <div className="space-y-4">
            <div>
              <div className="mb-2 font-mono text-[11px] uppercase tracking-wide text-fg-muted">Complement</div>
              <div className="flex gap-4">
                <Chip hex={color} label="base" />
                <Chip hex={harm.complement} label="comp" />
              </div>
            </div>
            <div>
              <div className="mb-2 font-mono text-[11px] uppercase tracking-wide text-fg-muted">Analogous</div>
              <div className="flex gap-4">
                <Chip hex={harm.analogous[0]} label="−30°" />
                <Chip hex={color} label="base" />
                <Chip hex={harm.analogous[1]} label="+30°" />
              </div>
            </div>
            <div>
              <div className="mb-2 font-mono text-[11px] uppercase tracking-wide text-fg-muted">Triadic</div>
              <div className="flex gap-4">
                <Chip hex={color} label="base" />
                <Chip hex={harm.triadic[0]} label="+120°" />
                <Chip hex={harm.triadic[1]} label="+240°" />
              </div>
            </div>
          </div>
        </Card>

        <p className="px-1 text-[12px] leading-snug text-fg-faint">
          Screen color only approximates pigment — always test a wash on your actual paper.
        </p>
      </div>
    </>
  );
}
