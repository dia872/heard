// Editorial moods — the 8 hand-curated buckets on the Front screen.
// Mirrors the prototype's MOODS array. Genre maps to a TMDB query
// when the user drills into a mood (Phase 5 mood detail).
//
// Front screen renders 4 of these in a 2×2; the rest live in MoodScreen.

export type MoodId =
  | 'belly-laughs' | 'ugly-cry' | 'on-edge' | 'warm-fuzzy'
  | 'big-ideas' | 'adrenaline' | 'true-stuff' | 'kids-up';

export interface Mood {
  id: MoodId;
  label: string;
  emoji: string;
  /** Tag shown in mono caps under the title. */
  tag: string;
  /** Pastel background tint behind the emoji. */
  tint: string;
  /** TMDB genre filter slug. */
  genre: string;
  description: string;
}

export const MOODS: Mood[] = [
  { id: 'belly-laughs', label: 'Belly Laughs',  emoji: '🪩', tag: 'COMEDY',     tint: '#FFE066', genre: 'comedy',     description: 'Comedies that actually deliver' },
  { id: 'ugly-cry',     label: 'Ugly Cry',      emoji: '🌧', tag: 'DRAMA',      tint: '#A8C7FA', genre: 'drama',      description: 'Dramas that hit hard' },
  { id: 'on-edge',      label: 'On Edge',       emoji: '🔪', tag: 'THRILLER',   tint: '#FF6B6B', genre: 'thriller',   description: 'Thrillers, chills, suspense' },
  { id: 'warm-fuzzy',   label: 'Warm & Fuzzy',  emoji: '🌸', tag: 'ROMANCE',    tint: '#FFB5C5', genre: 'romance',    description: 'Romance, comfort, heart' },
  { id: 'big-ideas',    label: 'Big Ideas',     emoji: '🌌', tag: 'SCI-FI',     tint: '#B794F4', genre: 'scifi',      description: 'Sci-fi & mind-benders' },
  { id: 'adrenaline',   label: 'Adrenaline',    emoji: '⚡', tag: 'ACTION',     tint: '#FF8C42', genre: 'action',     description: 'Action, heists, set pieces' },
  { id: 'true-stuff',   label: 'True Stuff',    emoji: '📰', tag: 'DOCS',       tint: '#7DD3C0', genre: 'documentary', description: 'Documentaries worth your time' },
  { id: 'kids-up',      label: 'Kids Are Up',   emoji: '🧸', tag: 'FAMILY',     tint: '#FCD34D', genre: 'family',     description: "Family picks that don't suck" },
];

export const MOODS_BY_ID: Record<MoodId, Mood> = MOODS.reduce(
  (acc, m) => ({ ...acc, [m.id]: m }),
  {} as Record<MoodId, Mood>
);

/** Front screen shows 4 — the editorial "this week's picks" set. */
export const FRONT_MOOD_IDS: readonly MoodId[] = [
  'belly-laughs', 'ugly-cry', 'on-edge', 'warm-fuzzy',
];
