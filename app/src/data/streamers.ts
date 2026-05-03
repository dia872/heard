// Static streamer catalog. Mirrors the prototype's STREAMERS array
// (src_data.jsx) but uses our typed StreamerId from tokens.ts.
//
// Add a new streamer in three places:
//   1. Here (entry below)
//   2. src/tokens.ts STREAMER_COLORS
//   3. infra/tmdb/client.ts TMDB_PROVIDER_TO_STREAMER

import type { StreamerId } from '../tokens';

export interface Streamer {
  id: StreamerId;
  name: string;
  monthly: string;
  /** Short letterform for the StreamerLogo glyph. */
  glyph: string;
  /** Background color for the StreamerLogo. */
  color: string;
  /** Foreground color for the glyph. */
  textOn: string;
}

export const STREAMERS: Streamer[] = [
  { id: 'netflix', name: 'Netflix',     monthly: '$15.49', glyph: 'N',   color: '#E50914', textOn: '#fff' },
  { id: 'prime',   name: 'Prime Video', monthly: '$8.99',  glyph: '▶',   color: '#00A8E1', textOn: '#fff' },
  { id: 'appletv', name: 'Apple TV+',   monthly: '$9.99',  glyph: 'tv+', color: '#1a1a1a', textOn: '#fff' },
  { id: 'max',     name: 'Max',         monthly: '$9.99',  glyph: 'M',   color: '#002BE7', textOn: '#fff' },
  { id: 'hulu',    name: 'Hulu',        monthly: '$7.99',  glyph: 'H',   color: '#1CE783', textOn: '#000' },
  { id: 'disney',  name: 'Disney+',     monthly: '$7.99',  glyph: 'D+',  color: '#113CCF', textOn: '#fff' },
  { id: 'peacock', name: 'Peacock',     monthly: '$5.99',  glyph: 'P',   color: '#0047AB', textOn: '#fff' },
];

export const STREAMER_BY_ID: Record<StreamerId, Streamer> = STREAMERS.reduce(
  (acc, s) => ({ ...acc, [s.id]: s }),
  {} as Record<StreamerId, Streamer>
);

/**
 * Split a title's streamer ids into "owned" vs "missing" relative to the
 * user. Used by the title detail screen and the saved-screen filter tabs.
 */
export function splitStreamers(
  titleStreamerIds: readonly StreamerId[],
  ownedIds: readonly StreamerId[]
): { owned: StreamerId[]; missing: StreamerId[] } {
  const ownedSet = new Set(ownedIds);
  return {
    owned:   titleStreamerIds.filter((id) => ownedSet.has(id)),
    missing: titleStreamerIds.filter((id) => !ownedSet.has(id)),
  };
}
