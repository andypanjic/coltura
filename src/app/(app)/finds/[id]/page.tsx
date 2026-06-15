"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { COLLECTIONS, fieldsForCollection, statusesForCollection } from "@/lib/collections";
import { getSpecimen, putSpecimen } from "@/lib/db";
import type { Specimen } from "@/lib/types";

export default function SpecimenDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [specimen, setSpecimen] = useState<Specimen | null | undefined>(undefined);
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  useEffect(() => {
    if (!id) return;
    getSpecimen(id)
      .then((s) => setSpecimen(s ?? null))
      .catch((e) => {
        console.error("Failed to load specimen:", e);
        setSpecimen(null);
      });
  }, [id]);

  const handleSummarize = async () => {
    if (!specimen) return;
    setIsSummarizing(true);
    setSummaryError("");
    try {
      const res = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: specimen.name,
          body: specimen.body,
          notes: specimen.notes.map((n) => ({ transcript: n.transcript, entities: n.entities })),
        }),
      });
      const data = await res.json();
      if (res.ok) setSummary(data.summary ?? "");
      else setSummaryError(data.error ?? "Couldn't summarize.");
    } catch {
      setSummaryError("Couldn't reach the summarizer.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const updateStatus = async (next: string) => {
    if (!specimen) return;
    const updated = { ...specimen, status: next || undefined, updatedAt: new Date().toISOString() };
    setSpecimen(updated);
    try {
      await putSpecimen(updated);
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  if (specimen === undefined) {
    return (
      <div className="px-5 py-12 text-center">
        <p className="font-display text-lg italic text-fg-muted">Loading…</p>
      </div>
    );
  }

  if (specimen === null) {
    return (
      <div className="px-5 py-12 text-center">
        <p className="font-display text-lg italic text-fg-muted">This find isn&apos;t here.</p>
        <Link href="/finds" className="mt-2 inline-block text-sm text-lagoon hover:underline">
          ← Back to finds
        </Link>
      </div>
    );
  }

  const collection = COLLECTIONS.find((c) => c.kind === specimen.collection);
  const primary = specimen.media[0];
  const dateStr = specimen.date
    ? new Date(specimen.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "";
  const hasNotes = specimen.notes.length > 0 || !!specimen.body;
  const fieldDefs = fieldsForCollection(specimen.collection);
  const fieldLabel = (k: string) => fieldDefs.find((d) => d.key === k)?.label ?? k;
  const fieldEntries = specimen.fields
    ? Object.entries(specimen.fields).filter(([, v]) => v != null && String(v).trim() !== "")
    : [];
  const statusOptions = statusesForCollection(specimen.collection);

  return (
    <div className="pb-24">
      <div className="px-5 pt-4">
        <Link href="/finds" className="inline-flex items-center gap-1.5 font-mono text-xs uppercase text-fg-muted hover:text-ink">
          <ArrowLeft size={14} strokeWidth={1.7} /> Finds
        </Link>
      </div>

      {primary && (
        <div className="mt-3 overflow-hidden border-y border-rule bg-paper">
          <img src={primary.url} alt={specimen.name} className="max-h-[60vh] w-full object-contain" />
        </div>
      )}

      <div className="space-y-5 px-5 py-4">
        <div>
          <h1 className="font-display text-2xl tracking-tight text-ink">{specimen.name}</h1>
          {(dateStr || specimen.place) && (
            <p className="mt-1 font-mono text-xs uppercase text-fg-muted">
              {dateStr}
              {dateStr && specimen.place && " · "}
              {specimen.place}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {collection && (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: collection.accent }} />
                <span className="smallcaps text-xs text-fg-quiet">{collection.label}</span>
              </span>
            )}
            {specimen.recipient && (
              <span className="font-mono text-[11px] uppercase text-fg-muted">for {specimen.recipient}</span>
            )}
          </div>
          {statusOptions.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wide text-fg-muted">Status</span>
              <select
                value={specimen.status ?? ""}
                onChange={(e) => updateStatus(e.target.value)}
                className="rounded-pill border border-rule bg-paper-white px-3 py-1 text-sm text-ink focus:border-lagoon focus:outline-none"
              >
                <option value="">—</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
          {specimen.palette.length > 0 && (
            <div className="mt-3 flex gap-1.5">
              {specimen.palette.map((c, i) => (
                <div key={i} className="h-5 w-5 rounded-full border border-rule-soft" style={{ backgroundColor: c.hex }} title={c.hex} />
              ))}
            </div>
          )}
          {specimen.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {specimen.tags.map((t) => (
                <span key={t} className="smallcaps rounded-pill border border-rule bg-paper-wash px-2 py-0.5 text-[12px] text-fg-quiet">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {fieldEntries.length > 0 && (
          <div className="space-y-1.5">
            {fieldEntries.map(([k, v]) => (
              <div key={k} className="flex gap-3 text-sm">
                <span className="w-24 shrink-0 pt-0.5 font-mono text-[11px] uppercase tracking-wide text-fg-muted">
                  {fieldLabel(k)}
                </span>
                <span className="text-ink">{String(v)}</span>
              </div>
            ))}
          </div>
        )}

        {specimen.body && (
          <p className="whitespace-pre-wrap text-sm leading-body text-fg-quiet">{specimen.body}</p>
        )}

        {/* Notes */}
        {specimen.notes.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-wide text-fg-muted">Notes</h2>
            {specimen.notes.map((n) => (
              <div key={n.id} className="overflow-hidden rounded-card border border-rule bg-paper-white">
                {n.imageUrl && <img src={n.imageUrl} alt="Note" className="max-h-72 w-full object-contain bg-paper-edge" />}
                {n.transcript && (
                  <p className="whitespace-pre-wrap px-4 py-3 text-sm leading-body text-fg-quiet">{n.transcript}</p>
                )}
                {n.entities && Object.keys(n.entities).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                    {Object.entries(n.entities).map(([k, v]) => (
                      <span key={k} className="smallcaps rounded-pill border border-rule bg-paper-wash px-2 py-1 text-[12px] text-fg-quiet">
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summarize */}
        {hasNotes && (
          <div className="space-y-3 border-t border-rule pt-5">
            <button
              type="button"
              onClick={handleSummarize}
              disabled={isSummarizing}
              className="inline-flex items-center gap-2 rounded-input border border-lagoon-strong bg-lagoon px-4 py-2 text-sm font-medium text-fg-on-ink transition-colors duration-1 ease-ease hover:bg-lagoon-strong disabled:opacity-50"
            >
              <Sparkles size={16} strokeWidth={1.7} />
              {isSummarizing ? "Summarizing…" : summary ? "Summarize again" : "Summarize notes"}
            </button>

            {summaryError && <p className="text-sm text-fg-muted">{summaryError}</p>}

            {summary && (
              <div className="rounded-card border border-rule-soft bg-paper-edge px-4 py-3">
                <p className="whitespace-pre-wrap text-sm leading-body text-ink">{summary}</p>
                <p className="mt-2 text-[11px] italic text-fg-faint">
                  A summary is a fallible convenience — your notes above remain the record.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
