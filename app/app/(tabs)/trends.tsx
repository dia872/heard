// Trends — three sub-tabs:
//   1. Most talked about → global trending list
//   2. By service       → list of streamer cards (drill-in to streamer screen)
//   3. On my services   → trending filtered to user's owned streamers
//
// Most-talked-about + On-my-services use TMDB trending. By-service is
// purely local (the 7 streamers + a few featured titles for each).

import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eyebrow } from '../../src/ui/Eyebrow';
import { SegmentedControl } from '../../src/ui/SegmentedControl';
import { TitleCard, TitleCardSize } from '../../src/ui/TitleCard';
import { Skeleton, TitleCardSkeleton } from '../../src/ui/Skeleton';
import { StreamerLogo } from '../../src/ui/StreamerLogo';
import { Pill } from '../../src/ui/Pill';
import { useTrending } from '../../src/hooks/useTmdb';
import { useRepos } from '../../src/state/AuthContext';
import { useEffect, useState as useReactState } from 'react';
import type { OwnedService, StreamerId } from '../../src/types';
import { STREAMERS } from '../../src/data/streamers';

type Tab = 'buzz' | 'services' | 'mine';

const TABS = [
  { value: 'buzz' as const,     label: 'Most talked about' },
  { value: 'services' as const, label: 'By service' },
  { value: 'mine' as const,     label: 'On my services' },
];

