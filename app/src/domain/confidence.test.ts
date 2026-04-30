import type { ExtractResult } from '../types';
import { confidenceGate, gateAction } from './confidence';

const base: ExtractResult = {
  title: null, year: null, tmdbId: null, mediaType: null,
  confidence: 'low', alts: [],
};

describe('confidenceGate', () => {
  it('high: TMDB match with no alts', () => {
    const r: ExtractResult = {
      ...base, title: 'Severance', year: '2022',
      tmdbId: 107, mediaType: 'tv', confidence: 'high',
    };
    expect(confidenceGate(r)).toBe('high');
  });

  it('med: TMDB match with plausible alternatives', () => {
    const r: ExtractResult = {
      ...base, title: 'The Bear', year: '2022',
      tmdbId: 101, mediaType: 'tv',
      alts: [{ tmdbId: 999, title: 'The Bear (1988)', year: '1988', mediaType: 'movie' }],
    };
    expect(confidenceGate(r)).toBe('med');
  });

  it('low: Claude produced a title but TMDB could not validate', () => {
    const r: ExtractResult = {
      ...base, title: 'A Made Up Show', tmdbId: null,
    };
    expect(confidenceGate(r)).toBe('low');
  });

  it('low: nothing extracted at all', () => {
    expect(confidenceGate(base)).toBe('low');
  });
});

describe('gateAction', () => {
  it('maps confidence to UI action', () => {
    expect(gateAction('high')).toBe('auto-save');
    expect(gateAction('med')).toBe('confirm');
    expect(gateAction('low')).toBe('manual');
  });
});
