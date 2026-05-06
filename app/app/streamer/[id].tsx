import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BackButton } from '../../src/ui/buttons';
import { Eyebrow } from '../../src/ui/Eyebrow';
import { Skeleton } from '../../src/ui/Skeleton';
import { TitleCard } from '../../src/ui/TitleCard';
import { useStreamerTitles } from '../../src/hooks/useTmdb';
import { TMDB_IMAGE } from '../../src/infra/tmdb';
import { STREAMER_BY_ID } from '../../src/data/streamers';
import { streamerCtaCopy } from '../../src/domain/detail';
import { useRepos } from '../../src/state/AuthContext';
import { toast } from '../../src/ui/toast';
import type { Streamer } from '../../src/data/streamers';
import type { StreamerId, TmdbTitle } from '../../src/types';

function toStreamerId(id: string | undefined): StreamerId | undefined {
  return id && id in STREAMER_BY_ID ? (id as StreamerId) : undefined;
}

export default function StreamerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const streamerId = toStreamerId(id);
  const streamer = streamerId ? STREAMER_BY_ID[streamerId] : null;
  const router = useRouter();
  const repos = useRepos();
  const titles = useStreamerTitles(streamerId);
  const [owned, setOwned] = useState(false);

  useEffect(() => {
    let alive = true;
    async function loadOwned() {
      if (!streamerId) return;
      try {
        const hasService = await repos.owned.has(streamerId);
        if (alive) setOwned(hasService);
      } catch (e) {
        console.error('[streamer.owned]', e);
        toast.error('Could not load your services');
      }
    }
    loadOwned();
    return () => { alive = false; };
  }, [repos, streamerId]);

  const featured = titles.data?.[0];
  const rest = useMemo(() => titles.data?.slice(1, 10) ?? [], [titles.data]);

  if (!streamer) {
    return (
      <SafeAreaView className="flex-1 bg-heard-bg">
        <View className="px-5.5 py-3 gap-3.5">
          <BackButton onPress={() => router.back()} />
          <Text className="font-serif-italic text-h-large text-heard-ink">
            Unknown streaming service.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-heard-bg" edges={['top']}>
      <ScrollView contentContainerClassName="pb-15">
        <StreamerHero
          streamer={streamer}
          featured={featured}
          owned={owned}
          onBack={() => router.back()}
        />

        {titles.isLoading && (
          <View className="px-5.5 pt-5 gap-3.5">
            <Skeleton height={160} />
            <View className="flex-row flex-wrap gap-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} width={96} height={174} />
              ))}
            </View>
          </View>
        )}

        {titles.error && (
          <View className="px-5.5 pt-5 gap-2">
            <Text className="font-serif text-h-body text-heard-rust">
              Could not reach TMDB.
            </Text>
            <Text className="font-serif text-h-body text-heard-muted">
              Make sure EXPO_PUBLIC_TMDB_KEY is set and restart Expo with --clear.
            </Text>
          </View>
        )}

        {!titles.isLoading && !titles.error && featured && (
          <>
            <FeaturedTitle
              item={featured}
              onPress={() =>
                router.push({ pathname: '/title/[id]', params: { id: String(featured.id), mt: featured.mediaType } })
              }
            />
            <AlsoTrending
              items={rest}
              onPress={(item) =>
                router.push({ pathname: '/title/[id]', params: { id: String(item.id), mt: item.mediaType } })
              }
            />
            <StreamerCta
              streamer={streamer}
              owned={owned}
              onPress={() =>
                router.push({
                  pathname: '/signup-explore',
                  params: { streamerId: streamer.id, titleId: String(featured.id), mt: featured.mediaType },
                })
              }
            />
          </>
        )}

        {!titles.isLoading && !titles.error && !featured && (
          <View className="px-5.5 pt-5">
            <Text className="font-serif text-h-body text-heard-muted">
              No trending titles found for {streamer.name} right now.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StreamerHero({
  streamer,
  featured,
  owned,
  onBack,
}: {
  streamer: Streamer;
  featured?: TmdbTitle;
  owned: boolean;
  onBack: () => void;
}) {
  const backdropUrl = TMDB_IMAGE.backdrop(featured?.backdropPath ?? null);
  return (
    <View style={{ height: 280, backgroundColor: streamer.color }} className="relative overflow-hidden">
      {backdropUrl && (
        <Image
          source={{ uri: backdropUrl }}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, width: '100%', height: '100%', opacity: 0.55 }}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      )}
      <LinearGradient
        colors={[`${streamer.color}88`, streamer.color, '#faf8f3']}
        locations={[0, 0.62, 1]}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <View className="relative px-5.5 pt-3">
        <BackButton onPress={onBack} />
      </View>
      <View className="relative px-5.5 pt-11">
        <Text className="font-mono-bold text-m-label text-white/70 uppercase tracking-wide-2 mb-2">
          Trending on
        </Text>
        <Text className="font-serif-italic text-h-display text-white tracking-tight-35" numberOfLines={2}>
          {streamer.name}
        </Text>
        {owned ? (
          <View className="self-start mt-3 px-2.5 py-1 rounded-full bg-white/20">
            <Text className="font-mono-medium text-m-button-sm text-white uppercase tracking-wide-15">
              You have this
            </Text>
          </View>
        ) : (
          <Text className="font-serif-italic text-h-small text-white/85 mt-3">
            Browse before you sign up.
          </Text>
        )}
      </View>
    </View>
  );
}