export default function Trends() {
  const [tab, setTab] = useState<Tab>('buzz');
  const trending = useTrending('week');
  const router = useRouter();

  const ownedIds = useOwnedIds();
  const filteredForOwned = trending.data?.slice(0, 12) ?? [];
  // True streamer-id filtering needs watch-providers per title; for v0.5
  // we approximate with TMDB's free metadata and let detail-screen
  // calls resolve actual availability.

  return (
    <SafeAreaView className="flex-1 bg-heard-bg" edges={['top']}>
      <ScrollView
        contentContainerClassName="pb-15"
        refreshControl={
          <RefreshControl
            refreshing={trending.isFetching && !trending.isLoading}
            onRefresh={() => trending.refetch()}
          />
        }
      >
        {/* Header */}
        <View className="px-5.5 pt-3 pb-3.5">
          <Text className="font-serif-italic text-h-large text-heard-ink tracking-tight-2 mb-3">
            What's buzzing
          </Text>
          <SegmentedControl value={tab} options={TABS} onChange={setTab} />
        </View>

        {tab === 'buzz' && (
          <BuzzList
            isLoading={trending.isLoading}
            error={trending.error}
            items={trending.data ?? []}
            onPressItem={(item) =>
              router.push({ pathname: '/title/[id]', params: { id: String(item.id), mt: item.mediaType } })
            }
          />
        )}

        {tab === 'services' && (
          <ByServiceList
            ownedIds={ownedIds}
            onPressService={(id) => router.push({ pathname: '/streamer/[id]', params: { id } })}
          />
        )}

        {tab === 'mine' && (
          <BuzzList
            isLoading={trending.isLoading}
            error={trending.error}
            items={
              ownedIds.length === 0
                ? []
                : filteredForOwned // Phase 6 will refine with watch-providers
            }
            emptyHint={
              ownedIds.length === 0
                ? "You haven't selected any owned services yet."
                : "Nothing trending on your services right now."
            }
            onPressItem={(item) =>
              router.push({ pathname: '/title/[id]', params: { id: String(item.id), mt: item.mediaType } })
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function BuzzList({
  isLoading, error, items, onPressItem, emptyHint,
}: {
  isLoading: boolean;
  error: unknown;
  items: ReturnType<typeof useTrending>['data'] extends infer T ? (T extends undefined ? never : NonNullable<T>) : never;
  onPressItem: (item: NonNullable<ReturnType<typeof useTrending>['data']>[number]) => void;
  emptyHint?: string;
}) {
  if (isLoading) {
    return (
      <View className="px-5.5 gap-3.5 pt-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} className="flex-row gap-3.5">
            <Skeleton width={80} height={120} radius={3} />
            <View className="flex-1 gap-1.5 py-1">
              <Skeleton height={14} />
              <Skeleton height={10} width={'60%' as `${number}%`} />
              <Skeleton height={10} width={'40%' as `${number}%`} />
            </View>
          </View>
        ))}
      </View>
    );
  }
  if (error) {
    return (
      <View className="px-5.5 pt-3.5">
        <Text className="font-serif text-h-body text-heard-rust">
          Couldn't reach TMDB — check your network or API key.
        </Text>
      </View>
    );
  }
  if (items.length === 0) {
    return (
      <View className="px-5.5 pt-3.5">
        <Text className="font-serif text-h-body text-heard-muted">
          {emptyHint ?? 'Nothing trending right now.'}
        </Text>
      </View>
    );
  }
  return (
    <View className="px-5.5 pt-1.5">
      {items.map((item, i) => (
        <Pressable
          key={item.id}
          onPress={() => onPressItem(item)}
          className="flex-row gap-3.5 py-3 border-b border-heard-hair"
          accessibilityRole="button"
          accessibilityLabel={item.title}
        >
          <Text className="font-mono-medium text-m-button-sm text-heard-faint w-5 pt-0.5">
            {String(i + 1).padStart(2, '0')}
          </Text>
          <View className="flex-1 flex-row gap-3.5">
            <View style={{ width: 80 }}>
              <TitleCard item={item} size="xs" />
            </View>
            <View className="flex-1 justify-center gap-1">
              <Text className="font-serif-italic text-h-small text-heard-ink tracking-tight-1" numberOfLines={2}>
                {item.title}
              </Text>
              <View className="flex-row items-center gap-1.5">
                <Text className="font-mono text-m-button-sm text-heard-faint uppercase tracking-wide-1">
                  {item.year ?? '—'} · {item.mediaType === 'tv' ? 'Series' : 'Film'}
                </Text>
                {item.voteAverage > 0 && (
                  <>
                    <Text className="font-mono text-m-button-sm text-heard-faint/40">·</Text>
                    <Text className="font-mono-medium text-m-button-sm text-heard-rust">
                      ★ {item.voteAverage.toFixed(1)}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function ByServiceList({
  ownedIds, onPressService,
}: {
  ownedIds: StreamerId[];
  onPressService: (id: StreamerId) => void;
}) {
  const ownedSet = new Set(ownedIds);
  const sorted = [
    ...STREAMERS.filter((s) => ownedSet.has(s.id)),
    ...STREAMERS.filter((s) => !ownedSet.has(s.id)),
  ];

  return (
    <View className="px-5.5 pt-1.5">
      <Eyebrow num="◦">Browse by service</Eyebrow>
      {sorted.map((s) => {
        const isOwned = ownedSet.has(s.id);
        return (
          <Pressable
            key={s.id}
            onPress={() => onPressService(s.id)}
            className="flex-row items-center gap-3.5 py-3 border-b border-heard-hair"
            accessibilityRole="button"
            accessibilityLabel={`Browse ${s.name}`}
          >
            <StreamerLogo streamer={s} size={44} />
            <View className="flex-1 gap-0.5">
              <View className="flex-row items-center gap-2">
                <Text className="font-serif-italic text-h-small text-heard-ink">
                  {s.name}
                </Text>
                {isOwned && <Pill tone="rust">Yours</Pill>}
              </View>
              <Text
                className="font-serif-italic text-m-display text-heard-muted"
                numberOfLines={2}
              >
                Tap to see what's trending on {s.name}.
              </Text>
            </View>
            <Text className="font-serif text-h-large text-heard-faint">→</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function useOwnedIds(): StreamerId[] {
  const repos = useRepos();
  const [owned, setOwned] = useReactState<OwnedService[]>([]);
  useEffect(() => {
    repos.owned.list().then(setOwned).catch(() => setOwned([]));
  }, [repos]);
  return owned.map((o) => o.serviceId);
}
