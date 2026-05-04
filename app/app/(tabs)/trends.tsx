// Trends — three sub-tabs:
//   1. Most talked about → global trending list
//   2. By service       → list of streamer cards (drill-in to streamer screen)
//   3. On my services   → owned-services filtered (wired in Phase 8 with auth)

import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eyebrow } from '../../src/ui/Eyebrow';
import { SegmentedControl } from '../../src/ui/SegmentedControl';
import { TitleCard } from '../../src/ui/TitleCard';
import { Skeleton } from '../../src/ui/Skeleton';
import { StreamerLogo } from '../../src/ui/StreamerLogo';
import { useTrending } from '../../src/hooks/useTmdb';
import type { TmdbTitle, StreamerId } from '../../src/types';
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

  const handlePressItem = (item: TmdbTitle) => {
    router.push({
      pathname: '/title/[id]',
      params: { id: String(item.id), mt: item.mediaType },
    });
  };

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
            onPressItem={handlePressItem}
          />
        )}

        {tab === 'services' && (
          <ByServiceList
            onPressService={(id) =>
              router.push({ pathname: '/streamer/[id]', params: { id } })
            }
          />
        )}

        {tab === 'mine' && (
          <View className="px-5.5 pt-3.5 gap-2">
            <Eyebrow num="◦">Coming in Phase 8</Eyebrow>
            <Text className="font-serif text-h-body text-heard-muted">
              Once you sign in and pick your streaming services, this tab will filter the trending list to just what's on the platforms you have.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface BuzzListProps {
  isLoading: boolean;
  error: unknown;
  items: TmdbTitle[];
  onPressItem: (item: TmdbTitle) => void;
}

function BuzzList({ isLoading, error, items, onPressItem }: BuzzListProps) {
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
      <View className="px-5.5 pt-3.5 gap-2">
        <Text className="font-serif text-h-body text-heard-rust">
          Couldn't reach TMDB.
        </Text>
        <Text className="font-serif text-h-body text-heard-muted">
          Make sure EXPO_PUBLIC_TMDB_KEY is set in app/.env.local and that you
          restarted Expo with `npx expo start --tunnel --clear` after adding it.
        </Text>
      </View>
    );
  }
  if (items.length === 0) {
    return (
      <View className="px-5.5 pt-3.5">
        <Text className="font-serif text-h-body text-heard-muted">
          Nothing trending right now.
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
  onPressService,
}: {
  onPressService: (id: StreamerId) => void;
}) {
  return (
    <View className="px-5.5 pt-1.5">
      <Eyebrow num="◦">Browse by service</Eyebrow>
      {STREAMERS.map((s) => (
        <Pressable
          key={s.id}
          onPress={() => onPressService(s.id)}
          className="flex-row items-center gap-3.5 py-3 border-b border-heard-hair"
          accessibilityRole="button"
          accessibilityLabel={`Browse ${s.name}`}
        >
          <StreamerLogo streamer={s} size={44} />
          <View className="flex-1 gap-0.5">
            <Text className="font-serif-italic text-h-small text-heard-ink">
              {s.name}
            </Text>
            <Text className="font-serif-italic text-m-display text-heard-muted" numberOfLines={1}>
              Tap to see what's trending on {s.name}.
            </Text>
          </View>
          <Text className="font-serif text-h-large text-heard-faint">→</Text>
        </Pressable>
      ))}
    </View>
  );
}
