"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/app/AppHeader";
import { COLLECTIONS } from "@/lib/collections";
import { putSpecimen } from "@/lib/db";
import { extractPaletteFromFile } from "@/lib/palette";
import type { Specimen, PaletteColor, MediaItem, CollectionKind } from "@/lib/types";

export default function NewSpecimenPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    place: "",
    recipient: "",
    collection: "bouquets",
    tags: "",
    notes: ""
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);

    const colors = await extractPaletteFromFile(file, 5);
    setPalette(colors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !formData.name) return;

    setIsLoading(true);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(imageFile);
      });
      const base64 = await base64Promise;

      const now = new Date().toISOString();
      const id = `specimen-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      const mediaItem: MediaItem = {
        id: `media-${Date.now()}`,
        url: base64,
        capturedAt: formData.date || now
      };

      const specimen: Specimen = {
        id,
        name: formData.name,
        collection: formData.collection as CollectionKind,
        date: formData.date || undefined,
        place: formData.place || undefined,
        recipient: formData.recipient || undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        notes: [],
        media: [mediaItem],
        palette,
        body: formData.notes || undefined,
        createdAt: now,
        updatedAt: now
      };

      await putSpecimen(specimen);
      router.push('/finds');
    } catch (error) {
      console.error('Failed to save specimen:', error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <AppHeader title="Document a find" />
      
      <form onSubmit={handleSubmit} className="px-5 py-4 pb-24">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-wide text-fg-muted">
              Photograph
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="hidden"
            />
            
            {imageUrl ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative overflow-hidden rounded-card border border-rule bg-paper-white"
              >
                <img 
                  src={imageUrl} 
                  alt="Specimen" 
                  className="h-64 w-full object-cover"
                />
                {palette.length > 0 && (
                  <div className="absolute bottom-3 left-3 flex gap-1 rounded-pill border border-rule bg-paper-white/90 px-2 py-1.5 backdrop-blur-sm">
                    {palette.map((color, i) => (
                      <div
                        key={i}
                        className="h-4 w-4 rounded-full border border-rule-soft"
                        style={{ backgroundColor: color.hex }}
                        title={color.hex}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-64 w-full items-center justify-center rounded-card border-2 border-dashed border-rule-strong bg-paper-edge text-fg-muted transition-colors duration-1 hover:bg-paper-wash"
              >
                <div className="text-center">
                  <p className="font-display text-lg italic">Add photograph</p>
                  <p className="mt-1 text-sm text-fg-quiet">Tap to capture or select</p>
                </div>
              </button>
            )}
          </div>

          <div>
            <label htmlFor="name" className="mb-2 block font-mono text-xs uppercase tracking-wide text-fg-muted">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="What you'll call this find"
              className="w-full rounded-input border border-rule bg-paper-white px-3 py-2 text-sm placeholder:italic placeholder:text-fg-faint focus:border-lagoon focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="mb-2 block font-mono text-xs uppercase tracking-wide text-fg-muted">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full rounded-input border border-rule bg-paper-white px-3 py-2 text-sm focus:border-lagoon focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="place" className="mb-2 block font-mono text-xs uppercase tracking-wide text-fg-muted">
                Place
              </label>
              <input
                id="place"
                type="text"
                value={formData.place}
                onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                placeholder="Where found"
                className="w-full rounded-input border border-rule bg-paper-white px-3 py-2 text-sm placeholder:italic placeholder:text-fg-faint focus:border-lagoon focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="collection" className="mb-2 block font-mono text-xs uppercase tracking-wide text-fg-muted">
              Collection
            </label>
            <select
              id="collection"
              value={formData.collection}
              onChange={(e) => setFormData({ ...formData, collection: e.target.value as any })}
              className="w-full rounded-input border border-rule bg-paper-white px-3 py-2 text-sm focus:border-lagoon focus:outline-none"
            >
              {COLLECTIONS.map((col) => (
                <option key={col.kind} value={col.kind}>
                  {col.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="recipient" className="mb-2 block font-mono text-xs uppercase tracking-wide text-fg-muted">
              Recipient
            </label>
            <input
              id="recipient"
              type="text"
              value={formData.recipient}
              onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              placeholder="Who it's for"
              className="w-full rounded-input border border-rule bg-paper-white px-3 py-2 text-sm placeholder:italic placeholder:text-fg-faint focus:border-lagoon focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="tags" className="mb-2 block font-mono text-xs uppercase tracking-wide text-fg-muted">
              Tags
            </label>
            <input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Comma-separated labels"
              className="w-full rounded-input border border-rule bg-paper-white px-3 py-2 text-sm placeholder:italic placeholder:text-fg-faint focus:border-lagoon focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="notes" className="mb-2 block font-mono text-xs uppercase tracking-wide text-fg-muted">
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional details"
              rows={3}
              className="w-full rounded-input border border-rule bg-paper-white px-3 py-2 text-sm placeholder:italic placeholder:text-fg-faint focus:border-lagoon focus:outline-none"
            />
          </div>
        </div>

        <div className="fixed bottom-20 left-0 right-0 bg-gradient-to-t from-paper via-paper to-transparent px-5 pb-4 pt-8">
          <div className="flex gap-3">
            <Link
              href="/finds"
              className="flex-1 rounded-input border border-rule bg-paper py-2.5 text-center text-sm font-medium transition-colors duration-1 ease-ease hover:bg-paper-wash"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!imageFile || !formData.name || isLoading}
              className="flex-1 rounded-input border border-lagoon-strong bg-lagoon py-2.5 text-sm font-medium text-fg-on-ink transition-colors duration-1 ease-ease hover:bg-lagoon-strong disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save specimen"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}