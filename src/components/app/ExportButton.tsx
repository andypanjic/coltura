"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { exportArchive } from "@/lib/db";

/** One-tap export — downloads the whole archive as JSON. */
export function ExportButton() {
  const [busy, setBusy] = useState(false);

  async function onExport() {
    setBusy(true);
    try {
      const blob = await exportArchive();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `coltura-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={onExport}
      disabled={busy}
      className="mt-4 inline-flex items-center gap-2 rounded-input border border-rule bg-paper px-4 py-2.5 text-sm font-medium text-ink transition-colors duration-1 ease-ease hover:bg-paper-wash disabled:opacity-60"
    >
      <Download size={16} strokeWidth={1.7} />
      {busy ? "Exporting…" : "Export archive"}
    </button>
  );
}
