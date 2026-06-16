"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { useCrafts } from "@/components/app/CraftsProvider";
import { putCustomCraft } from "@/lib/db";
import type { CraftProfile } from "@/lib/crafts";

const ACCENTS = [
  { name: "Coral", token: "--coral" },
  { name: "Green", token: "--green" },
  { name: "Stone", token: "--stone" },
  { name: "Gold", token: "--gold" },
  { name: "Lagoon", token: "--lagoon" },
  { name: "Wine", token: "--wine" },
];

const DEFAULT_STATUSES = ["Queued", "In progress", "Finished"];

function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Add a hobby — lean builder: a name + a color. The new craft gets its own
 *  shelf and the full generic toolkit (capture, palette, notes, search) plus
 *  default statuses. Knitting and watercolor remain built-in. */
export default function NewCraftPage() {
  const router = useRouter();
  const { collections, reload } = useCrafts();
  const [name, setName] = useState("");
  const [accent, setAccent] = useState("--coral");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const label = name.trim();
    if (!label) return;

    // Derive a unique collection kind.
    const base = slugify(label) || "hobby";
    const taken = new Set(collections.map((c) => c.kind));
    let kind = base;
    let n = 2;
    while (taken.has(kind)) kind = `${base}-${n++}`;

    const craft: CraftProfile = {
      id: `craft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label,
      collections: [{ kind, label, accent: `var(${accent})` }],
      fields: [],
      statuses: DEFAULT_STATUSES,
    };

    setSaving(true);
    setError("");
    try {
      await putCustomCraft(craft);
      await reload();
      router.push("/shelves");
    } catch (err) {
      console.error("Failed to save craft:", err);
      setError("Couldn't save. Try again.");
      setSaving(false);
    }
  };

  return (
    <>
      <AppHeader title="Add a hobby" />
      <form onSubmit={handleSubmit} className="px-5 py-4 md:mx-auto md:max-w-2xl">
        <div className="mb-4">
          <Link
            href="/shelves"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase text-fg-muted hover:text-ink"
          >
            <ArrowLeft size={14} strokeWidth={1.7} /> Shelves
          </Link>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="craft-name" className="mb-2 block font-mono text-xs uppercase tracking-wide text-fg-muted">
              Name
            </label>
            <input
              id="craft-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lego, Pottery, Pressed flowers"
              autoFocus
              required
              className="w-full rounded-input border border-rule bg-paper-white px-3 py-2 text-sm placeholder:italic placeholder:text-fg-faint focus:border-lagoon focus:outline-none"
            />
          </div>

          <div>
            <span className="mb-2 block font-mono text-xs uppercase tracking-wide text-fg-muted">Color</span>
            <div className="flex flex-wrap gap-3">
              {ACCENTS.map((a) => (
                <button
                  key={a.token}
                  type="button"
                  onClick={() => setAccent(a.token)}
                  aria-label={a.name}
                  title={a.name}
                  className={`h-9 w-9 rounded-full border-2 transition-transform duration-1 ${
                    accent === a.token ? "scale-110" : ""
                  }`}
                  style={{
                    background: `var(${a.token})`,
                    borderColor: accent === a.token ? "var(--ink)" : "var(--rule)",
                  }}
                />
              ))}
            </div>
          </div>

          <p className="text-[13px] leading-snug text-fg-quiet">
            Your hobby gets its own shelf and the full toolkit — photograph, color, notes, and
            search — with statuses {DEFAULT_STATUSES.join(" · ")}.
          </p>

          {error && <p className="text-sm text-fg-muted">{error}</p>}

          <div className="flex gap-3 pt-1">
            <Link
              href="/shelves"
              className="flex-1 rounded-input border border-rule-strong bg-paper-white py-2.5 text-center text-sm font-medium transition-colors duration-1 ease-ease hover:bg-paper-wash"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!name.trim() || saving}
              className="flex-1 rounded-input border border-lagoon-strong bg-lagoon py-2.5 text-sm font-medium text-fg-on-ink transition-colors duration-1 ease-ease hover:bg-lagoon-strong disabled:opacity-50"
            >
              {saving ? "Adding…" : "Add hobby"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
