// Inbox — your captured entries, newest-first. Each entry shows
// extraction snippet, source pill, confidence meter, timestamp, and
// 3 actions: Save (→ Saved library), Dismiss (soft-delete), Archive.

import { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eyebrow } from '../../src/ui/Eyebrow';
import { Pill } from '../../src/ui/Pill';
import { ConfidenceMeter } from '../../src/ui/ConfidenceMeter';
import { GhostButton, PrimaryButton, IconButton } from '../../src/ui/buttons';
import { Skeleton } from '../../src/ui/Skeleton';
import { useRepos } from '../../src/state/AuthContext';
import { toast } from '../../src/ui/toast';
import type { InboxEntry } from '../../src/types';

export default function Inbox() {
  const repos = useRepos();
  const [entries, setEntries] = useState<InboxEntry[] | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const reload = async () => {
    try {
      const list = await repos.inbox.list();
      setEntries(list);
    } catch (e) {
      console.error('[inbox.list]', e);
      toast.error('Could not load inbox');
      setEntries([]);
    }
  };

  useEffect(() => { reload(); }, [repos]);

  const handleAction = async (id: string, action: 'save' | 'dismiss' | 'archive') => {
    try {
      if (action === 'save') {
        const entry = entries?.find((e) => e.id === id);
        if (entry?.tmdbId) {
          await repos.saved.add({
            tmdbId: entry.tmdbId,
            title: entry.title ?? entry.rawText,
            year: entry.year,
            posterPath: null, // detail screen will hydrate later
          });
        }
        await repos.inbox.markSaved(id);
        toast.success('Saved to library');
      } else if (action === 'dismiss') {
        await repos.inbox.dismiss(id);
        toast.info('Dismissed');
      } else {
        await repos.inbox.archive(id);
        toast.info('Archived');
      }
      reload();
    } catch (e) {
      console.error(`[inbox.${action}]`, e);
      toast.error('Something went wrong');
    }
  };

  const isLoading = entries === null;
  const isEmpty = entries !== null && entries.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-heard-bg" edges={['top']}>
      <ScrollView
        contentContainerClassName="pb-15"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={async () => { setIsRefreshing(true); await reload(); setIsRefreshing(false); }}
          />
        }
      >
        <View className="px-5.5 pt-3 pb-3.5">
          <Text className="font-serif-italic text-h-large text-heard-ink tracking-tight-2">
            Your captures
          </Text>
          <Text className="font-mono text-m-button-sm text-heard-faint uppercase tracking-wide-15 mt-1">
            {isLoading ? '—' : `${entries!.length} pending`}
          </Text>
        </View>

        {isLoading && (
          <View className="px-5.5 gap-3.5">
            {[0, 1, 2].map((i) => (
              <View key={i} className="border border-heard-hair rounded-tight p-3.5 gap-2">
                <Skeleton height={14} />
                <Skeleton height={10} width={'70%' as `${number}%`} />
                <Skeleton height={10} width={'40%' as `${number}%`} />
              </View>
            ))}
          </View>
        )}

        {isEmpty && (
          <View className="px-5.5 mt-3.5 gap-3.5">
            <Eyebrow num="◦">No captures yet</Eyebrow>
            <Text className="font-serif text-h-body text-heard-muted">
              Tap the rust circle below to capture anything you've heard about — voice, paste, screenshot, or a TikTok / YouTube / article link.
            </Text>
          </View>
        )}

        {!isLoading && !isEmpty && (
          <View className="px-5.5 gap-3.5">
            {entries!.map((entry) => (
              <InboxRow key={entry.id} entry={entry} onAction={handleAction} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InboxRow({
  entry, onAction,
}: {
  entry: InboxEntry;
  onAction: (id: string, action: 'save' | 'dismiss' | 'archive') => void;
}) {
  const sourcePillLabel = sourceLabel(entry.source);
  const ago = formatAgo(entry.capturedAt);

  return (
    <View className="border border-heard-hair rounded-tight p-3.5 gap-3 bg-white">
      <View className="flex-row items-center justify-between">
        <Pill tone="neutral">{sourcePillLabel}</Pill>
        <Text className="font-mono text-m-label text-heard-faint uppercase tracking-wide-15">
          {ago}
        </Text>
      </View>

      <Text className="font-serif-italic text-h-small text-heard-ink tracking-tight-1" numberOfLines={3}>
        {entry.title ?? entry.rawText}
      </Text>

      {entry.year && (
        <Text className="font-mono text-m-button-sm text-heard-faint uppercase tracking-wide-15">
          {entry.year} · {entry.tmdbId ? 'matched' : 'unmatched'}
        </Text>
      )}

      <ConfidenceMeter level={entry.confidence} />

      <View className="flex-row gap-2 pt-1">
        <View className="flex-1">
          <PrimaryButton label="Save" onPress={() => onAction(entry.id, 'save')} />
        </View>
        <View className="flex-1">
          <GhostButton label="Dismiss" onPress={() => onAction(entry.id, 'dismiss')} />
        </View>
        <IconButton glyph="◧" label="Archive" onPress={() => onAction(entry.id, 'archive')} />
      </View>
    </View>
  );
}

function sourceLabel(source: InboxEntry['source']): string {
  switch (source) {
    case 'voice':      return '◉ Voice';
    case 'paste':      return '◧ Paste';
    case 'screenshot': return '▣ Screenshot';
    case 'tiktok':     return '♪ TikTok';
    case 'url':        return '↗ Link';
  }
}

function formatAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const week = Math.floor(day / 7);
  return `${week}w ago`;
}
