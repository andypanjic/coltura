import type { Specimen } from "./types";
import { hexToOklch, nearestPaletteDistance } from "./color";

interface SearchResult {
  specimen: Specimen;
  score: number;
}

export function textSearch(specimens: Specimen[], query: string): Specimen[] {
  if (!query.trim()) return [];
  
  const searchTerms = query.toLowerCase().trim().split(/\s+/);
  const results: SearchResult[] = [];
  
  for (const specimen of specimens) {
    let score = 0;
    
    for (const term of searchTerms) {
      // Name matches (highest priority)
      if (specimen.name.toLowerCase().includes(term)) {
        score += 10;
      }
      
      // Place matches (high priority)
      if (specimen.place?.toLowerCase().includes(term)) {
        score += 7;
      }
      
      // Recipient matches (high priority)
      if (specimen.recipient?.toLowerCase().includes(term)) {
        score += 7;
      }
      
      // Tag matches (medium priority)
      for (const tag of specimen.tags) {
        if (tag.toLowerCase().includes(term)) {
          score += 5;
          break;
        }
      }
      
      // Body text matches (lower priority)
      if (specimen.body?.toLowerCase().includes(term)) {
        score += 3;
      }
      
      // Notes transcript matches (lower priority)
      for (const note of specimen.notes) {
        if (note.transcript?.toLowerCase().includes(term)) {
          score += 3;
          break;
        }
      }
    }
    
    if (score > 0) {
      results.push({ specimen, score });
    }
  }
  
  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  
  return results.map(r => r.specimen);
}

export function colorSearch(specimens: Specimen[], hex: string): Specimen[] {
  const targetOklch = hexToOklch(hex);
  const results: SearchResult[] = [];
  
  // Sensible threshold for color similarity (adjust based on testing)
  const maxDistance = 0.35;
  
  for (const specimen of specimens) {
    if (specimen.palette.length === 0) continue;
    
    const distance = nearestPaletteDistance(specimen.palette, targetOklch);
    
    if (distance <= maxDistance) {
      results.push({
        specimen,
        score: distance // Lower distance = better match
      });
    }
  }
  
  // Sort by distance ascending (closer colors first)
  results.sort((a, b) => a.score - b.score);
  
  return results.map(r => r.specimen);
}