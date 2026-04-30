// AsyncStorage-backed repos for guest mode. Each repo serializes the
// whole list into a single key — fine at v0.5 scale (a user's saved
// list is realistically <500 items). Switch to per-item keys if growth
// data shows multi-MB serialization on cold reads.

import type {
  InboxEntry,
  SavedTitle,
  OwnedService,
  StreamerId,
} from '../../types';
import type {
  AddInboxInput,
  InboxRepo,
  KeyValueStore,
  OwnedRepo,
  SavedRepo,
} from '../../domain/repos';

const KEYS = {
  inbox: 'heard:inbox',
  saved: 'heard:saved',
  owned: 'heard:owned',
} as const;

const DISMISS_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ─── small helpers ────────────────────────────────────────────────────────

async function readArray<T>(store: KeyValueStore, key: string): Promise<T[]> {
  const raw = await store.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function writeArray<T>(store: KeyValueStore, key: string, items: T[]): Promise<void> {
  await store.setItem(key, JSON.stringify(items));
}

function uuid(): string {
  // Simple ID — collision-safe for one user's local store.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// ─── InboxRepo ────────────────────────────────────────────────────────────

export class AsyncInboxRepo implements InboxRepo {
  constructor(private readonly store: KeyValueStore, private readonly now = () => Date.now()) {}

  async list(): Promise<InboxEntry[]> {
    const all = await this.listIncludingDismissed();
    return all.filter((e) => e.status !== 'dismissed' && e.status !== 'archived');
  }

  async listIncludingDismissed(): Promise<InboxEntry[]> {
    const items = await readArray<InboxEntry>(this.store, KEYS.inbox);
    // Drop dismissed entries past their 30-day TTL.
    const cutoff = this.now() - DISMISS_TTL_MS;
    const live = items.filter((e) => {
      if (e.status === 'dismissed' && e.deletedAt) {
        return new Date(e.deletedAt).getTime() >= cutoff;
      }
      return true;
    });
    if (live.length !== items.length) await writeArray(this.store, KEYS.inbox, live);
    return live;
  }

  async add(input: AddInboxInput): Promise<InboxEntry> {
    const items = await readArray<InboxEntry>(this.store, KEYS.inbox);
    const entry: InboxEntry = {
      id: uuid(),
      rawText: input.rawText,
      source: input.source,
      sourceUrl: input.sourceUrl ?? null,
      tmdbId: input.tmdbId,
      title: input.title,
      year: input.year,
      confidence: input.confidence,
      altMatches: input.altMatches ?? [],
      status: 'pending',
      capturedAt: new Date(this.now()).toISOString(),
      deletedAt: null,
    };
    await writeArray(this.store, KEYS.inbox, [entry, ...items]);
    return entry;
  }

  async markSaved(id: string) { await this.setStatus(id, 'saved'); }
  async dismiss(id: string)   { await this.setStatus(id, 'dismissed'); }
  async archive(id: string)   { await this.setStatus(id, 'archived'); }

  async remove(id: string): Promise<void> {
    const items = await readArray<InboxEntry>(this.store, KEYS.inbox);
    await writeArray(this.store, KEYS.inbox, items.filter((e) => e.id !== id));
  }

  private async setStatus(id: string, status: InboxEntry['status']): Promise<void> {
    const items = await readArray<InboxEntry>(this.store, KEYS.inbox);
    const next = items.map((e) =>
      e.id === id
        ? {
            ...e,
            status,
            deletedAt: status === 'dismissed' ? new Date(this.now()).toISOString() : e.deletedAt ?? null,
          }
        : e
    );
    await writeArray(this.store, KEYS.inbox, next);
  }
}

// ─── SavedRepo ────────────────────────────────────────────────────────────

export class AsyncSavedRepo implements SavedRepo {
  constructor(private readonly store: KeyValueStore, private readonly now = () => Date.now()) {}

  async list(): Promise<SavedTitle[]> {
    return readArray<SavedTitle>(this.store, KEYS.saved);
  }

  async add(t: Omit<SavedTitle, 'id' | 'addedAt'>): Promise<SavedTitle> {
    const items = await this.list();
    if (items.some((s) => s.tmdbId === t.tmdbId)) {
      return items.find((s) => s.tmdbId === t.tmdbId)!;
    }
    const saved: SavedTitle = {
      id: `local:${t.tmdbId}`,
      tmdbId: t.tmdbId,
      title: t.title,
      year: t.year,
      posterPath: t.posterPath,
      addedAt: new Date(this.now()).toISOString(),
    };
    await writeArray(this.store, KEYS.saved, [saved, ...items]);
    return saved;
  }

  async remove(tmdbId: number): Promise<void> {
    const items = await this.list();
    await writeArray(this.store, KEYS.saved, items.filter((s) => s.tmdbId !== tmdbId));
  }

  async toggle(t: Omit<SavedTitle, 'id' | 'addedAt'>): Promise<'saved' | 'unsaved'> {
    if (await this.has(t.tmdbId)) {
      await this.remove(t.tmdbId);
      return 'unsaved';
    }
    await this.add(t);
    return 'saved';
  }

  async has(tmdbId: number): Promise<boolean> {
    const items = await this.list();
    return items.some((s) => s.tmdbId === tmdbId);
  }
}

// ─── OwnedRepo ────────────────────────────────────────────────────────────

export class AsyncOwnedRepo implements OwnedRepo {
  constructor(private readonly store: KeyValueStore, private readonly now = () => Date.now()) {}

  async list(): Promise<OwnedService[]> {
    return readArray<OwnedService>(this.store, KEYS.owned);
  }

  async set(serviceIds: StreamerId[]): Promise<OwnedService[]> {
    const existing = await this.list();
    const now = new Date(this.now()).toISOString();
    // Preserve addedAt for services already owned; new entries get current time.
    const next: OwnedService[] = serviceIds.map((id) => {
      const prev = existing.find((o) => o.serviceId === id);
      return prev ?? { serviceId: id, addedAt: now };
    });
    await writeArray(this.store, KEYS.owned, next);
    return next;
  }

  async add(serviceId: StreamerId): Promise<void> {
    const list = await this.list();
    if (list.some((o) => o.serviceId === serviceId)) return;
    list.push({ serviceId, addedAt: new Date(this.now()).toISOString() });
    await writeArray(this.store, KEYS.owned, list);
  }

  async remove(serviceId: StreamerId): Promise<void> {
    const list = await this.list();
    await writeArray(this.store, KEYS.owned, list.filter((o) => o.serviceId !== serviceId));
  }

  async has(serviceId: StreamerId): Promise<boolean> {
    const list = await this.list();
    return list.some((o) => o.serviceId === serviceId);
  }
}

// ─── In-memory store for tests ────────────────────────────────────────────

export class MemoryStore implements KeyValueStore {
  private map = new Map<string, string>();
  async getItem(key: string) { return this.map.get(key) ?? null; }
  async setItem(key: string, value: string) { this.map.set(key, value); }
  async removeItem(key: string) { this.map.delete(key); }
  /** Test helper. */
  raw() { return new Map(this.map); }
}
