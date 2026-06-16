"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/app/AppHeader";
import { putMaterial } from "@/lib/db";
import { extractPaletteFromFile } from "@/lib/palette";
import type { Material, PaletteColor } from "@/lib/types";

const YARN_WEIGHTS = [
  { value: 0, label: "Lace" },
  { value: 1, label: "Fingering" },
  { value: 2, label: "Sport" },
  { value: 3, label: "DK" },
  { value: 4, label: "Worsted" },
  { value: 5, label: "Bulky" },
  { value: 6, label: "Super bulky" },
  { value: 7, label: "Jumbo" },
];

export default function NewStashPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    fiber: "",
    weight: "",
    yardage: "",
    dyeLot: "",
    colorway: "",
    quantity: "1",
    source: "",
    cost: "",
    location: ""
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);

    // Extract colors
    const colors = await extractPaletteFromFile(file, 5);
    setPalette(colors);

    // OCR the ball band
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const base64 = await base64Promise;

      const response = await fetch("/api/ocr-ballband", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      if (response.ok) {
        const { draft } = await response.json();
        
        // Prefill form with OCR results (editable)
        setFormData(prev => ({
          ...prev,
          brand: draft.brand || prev.brand,
          fiber: draft.fiber || prev.fiber,
          weight: draft.weight !== undefined ? draft.weight.toString() : prev.weight,
          yardage: draft.yardage ? draft.yardage.toString() : prev.yardage,
          dyeLot: draft.dyeLot || prev.dyeLot,
          colorway: draft.colorway || prev.colorway,
          // Generate name from brand and colorway if available
          name: draft.brand && draft.colorway 
            ? `${draft.brand} ${draft.colorway}`.trim()
            : prev.name
        }));
      }
    } catch (error) {
      console.error("OCR failed:", error);
    } finally {
      setIsProcessing(false);
    }
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

      const id = `material-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      const material: Material = {
        id,
        name: formData.name,
        kind: "yarn",
        quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
        source: formData.source || undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        location: formData.location || undefined,
        imageUrl: base64,
        palette,
        // Knitting yarn specifics
        fiber: formData.fiber || undefined,
        weight: formData.weight ? parseInt(formData.weight) : undefined,
        yardage: formData.yardage ? parseInt(formData.yardage) : undefined,
        dyeLot: formData.dyeLot || undefined,
        colorway: formData.colorway || undefined,
      };

      await putMaterial(material);
      router.push('/stash');
    } catch (error) {
      console.error('Failed to save material:', error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <AppHeader title="Add to stash" />
      
      <form onSubmit={handleSubmit} className="px-5 py-4 pb-24 md:mx-auto md:max-w-2xl md:pb-8">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-wide text-fg-muted">
              Ball band photo
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
              <div className="space-y-3">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative overflow-hidden rounded-card border border-rule bg-paper-white"
                >
                  <img 
                    src={imageUrl} 
                    alt="Ball band" 
                    className="h-48 w-full object-cover"
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
                  {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-paper-white/80 backdrop-blur-sm">
                      <p className="font-display italic text-fg-muted">Reading ball band…</p>
                    </div>
                  )}
                </div>
                <p className="text-xs leading-body text-fg-quiet">
                  OCR extracted the details below. Review and edit as needed — the photo is the source of truth.
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-48 w-full items-center justify-center rounded-card border-2 border-dashed border-rule-strong bg-paper-edge text-fg-muted transition-colors duration-1 hover:bg-paper-wash"
              >
                <div className="text-center">
                  <p className="font-display text-lg italic">Add ball band photo</p>
                  <p className="mt-1 text-sm text-fg-quiet">OCR will extract details</p>
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
              placeholder="What you'll call this yarn"
              className="w-full rounded-input border border-rule bg-paper-white px-3 py-2 text-sm placeholder:italic placeholder:text-fg-faint focus:border-lagoon focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="brand" className="mb-2 block font-mono text-xs uppercase tracking-wide text-fg-muted">
                Brand
              </label>
              <input
                id="brand"
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Manufacturer"
                className="w-full rounded-input border border-rule bg-paper-white px-3 py-2 text-sm placeholder:italic placeholder:text-fg-faint focus:border-lagoon focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="colorway" className="mb-2 block font-mono text-xs uppercase tracking-wide text-fg-muted">
                Colorway
              </label>
              <input
                id="colorway"
                type="text"
                value={formData.colorway}
                onChange={(e) => setFormData({ ...formData, colorway: e.target.value })}
                placeholder="Color name"
                className="w-full rounded-input border border-rule bg-paper-white px-3 py-2 text-sm placeholder:italic placeholder:text-fg-faint focus:border-lagoon focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="fiber" className="mb-2 block font-mono text-xs uppercase tracking-wide text-fg-muted">
              Fiber content
            </label>
            <input
              id="fiber"
              type="text"
              value={formData.fiber}
              onChange={(e) => setFormData({ ...formData, fiber: e.target.value })}
              placeholder="100% wool, 80% merino 20% nylon…"
              className="w-full rounded-input border border-rule bg-paper-white px-3 py-2 text-sm placeholder:italic placeholder:text-fg-faint focus:border-lagoon focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="weight" className="mb-2 block font-mono text-xs uppercase tracking-wide text-fg-muted">
                Weight
              </label>
              <select
                id="weight"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full rounded-input border border-rule bg-paper-white px-3 py-2 text-sm focus:border-lagoon focus:outline-none"
              >
                <option value="">Select weight</option>
                {YARN_WEIGHTS.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="yardage" className="mb-2 block font-mono text-xs uppercase tracking-wide text-fg-muted">
                Yardage
              </label>
              <input
                id="yardage"
                type="number"
                value={formData.yardage}
                onChange={(e) => setFormData({ ...formData, yardage: e.target.value })}
                placeholder="Total yards"
                className="w-full rounded-input border border-rule bg-paper-white px-3 py-2 text-sm placeholder:italic placeholder:text-fg-faint focus:border-lagoon focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dyeLot" className="mb-2 block font-mono text-xs uppercase tracking-wide text-fg-muted">
                Dye lot
              </label>
              <input
                id="dyeLot"
                type="text"
                value={formData.dyeLot}
                onChange={(e) => setFormData({ ...formData, dyeLot: e.target.value })}
                placeholder="Lot number"
                className="w-full rounded-input border border-rule bg-paper-white px-3 py-2 text-sm placeholder:italic placeholder:text-fg-faint focus:border-lagoon focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="quantity" className="mb-2 block font-mono text-xs uppercase tracking-wide text-fg-muted">
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="Skeins"
                className="w-full rounded-input border border-rule bg-paper-white px-3 py-2 text-sm placeholder:italic placeholder:text-fg-faint focus:border-lagoon focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="source" className="mb-2 block font-mono text-xs uppercase tracking-wide text-fg-muted">
                Source
              </label>
              <input
                id="source"
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="Where from"
                className="w-full rounded-input border border-rule bg-paper-white px-3 py-2 text-sm placeholder:italic placeholder:text-fg-faint focus:border-lagoon focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="location" className="mb-2 block font-mono text-xs uppercase tracking-wide text-fg-muted">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Where stored"
                className="w-full rounded-input border border-rule bg-paper-white px-3 py-2 text-sm placeholder:italic placeholder:text-fg-faint focus:border-lagoon focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="fixed bottom-20 left-0 right-0 bg-gradient-to-t from-paper via-paper to-transparent px-5 pb-4 pt-8 md:static md:mt-6 md:bg-none md:p-0">
          <div className="flex gap-3">
            <Link
              href="/stash"
              className="flex-1 rounded-input border border-rule bg-paper py-2.5 text-center text-sm font-medium transition-colors duration-1 ease-ease hover:bg-paper-wash"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!imageFile || !formData.name || isLoading}
              className="flex-1 rounded-input border border-lagoon-strong bg-lagoon py-2.5 text-sm font-medium text-fg-on-ink transition-colors duration-1 ease-ease hover:bg-lagoon-strong disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Add to stash"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}