function FeaturedTitle({
  item,
  onPress,
}: {
  item: TmdbTitle;
  onPress: () => void;
}) {
  const posterUrl = TMDB_IMAGE.poster(item.posterPath);
  return (
    <View className="px-5.5 pt-5 pb-3.5">
      <Eyebrow num="01">The flagship</Eyebrow>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.title}`}
        className="flex-row gap-3.5"
      >
        <View className="w-[110px] bg-heard-bg2 rounded-tight overflow-hidden shadow-card" style={{ aspectRatio: 2 / 3 }}>
          {posterUrl ? (
            <Image
              source={{ uri: posterUrl }}
              className="w-full h-full"
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Text className="text-2xl text-heard-faint">◎</Text>
            </View>
          )}
        </View>
        <View className="flex-1">
          <Text className="font-serif-italic text-h-modal text-heard-ink tracking-tight-2 mb-1.5" numberOfLines={3}>
            {item.title}
          </Text>
          <Text className="font-mono text-m-button-sm text-heard-muted uppercase tracking-wide-1 mb-2">
            {item.year ?? '—'} · {item.mediaType === 'tv' ? 'Series' : 'Film'}
            {item.voteAverage > 0 ? ` · ★ ${item.voteAverage.toFixed(1)}` : ''}
          </Text>
          <Text className="font-serif text-h-body text-heard-ink" numberOfLines={5}>
            {item.overview}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

function AlsoTrending({
  items,
  onPress,
}: {
  items: TmdbTitle[];
  onPress: (item: TmdbTitle) => void;
}) {
  if (items.length === 0) return null;
  return (
    <View className="px-5.5 pt-2 pb-7">
      <Text className="font-mono-medium text-m-label text-heard-muted uppercase tracking-wide-2 mb-3">
        Also trending
      </Text>
      <View className="flex-row flex-wrap gap-3">
        {items.map((item) => (
          <TitleCard
            key={`${item.mediaType}:${item.id}`}
            item={item}
            onPress={() => onPress(item)}
            size="sm"
          />
        ))}
      </View>
    </View>
  );
}

function StreamerCta({
  streamer,
  owned,
  onPress,
}: {
  streamer: Streamer;
  owned: boolean;
  onPress: () => void;
}) {
  const copy = streamerCtaCopy(streamer.name, streamer.monthly, owned);
  return (
    <View className="px-5.5 pb-7">
      <View className="bg-heard-ink rounded-card p-4.5">
        <Text className="font-mono-bold text-m-label text-heard-rust uppercase tracking-wide-2 mb-1.5">
          {copy.eyebrow}
        </Text>
        <Text className="font-serif-italic text-h-large text-heard-bg tracking-tight-2 mb-1">
          {copy.title}
        </Text>
        <Text className="font-serif text-h-body text-heard-bg/70 mb-3.5">
          {copy.body}
        </Text>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={copy.button}
          className="bg-heard-bg rounded-tight items-center justify-center py-3 px-3.5 min-h-[44px]"
        >
          <Text className="font-mono-bold text-m-button text-heard-ink uppercase tracking-wide-15">
            {copy.button} →
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
