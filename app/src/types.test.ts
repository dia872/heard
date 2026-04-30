// Type-only smoke tests. tsc verifies these compile; jest only confirms
// the file loads (no runtime types to assert).

import type {
  TmdbTitle,
  TmdbWatchProviders,
  ExtractResult,
  InboxEntry,
  SavedTitle,
  OwnedService,
  CaptureSource,
  Confidence,
  StreamerId,
} from './types';

describe('domain types', () => {
  it('TmdbTitle requires the prototype shape', () => {
    const t: TmdbTitle = {
      id: 107,
      title: 'Severance',
      year: '2022',
      mediaType: 'tv',
      voteAverage: 8.7,
      popularity: 380,
      posterPath: '/lFf6LLrQjYldcZItzOkGmMMigP7.jpg',
      backdropPath: null,
      overview: 'Mark leads a team of office workers…',
      genres: ['thriller', 'scifi'],
    };
    expect(t.id).toBe(107);
  });

  it('ExtractResult.confidence is constrained to high/med/low', () => {
    const r: ExtractResult = {
      title: 'Severance',
      year: '2022',
      tmdbId: 107,
      mediaType: 'tv',
      confidence: 'high',
      alts: [],
    };
    expect(r.confidence).toBe('high');
  });

  it('InboxEntry.status moves through the 4 known states', () => {
    const states: InboxEntry['status'][] = ['pending', 'saved', 'dismissed', 'archived'];
    expect(states).toHaveLength(4);
  });

  it('CaptureSource includes the headline url path (TikTok generalization)', () => {
    const sources: CaptureSource[] = ['voice', 'paste', 'screenshot', 'url', 'tiktok'];
    expect(sources).toContain('url');
  });

  it('TmdbWatchProviders carries an updatedAt for freshness UI', () => {
    const wp: TmdbWatchProviders = {
      providers: [{ id: 'netflix', name: 'Netflix', type: 'flatrate' }],
      updatedAt: '2026-04-29T12:00:00Z',
    };
    expect(wp.updatedAt).toBeTruthy();
  });
});
