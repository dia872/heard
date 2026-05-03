import { STREAMERS, STREAMER_BY_ID, splitStreamers } from './streamers';

describe('streamers data', () => {
  it('STREAMERS contains all 7 v0.2 services', () => {
    expect(STREAMERS.map((s) => s.id).sort()).toEqual([
      'appletv', 'disney', 'hulu', 'max', 'netflix', 'peacock', 'prime',
    ]);
  });

  it('STREAMER_BY_ID looks up by id', () => {
    expect(STREAMER_BY_ID.netflix.name).toBe('Netflix');
    expect(STREAMER_BY_ID.appletv.glyph).toBe('tv+');
  });

  it('splits owned vs missing relative to user services', () => {
    const result = splitStreamers(['netflix', 'max', 'peacock'], ['netflix', 'hulu']);
    expect(result.owned).toEqual(['netflix']);
    expect(result.missing).toEqual(['max', 'peacock']);
  });

  it('handles empty title streamer list', () => {
    expect(splitStreamers([], ['netflix'])).toEqual({ owned: [], missing: [] });
  });
});
