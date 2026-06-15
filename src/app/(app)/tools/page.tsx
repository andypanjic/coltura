"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app/AppHeader";
import {
  castOnStitches,
  widthForStitches,
  convertGaugeCount,
  estimateYardage,
  type StitchPattern,
} from "@/lib/knitmath";

const num = (s: string) => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-fg-muted">
        {label}
      </span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-input border border-rule bg-paper-white px-3 py-2 text-sm tabular-nums placeholder:italic placeholder:text-fg-faint focus:border-lagoon focus:outline-none"
      />
      {hint && <span className="mt-1 block text-[11px] text-fg-faint">{hint}</span>}
    </label>
  );
}

function Result({ value, unit, sub }: { value: string; unit?: string; sub?: string }) {
  return (
    <div className="rounded-card border border-rule-soft bg-paper-edge px-4 py-3">
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-3xl tabular-nums text-ink">{value}</span>
        {unit && <span className="font-mono text-xs uppercase text-fg-muted">{unit}</span>}
      </div>
      {sub && <div className="mt-1 text-[12px] leading-snug text-fg-quiet">{sub}</div>}
    </div>
  );
}

function Card({ title, blurb, children }: { title: string; blurb: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-rule bg-paper-white p-4">
      <h2 className="font-display text-lg text-ink">{title}</h2>
      <p className="mb-3 mt-0.5 text-[13px] leading-snug text-fg-quiet">{blurb}</p>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function CastOnCalc() {
  const [gauge, setGauge] = useState("18");
  const [width, setWidth] = useState("20");
  const [repeat, setRepeat] = useState("");
  const [edge, setEdge] = useState("");

  const sts = castOnStitches(num(gauge), num(width), {
    multipleOf: repeat ? num(repeat) : undefined,
    edgeStitches: edge ? num(edge) : undefined,
  });
  const actualWidth = num(gauge) > 0 ? widthForStitches(num(gauge), sts) : 0;

  return (
    <Card title="Cast-on calculator" blurb="How many stitches to cast on for a finished width.">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Stitch gauge" value={gauge} onChange={setGauge} hint="sts per 4 in" />
        <Field label="Desired width" value={width} onChange={setWidth} hint="inches" />
        <Field label="Repeat multiple" value={repeat} onChange={setRepeat} placeholder="optional" hint="round to a pattern repeat" />
        <Field label="Edge stitches" value={edge} onChange={setEdge} placeholder="optional" hint="selvedge / seam" />
      </div>
      <Result
        value={sts ? String(sts) : "—"}
        unit="stitches"
        sub={sts ? `≈ ${actualWidth.toFixed(1)} in finished width at this gauge` : "Enter a gauge and width."}
      />
    </Card>
  );
}

function GaugeConverter() {
  const [pat, setPat] = useState("18");
  const [yours, setYours] = useState("20");
  const [count, setCount] = useState("100");

  const adjusted = convertGaugeCount(num(pat), num(yours), num(count));
  const delta = adjusted - num(count);

  return (
    <Card title="Gauge converter" blurb="Re-figure a pattern's stitch (or row) count for your gauge, keeping the finished size.">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Pattern gauge" value={pat} onChange={setPat} hint="sts (or rows) per 4 in" />
        <Field label="Your gauge" value={yours} onChange={setYours} hint="sts (or rows) per 4 in" />
        <Field label="Pattern count" value={count} onChange={setCount} hint="sts or rows it calls for" />
      </div>
      <Result
        value={adjusted ? String(adjusted) : "—"}
        unit="for your gauge"
        sub={
          adjusted
            ? `${delta === 0 ? "Same count" : delta > 0 ? `+${delta} more` : `${delta} fewer`} than the pattern's ${num(count)}.`
            : "Enter both gauges and a count."
        }
      />
    </Card>
  );
}

const PATTERNS: { value: StitchPattern; label: string }[] = [
  { value: "stockinette", label: "Stockinette" },
  { value: "garter", label: "Garter" },
  { value: "ribbing", label: "Ribbing" },
  { value: "cables", label: "Cables" },
  { value: "lace", label: "Lace" },
];

function YardageEstimator() {
  const [sts, setSts] = useState("18");
  const [rows, setRows] = useState("24");
  const [width, setWidth] = useState("20");
  const [height, setHeight] = useState("24");
  const [pattern, setPattern] = useState<StitchPattern>("stockinette");

  const est = estimateYardage({
    gaugeStsPer4in: num(sts),
    gaugeRowsPer4in: num(rows),
    widthInches: num(width),
    heightInches: num(height),
    pattern,
  });

  return (
    <Card title="Yardage estimator" blurb="Roughly how much yarn a flat piece needs. An estimate — stitch pattern and tension move the real number.">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Stitch gauge" value={sts} onChange={setSts} hint="sts per 4 in" />
        <Field label="Row gauge" value={rows} onChange={setRows} hint="rows per 4 in" />
        <Field label="Width" value={width} onChange={setWidth} hint="inches" />
        <Field label="Height" value={height} onChange={setHeight} hint="inches" />
      </div>
      <label className="block">
        <span className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-fg-muted">Stitch pattern</span>
        <select
          value={pattern}
          onChange={(e) => setPattern(e.target.value as StitchPattern)}
          className="w-full rounded-input border border-rule bg-paper-white px-3 py-2 text-sm focus:border-lagoon focus:outline-none"
        >
          {PATTERNS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </label>
      <Result
        value={est.yards ? `~${est.yards}` : "—"}
        unit="yards (estimate)"
        sub={
          est.yards
            ? `Buy ~${est.yardsToBuy} yds to be safe (+15%). About ${est.stitches.toLocaleString()} stitches.`
            : "Enter gauge and dimensions."
        }
      />
    </Card>
  );
}

/** Tools — knitting math (Stage 2). Deterministic aids, not authorities. */
export default function ToolsPage() {
  return (
    <>
      <AppHeader title="Tools" meta="Knitting math" />
      <div className="space-y-4 px-5 py-4 pb-24">
        <CastOnCalc />
        <GaugeConverter />
        <YardageEstimator />
        <p className="px-1 text-[12px] leading-snug text-fg-faint">
          A swatch beats a calculator — always check gauge against your own
          knitting. Yardage is a rough guide; keep a margin.
        </p>
      </div>
    </>
  );
}
