"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { importArchive } from "@/lib/db";

/** Restore the archive from an exported JSON file. Merges by id (never wipes). */
export function ImportButton() {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMsg("");
    try {
      const result = await importArchive(await file.text());
      setMsg(
        `Restored ${result.specimens} specimen${result.specimens === 1 ? "" : "s"} and ${result.materials} material${result.materials === 1 ? "" : "s"}.`,
      );
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div className="mt-3">
      <input ref={ref} type="file" accept="application/json,.json" onChange={onFile} className="hidden" />
      <button
        onClick={() => ref.current?.click()}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-input border border-rule bg-paper px-4 py-2.5 text-sm font-medium text-ink transition-colors duration-1 ease-ease hover:bg-paper-wash disabled:opacity-60"
      >
        <Upload size={16} strokeWidth={1.7} />
        {busy ? "Restoring…" : "Import archive"}
      </button>
      {msg && <p className="mt-2 text-sm text-fg-quiet">{msg}</p>}
    </div>
  );
}
