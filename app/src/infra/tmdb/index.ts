// Singleton TmdbClient. Lazy-init so the env throw doesn't fire until
// something actually calls it (lets dev mode boot a screen even if
// the key is missing — caller sees a query error instead of a launch crash).

import { TmdbClient } from './client';
import { env } from '../../env';

let _client: TmdbClient | null = null;

export function getTmdbClient(): TmdbClient {
  if (_client) return _client;
  _client = new TmdbClient({ apiKey: env.tmdbKey });
  return _client;
}

export { TMDB_IMAGE } from './client';
export type { TitleDetail } from './client';
