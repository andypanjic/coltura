import Link from "next/link";
import { COLLECTIONS } from "@/lib/collections";
import type { Specimen } from "@/lib/types";

export function SpecimenCard({ specimen }: { specimen: Specimen }) {
  const collection = COLLECTIONS.find(c => c.kind === specimen.collection);
  const primaryImage = specimen.media[0];
  const dateStr = specimen.date ? new Date(specimen.date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  }) : '';
  
  return (
    <Link
      href={`/finds/${specimen.id}`}
      className="group block overflow-hidden rounded-card border border-rule bg-paper-white transition-colors duration-1 hover:bg-paper-wash"
    >
      {primaryImage && (
        <div className="relative aspect-square overflow-hidden bg-paper">
          <img 
            src={primaryImage.url} 
            alt={specimen.name}
            className="h-full w-full object-cover"
          />
          {specimen.palette.length > 0 && (
            <div className="absolute bottom-2 left-2 flex gap-0.5 rounded-pill border border-rule bg-paper-white/90 px-1.5 py-1 backdrop-blur-sm">
              {specimen.palette.slice(0, 3).map((color, i) => (
                <div
                  key={i}
                  className="h-3 w-3 rounded-full border border-rule-soft"
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="px-4 py-3">
        <h3 className="font-display text-base font-medium tracking-tight text-ink">
          {specimen.name}
        </h3>
        
        {(dateStr || specimen.place) && (
          <p className="mt-0.5 font-mono text-xs uppercase text-fg-muted">
            {dateStr}{dateStr && specimen.place && ' · '}{specimen.place}
          </p>
        )}
        
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {collection && (
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: collection.accent }}
              />
              <span className="smallcaps text-xs text-fg-quiet">{collection.label}</span>
            </span>
          )}
          {specimen.status && (
            <span className="rounded-pill border border-rule px-2 py-0.5 text-[10px] uppercase text-fg-muted">
              {specimen.status}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}