import { HEARD_COLORS, STREAMER_COLORS } from './tokens';

describe('design tokens', () => {
  it('HEARD_COLORS matches the prototype primitives', () => {
    expect(HEARD_COLORS).toEqual({
      bg: '#faf8f3',
      bg2: '#f3efe7',
      ink: '#1a1a1a',
      muted: '#666666',
      faint: '#999999',
      hair: 'rgba(26,26,26,0.08)',
      rust: '#c2410c',
      rustSoft: '#fff3e6',
    });
  });

  it('STREAMER_COLORS includes all 7 services from src_data.jsx', () => {
    expect(Object.keys(STREAMER_COLORS).sort()).toEqual([
      'appletv', 'disney', 'hulu', 'max', 'netflix', 'peacock', 'prime',
    ]);
    expect(STREAMER_COLORS.netflix).toBe('#E50914');
    expect(STREAMER_COLORS.max).toBe('#002BE7');
  });
});

describe('tailwind theme', () => {
  it('encodes the HEARD_COLORS palette and STREAMER_COLORS under their namespaces', () => {
    const config = require('../tailwind.config.js');
    const { colors } = config.theme.extend;

    expect(colors.heard.bg).toBe(HEARD_COLORS.bg);
    expect(colors.heard.ink).toBe(HEARD_COLORS.ink);
    expect(colors.heard.rust).toBe(HEARD_COLORS.rust);
    expect(colors.heard['rust-soft']).toBe(HEARD_COLORS.rustSoft);
    expect(colors.streamer.netflix).toBe(STREAMER_COLORS.netflix);
  });

  it('declares the editorial type scale (h-display through h-footer)', () => {
    const config = require('../tailwind.config.js');
    const sizes = config.theme.extend.fontSize;
    expect(sizes['h-display'][0]).toBe('38px');
    expect(sizes['h-modal'][0]).toBe('22px');
    expect(sizes['h-body'][0]).toBe('12px');
    expect(sizes['m-label'][0]).toBe('8px');
  });
});
