// Confidence gating. The /extract Edge Function returns its own confidence
// label, but we re-grade client-side using the cross-product of:
//   - Did Claude produce a title?
//   - Did TMDB find a unique match?
//   - Were there multiple plausible matches (alts)?
//
// Why client-side too: even with server-side gating we want explicit,
// auditable rules here (the prototype's confidence values are hardcoded;
// PRD §14 leaves real ML to v0.6+). Keeping the rule explicit gives us
// a clean signal to compare against any future ML model.

import type { ExtractResult, Confidence } from '../types';

/**
 * Recompute confidence from the extraction result. The server gives us
 * its own label, but we trust this gate as the canonical client view.
 */
export function confidenceGate(result: ExtractResult): Confidence {
  // No title and no TMDB match — model couldn't identify anything.
  if (!result.title && !result.tmdbId) return 'low';

  // TMDB matched and there are no plausible alternatives — high confidence.
  if (result.tmdbId !== null && result.alts.length === 0) return 'high';

  // TMDB matched but other titles are plausible — needs disambiguation.
  if (result.tmdbId !== null && result.alts.length > 0) return 'med';

  // Claude produced a title but TMDB couldn't validate it.
  // The user might still want to save the raw text, but flag it low.
  if (result.title && !result.tmdbId) return 'low';

  return 'low';
}

/**
 * Confidence determines what the capture flow does on submit:
 *   - high → auto-save to inbox + toast
 *   - med  → confirmation sheet ("Did you mean X?") with alts
 *   - low  → show alts, offer manual entry
 */
export type GateAction = 'auto-save' | 'confirm' | 'manual';

export function gateAction(c: Confidence): GateAction {
  switch (c) {
    case 'high': return 'auto-save';
    case 'med':  return 'confirm';
    case 'low':  return 'manual';
  }
}
