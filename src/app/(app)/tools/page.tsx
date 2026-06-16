"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app/AppHeader";
import {
  castOnStitches,
  widthForStitches,
  convertGaugeCount,
  estimateYardage,
  type StitchPattern,
} from "@/lib/knitmath";
import { substituteYarn, YARN_WEIGHTS } from "@/lib/substitute";
import { matchStashToPalette, closenessLabel } from "@/lib/paletteMatch";
import { extractPaletteFromFile } from "@/lib/palette";
import { allMaterials } from "@/lib/db";
import type { Material, PaletteColor } from "@/lib/types";

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
  type = "number",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  type?: "number" | "text";
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-fg-muted">
        {label}
      </span>
      <input
        type={type}
        inputMode={type === "number" ? "decimal" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-input border border-rule bg-paper-white px-3 py-2 text-sm placeholder:italic placeholder:text-fg-faint focus:border-lagoon focus:outline-none ${type === "number" ? "tabular-nums" : ""}`}
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

function YarnSubstitution() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [weight, setWeight] = useState("4");
  const [yardage, setYardage] = useState("400");
  const [fiber, setFiber] = useState("");

  useEffect(() => {
    allMaterials()
      .then(setMaterials)
      .catch((e) => console.error("Failed to load stash:", e))
      .finally(() => setLoaded(true));
  }, []);

  const yarns = materials.filter((m) => m.kind === "yarn");
  const matches = substituteYarn(materials, {
    weight: weight === "" ? undefined : num(weight),
    yardageNeeded: yardage ? num(yardage) : undefined,
    fiber: fiber.trim() || undefined,
  });

  return (
    <Card title="Yarn substitution" blurb="Match a pattern's yarn against your stash by weight, yardage, and fiber.">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-fg-muted">Target weight</span>
          <select
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full rounded-input border border-rule bg-paper-white px-3 py-2 text-sm focus:border-lagoon focus:outline-none"
          >
            {YARN_WEIGHTS.map((w, i) => (
              <option key={i} value={i}>{i} · {w}</option>
            ))}
          </select>
        </label>
        <Field label="Yardage needed" value={yardage} onChange={setYardage} hint="total yards" />
      </div>
      <Field label="Fiber" type="text" value={fiber} onChange={setFiber} placeholder="optional — e.g. wool, merino" />

      {!loaded ? (
        <div className="rounded-card border border-dashed border-rule-strong bg-paper-edge px-4 py-6 text-center">
          <p className="font-display text-base italic text-fg-muted">Reading your stash…</p>
        </div>
      ) : yarns.length === 0 ? (
        <div className="rounded-card border border-dashed border-rule-strong bg-paper-edge px-4 py-6 text-center">
          <p className="font-display text-base italic text-fg-muted">No yarn in your stash yet.</p>
          <Link href="/stash/new" className="mt-2 inline-block text-sm text-lagoon hover:underline">
            Add yarn with ball-band OCR →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((m) => (
            <div key={m.material.id} className="rounded-card border border-rule-soft bg-paper-edge px-3 py-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm text-ink">{m.material.name}</span>
                {m.enoughYardage === true && (
                  <span className="shrink-0 rounded-pill bg-lagoon px-2 py-0.5 text-[10px] uppercase text-fg-on-ink">enough</span>
                )}
                {m.enoughYardage === false && (
                  <span className="shrink-0 rounded-pill border border-rule px-2 py-0.5 text-[10px] uppercase text-fg-muted">short</span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[11px] text-fg-muted">
                <span>{m.material.weight != null ? `${m.material.weight} · ${YARN_WEIGHTS[m.material.weight] ?? "?"}` : "weight —"}</span>
                <span>{m.availableYards > 0 ? `${m.availableYards} yds on hand` : "yardage —"}</span>
                {m.material.colorway && <span>{m.material.colorway}</span>}
              </div>
              {m.reasons.length > 0 && (
                <div className="mt-1 text-[11px] leading-snug text-fg-quiet">{m.reasons.join(" · ")}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function PaletteMatch() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [target, setTarget] = useState<PaletteColor[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [extracting, setExtracting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    allMaterials()
      .then(setMaterials)
      .catch((e) => console.error("Failed to load stash:", e))
      .finally(() => setLoaded(true));
  }, []);

  const onImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUrl(URL.createObjectURL(file));
    setExtracting(true);
    try {
      setTarget(await extractPaletteFromFile(file, 5));
    } finally {
      setExtracting(false);
    }
  };

  const yarnsWithColor = materials.filter((m) => m.kind === "yarn" && m.palette && m.palette.length > 0);
  const matches = matchStashToPalette(materials, target);

  return (
    <Card title="Palette match" blurb="Photograph an inspiration image; find the stash yarns whose colors come closest.">
      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onImage} className="hidden" />

      {imageUrl ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="relative overflow-hidden rounded-card border border-rule bg-paper-edge"
        >
          <img src={imageUrl} alt="Inspiration" className="h-40 w-full object-cover" />
          {target.length > 0 && (
            <div className="absolute bottom-2 left-2 flex gap-1 rounded-pill border border-rule bg-paper-white/90 px-2 py-1.5 backdrop-blur-sm">
              {target.map((c, i) => (
                <div key={i} className="h-4 w-4 rounded-full border border-rule-soft" style={{ backgroundColor: c.hex }} title={c.hex} />
              ))}
            </div>
          )}
          {extracting && (
            <div className="absolute inset-0 flex items-center justify-center bg-paper-white/70 backdrop-blur-sm">
              <p className="font-display italic text-fg-muted">Reading colors…</p>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex h-28 w-full items-center justify-center rounded-card border-2 border-dashed border-rule-strong bg-paper-edge text-fg-muted transition-colors duration-1 hover:bg-paper-wash"
        >
          <div className="text-center">
            <p className="font-display text-base italic">Add an inspiration image</p>
            <p className="mt-1 text-sm text-fg-quiet">We&apos;ll match its colors to your stash</p>
          </div>
        </button>
      )}

      {target.length > 0 &&
        (loaded && yarnsWithColor.length === 0 ? (
          <div className="rounded-card border border-dashed border-rule-strong bg-paper-edge px-4 py-6 text-center">
            <p className="font-display text-base italic text-fg-muted">No yarn colors in your stash yet.</p>
            <Link href="/stash/new" className="mt-2 inline-block text-sm text-lagoon hover:underline">
              Add yarn with ball-band OCR →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {matches.slice(0, 8).map((m) => (
              <div key={m.material.id} className="flex items-center gap-3 rounded-card border border-rule-soft bg-paper-edge px-3 py-2.5">
                <div className="flex shrink-0 items-center gap-1">
                  <span className="h-7 w-7 rounded-full border border-rule" style={{ backgroundColor: m.targetHex }} title={`image ${m.targetHex}`} />
                  <span className="font-mono text-fg-faint">→</span>
                  <span className="h-7 w-7 rounded-full border border-rule" style={{ backgroundColor: m.yarnHex }} title={`yarn ${m.yarnHex}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-ink">{m.material.name}</div>
                  <div className="font-mono text-[11px] text-fg-muted">
                    {closenessLabel(m.distance)}
                    {m.material.colorway ? ` · ${m.material.colorway}` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
    </Card>
  );
}

/** Tools — knitting math (Stage 2). Deterministic aids, not authorities. */
export default function ToolsPage() {
  return (
    <>
      <AppHeader title="Tools" meta="Knitting math" />
      <div className="space-y-4 px-5 py-4 pb-24 md:mx-auto md:max-w-2xl">
        <CastOnCalc />
        <GaugeConverter />
        <YardageEstimator />
        <YarnSubstitution />
        <PaletteMatch />
        <p className="px-1 text-[12px] leading-snug text-fg-faint">
          A swatch beats a calculator — always check gauge against your own
          knitting. Yardage is a rough guide; keep a margin.
        </p>
      </div>
    </>
  );
}
