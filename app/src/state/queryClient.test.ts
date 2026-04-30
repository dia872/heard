import { createQueryClient, TTL } from './queryClient';

describe('queryClient', () => {
  it('default staleTime matches the trending TTL (1 hour)', () => {
    const qc = createQueryClient();
    const defaults = qc.getDefaultOptions();
    expect(defaults.queries?.staleTime).toBe(TTL.trending);
    expect(TTL.trending).toBe(60 * 60 * 1000);
  });

  it('exposes brainstorm-decision TTLs', () => {
    expect(TTL.trending).toBe(60 * 60 * 1000);
    expect(TTL.detail).toBe(24 * 60 * 60 * 1000);
    expect(TTL.watchProviders).toBe(6 * 60 * 60 * 1000);
    expect(TTL.search).toBe(60 * 60 * 1000);
  });

  it('disables refetchOnWindowFocus (mobile-irrelevant + costs requests)', () => {
    const qc = createQueryClient();
    expect(qc.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false);
  });

  it('retries twice by default', () => {
    const qc = createQueryClient();
    expect(qc.getDefaultOptions().queries?.retry).toBe(2);
  });
});
