import { formatFreshnessLabel, streamerCtaCopy } from './detail';

describe('detail helpers', () => {
  it('formats TMDB watch-provider freshness for the title detail surface', () => {
    const now = new Date('2026-05-06T12:00:00Z');

    expect(formatFreshnessLabel('2026-05-06T11:58:00Z', now)).toBe('Updated just now');
    expect(formatFreshnessLabel('2026-05-06T09:00:00Z', now)).toBe('Updated 3h ago');
    expect(formatFreshnessLabel('2026-05-04T12:00:00Z', now)).toBe('Updated 2d ago');
  });

  it('returns distinct streamer CTA copy for owned and non-owned services', () => {
    expect(streamerCtaCopy('Apple TV+', '$9.99', true)).toMatchObject({
      eyebrow: 'Already paying for this',
      button: 'Show me more on Apple TV+',
    });
    expect(streamerCtaCopy('Apple TV+', '$9.99', false)).toMatchObject({
      eyebrow: 'Ready?',
      button: 'Plan my month',
    });
  });
});
