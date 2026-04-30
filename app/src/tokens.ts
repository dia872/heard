// Mirror of tailwind.config.js tokens for code-side access (StyleSheet,
// dynamic colors, animations) without re-resolving tailwind classes.
// Keep in sync with tailwind.config.js.

export const HEARD_COLORS = {
  bg: '#faf8f3',
  bg2: '#f3efe7',
  ink: '#1a1a1a',
  muted: '#666666',
  faint: '#999999',
  hair: 'rgba(26,26,26,0.08)',
  rust: '#c2410c',
  rustSoft: '#fff3e6',
} as const;

export const STREAMER_COLORS = {
  netflix: '#E50914',
  prime: '#00A8E1',
  appletv: '#1a1a1a',
  max: '#002BE7',
  hulu: '#1CE783',
  disney: '#113CCF',
  peacock: '#0047AB',
} as const;

export type StreamerId = keyof typeof STREAMER_COLORS;
