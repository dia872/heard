// Saved — your watchlist. 3-column grid with three filter tabs:
//   All / On your services / Elsewhere
//
// Filter logic depends on per-title streamerIds, which are hydrated in
// Phase 10. Saved rows now preserve mediaType so reopening details hits
// the right TMDB endpoint.

import { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Eyebrow } from '../../src/ui/Eyebrow';
import { SegmentedControl } from '../../src/ui/SegmentedControl';
import { TitleCard } from '../../src/ui/TitleCard';
import { TitleCardSkeleton as Skel } from '../../src/ui/Skeleton';
import { useRepos } from '../../src/state/AuthContext';
import { toast } from '../../src/ui/toast';
import type { SavedTitle } from '../../src/types';

type Filter = 'all' | 'available' | 'elsewhere';

const FILTERS = [
  { value: 'all' as const,        label: 'All' },
  { value: 'available' as const,  label: 'On your services' },
  { value: 'elsewhere' as const,  label: 'Elsewhere' },
];

const SCREEN_PADDING = 22;
const COL_GAP = 10;

export default function Saved() {
  const repos = useRepos();
  const [items, setItems] = useState<SavedTitle[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const { width: winWidth } = useWindowDimensions();
  const colWidth = (winWidth - SCREEN_PADDING * 2 - COL_GAP * 2) / 3;

  const reload = async () => {
    try {
      setItems(await repos.saved.list());
    } catch (e) {
      console.error('[saved.list]', e);
      toast.error('Could not load saved');
      setItems([]);
    }
  };

  useEffect(() => { reload(); }, [repos]);

  const isLoading = items === null;
  const isEmpty = items !== null && items.length === 0;

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
        <View className="px-5.5 pt-3 pb-3.5 gap-3">
          <Text className="font-serif-italic text-h-large text-heard-ink tracking-tight-2">
            Your library
          </Text>
          <SegmentedControl value={filter} options={FILTERS} onChange={setFilter} />
        </View>

        {isLoading && (
          <View className="px-5.5 flex-row flex-wrap" style={{ gap: COL_GAP }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skel key={i} size={colWidth} />
            ))}
          </View>
        )}

        {isEmpty && (
          <View className="px-5.5 gap-3.5 mt-3">
            <Eyebrow num="◦">Empty library</Eyebrow>
            <Text className="font-serif text-h-body text-heard-muted">
              Saved titles land here. Tap a card from Trends or your inbox to add it.
            </Text>
          </View>
        )}

        {!isLoading && !isEmpty && filter !== 'all' && (
          <View className="px-5.5 gap-3 mt-3">
            <Eyebrow num="◦">Coming in Phase 6</Eyebrow>
            <Text className="font-serif text-h-body text-heard-muted">
              Filter by where-to-watch needs the streaming-providers hydration on save, which we wire in Phase 6 (title detail).
            </Text>
          </View>
        )}

        {!isLoading && !isEmpty && filter === 'all' && (
          <View className="px-5.5 flex-row flex-wrap" style={{ gap: COL_GAP }}>
            {items!.map((s) => (
              <SavedCard
                key={s.id}
                item={s}
                width={colWidth}
                onPress={() =>
                  router.push({ pathname: '/title/[id]', params: { id: String(s.tmdbId), mt: s.mediaType } })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SavedCard({
  item, width, onPress,
}: {
  item: SavedTitle;
  width: number;
  onPress: () => void;
}) {
  return (
    <TitleCard
      item={{
        id: item.tmdbId,
        title: item.title,
        year: item.year,
        mediaType: item.mediaType,
        voteAverage: 0,
        posterPath: item.posterPath,
      }}
      onPress={onPress}
      size="sm"
    />
  );
}
