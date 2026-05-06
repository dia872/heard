import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../../src/ui/buttons';
import { BackdropImage } from '../../src/ui/BackdropImage';
import { Eyebrow } from '../../src/ui/Eyebrow';
import { Pill } from '../../src/ui/Pill';
import { Skeleton } from '../../src/ui/Skeleton';
import { StreamerLogo } from '../../src/ui/StreamerLogo';
import { useTitleDetail, useWatchProviders } from '../../src/hooks/useTmdb';
import { TMDB_IMAGE } from '../../src/infra/tmdb';
import { STREAMER_BY_ID, splitStreamers } from '../../src/data/streamers';
import { useRepos } from '../../src/state/AuthContext';
import { formatFreshnessLabel } from '../../src/domain/detail';
import { toast } from '../../src/ui/toast';
import type { MediaType, StreamerId, TmdbCastMember, TmdbWatchProvider } from '../../src/types';

function parseId(id: string | undefined): number | undefined {
  const parsed = Number(id);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseMediaType(mt: string | undefined): MediaType {
  return mt === 'tv' ? 'tv' : 'movie';
}

export default function TitleDetail() {
  const { id, mt } = useLocalSearchParams<{ id: string; mt?: string }>();
  const tmdbId = parseId(id);
  const mediaType = parseMediaType(mt);
  const router = useRouter();
  const repos = useRepos();
  const detail = useTitleDetail(tmdbId, mediaType);
  const watchProviders = useWatchProviders(tmdbId, mediaType);
  const [isSaved, setIsSaved] = useState(false);
  const [ownedIds, setOwnedIds] = useState<StreamerId[]>([]);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    let alive = true;
    async function loadRepoState() {
      if (!tmdbId) return;
      try {
        const [saved, owned] = await Promise.all([
          repos.saved.has(tmdbId),
          repos.owned.list(),
        ]);
        if (!alive) return;
        setIsSaved(saved);
        setOwnedIds(owned.map((o) => o.serviceId));
      } catch (e) {
        console.error('[title.repoState]', e);
        toast.error('Could not load saved state');
      }
    }
    loadRepoState();
    return () => { alive = false; };
  }, [repos, tmdbId]);

  const providerIds = useMemo(
    () => watchProviders.data?.providers.map((p) => p.id) ?? [],
    [watchProviders.data]
  );
  const availability = useMemo(
    () => splitStreamers(providerIds, ownedIds),
    [providerIds, ownedIds]
  );

  const handleToggleSave = async () => {
    if (!detail.data || isToggling) return;
    try {
      setIsToggling(true);
      const next = await repos.saved.toggle({
        tmdbId: detail.data.id,
        title: detail.data.title,
        year: detail.data.year,
        mediaType: detail.data.mediaType,
        posterPath: detail.data.posterPath,
      });
      setIsSaved(next === 'saved');
      toast.success(next === 'saved' ? 'Saved to library' : 'Removed from library');
    } catch (e) {
      console.error('[title.toggleSave]', e);
      toast.error('Could not update saved');
    } finally {
      setIsToggling(false);
    }
  };

  if (detail.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-heard-bg">
        <ScrollView contentContainerClassName="pb-15">
          <Skeleton height={260} radius={0} />
          <View className="px-5.5 -mt-8 gap-3.5">
            <BackButton onPress={() => router.back()} />
            <Skeleton height={26} width={'72%' as `${number}%`} />
            <Skeleton height={14} />
            <Skeleton height={14} width={'84%' as `${number}%`} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (detail.error || !detail.data) {
    return (
      <SafeAreaView className="flex-1 bg-heard-bg">
        <View className="px-5.5 py-3 gap-3.5">
          <BackButton onPress={() => router.back()} />
          <Text className="font-serif-italic text-h-large text-heard-ink">
            Could not load this title.
          </Text>
          <Text className="font-serif text-h-body text-heard-muted">
            Check the TMDB key and try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const item = detail.data;
  const posterUrl = TMDB_IMAGE.poster(item.posterPath);

  return (
    <SafeAreaView className="flex-1 bg-heard-bg" edges={['top']}>
      <ScrollView contentContainerClassName="pb-15">
        <BackdropImage backdropPath={item.backdropPath} height={260}>
          <View className="px-5.5 pt-3">
            <BackButton onPress={() => router.back()} />
          </View>
        </BackdropImage>

        <View className="px-5.5" style={{ marginTop: -52 }}>
          <View className="flex-row gap-3.5 mb-4">
            <View className="w-24 bg-heard-bg2 rounded-tight overflow-hidden shadow-card" style={{ aspectRatio: 2 / 3 }}>
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
            <View className="flex-1 pt-9">
              <Text className="font-mono text-m-button-sm text-heard-faint uppercase tracking-wide-15 mb-1.5">
                {item.year ?? '—'} · {item.mediaType === 'tv' ? 'Series' : 'Film'}
                {item.runtime ? ` · ${item.runtime} min` : ''}
              </Text>
              <Text className="font-serif-italic text-h-large text-heard-ink tracking-tight-2" numberOfLines={3}>
                {item.title}
              </Text>
              <View className="flex-row flex-wrap gap-1.5 mt-2">
                {item.genres.slice(0, 3).map((genre) => (
                  <Pill key={genre}>{genre}</Pill>
                ))}
              </View>
            </View>
          </View>

          <Pressable
            onPress={handleToggleSave}
            disabled={isToggling}
            accessibilityRole="button"
            accessibilityLabel={isSaved ? 'Remove from saved' : 'Save title'}
            className={`items-center justify-center rounded-tight py-3 px-3.5 min-h-[44px] mb-5 ${isSaved ? 'bg-white border border-heard-ink' : 'bg-heard-ink'}`}
          >
            <Text className={`font-mono-medium text-m-button uppercase tracking-wide-15 ${isSaved ? 'text-heard-ink' : 'text-heard-bg'}`}>
              {isToggling ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
            </Text>
          </Pressable>

          <Text className="font-serif text-h-body text-heard-ink leading-6 mb-7">
            {item.overview || 'No overview is available yet.'}
          </Text>

          <WhereToWatch
            providers={watchProviders.data?.providers ?? []}
            isLoading={watchProviders.isLoading}
            updatedAt={watchProviders.data?.updatedAt}
            owned={availability.owned}
            missing={availability.missing}
            onOpenStreamer={(streamerId) =>
              router.push({ pathname: '/streamer/[id]', params: { id: streamerId } })
            }
          />

          {item.cast.length > 0 && (
            <View className="mb-7">
              <Eyebrow num="◦">The cast</Eyebrow>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 pr-5.5">
                {item.cast.map((actor) => (
                  <ActorChip
                    key={actor.id}
                    actor={actor}
                    onPress={() => router.push({ pathname: '/actor/[id]', params: { id: String(actor.id) } })}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {item.similarIds.length > 0 && (
            <View>
              <Eyebrow num="◦">If you liked this</Eyebrow>
              <Text className="font-serif text-h-body text-heard-muted">
                Similar-title cards land after TMDB list hydration in polish.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function WhereToWatch({
  providers,
  isLoading,
  updatedAt,
  owned,
  missing,
  onOpenStreamer,
}: {
  providers: TmdbWatchProvider[];
  isLoading: boolean;
  updatedAt?: string;
  owned: StreamerId[];
  missing: StreamerId[];
  onOpenStreamer: (id: StreamerId) => void;
}) {
  return (
    <View className="mb-7">
      <View className="flex-row items-baseline justify-between mb-2">
        <Eyebrow num="◦">Where to watch</Eyebrow>
        {updatedAt && (
          <Text className="font-mono text-m-label text-heard-faint uppercase tracking-wide-12">
            {formatFreshnessLabel(updatedAt)}
          </Text>
        )}
      </View>

      {isLoading && (
        <View className="gap-2">
          <Skeleton height={58} />
          <Skeleton height={58} />
        </View>
      )}

      {!isLoading && providers.length === 0 && (
        <View className="bg-heard-bg2 rounded-tight p-4">
          <Text className="font-serif-italic text-h-body text-heard-muted text-center">
            Not currently streaming. We'll let you know when it lands.
          </Text>
        </View>
      )}

      {owned.length > 0 && (
        <ProviderGroup
          label="On platforms you have"
          ids={owned}
          action="Watch"
          tone="owned"
          onOpenStreamer={onOpenStreamer}
        />
      )}

      {missing.length > 0 && (
        <ProviderGroup
          label="Available elsewhere"
          ids={missing}
          action="Browse"
          tone="missing"
          onOpenStreamer={onOpenStreamer}
        />
      )}
    </View>
  );
}

function ProviderGroup({
  label,
  ids,
  action,
  tone,
  onOpenStreamer,
}: {
  label: string;
  ids: StreamerId[];
  action: string;
  tone: 'owned' | 'missing';
  onOpenStreamer: (id: StreamerId) => void;
}) {
  return (
    <View className="mb-3">
      <Text
        className="font-mono-medium text-m-label uppercase tracking-wide-18 mb-2"
        style={{ color: tone === 'owned' ? '#1a8f4f' : '#666666' }}
      >
        {label}
      </Text>
      <View className="gap-1.5">
        {ids.map((id) => {
          const streamer = STREAMER_BY_ID[id];
          return (
            <Pressable
              key={id}
              onPress={() => onOpenStreamer(id)}
              accessibilityRole="button"
              accessibilityLabel={`${action} on ${streamer.name}`}
              className={`flex-row items-center gap-3 p-3 rounded-tight ${tone === 'owned' ? 'bg-white border border-heard-hair' : 'bg-heard-bg2'}`}
            >
              <StreamerLogo streamer={streamer} size={36} />
              <View className="flex-1">
                <Text className="font-serif text-h-body text-heard-ink">{streamer.name}</Text>
                <Text
                  className="font-mono text-m-label uppercase tracking-wide-12"
                  style={{ color: tone === 'owned' ? '#1a8f4f' : '#666666' }}
                >
                  {tone === 'owned' ? 'Ready to play' : `${streamer.monthly}/mo`}
                </Text>
              </View>
              <Text className="font-mono-medium text-m-button-sm text-heard-ink uppercase tracking-wide-15">
                {action} →
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ActorChip({
  actor,
  onPress,
}: {
  actor: TmdbCastMember;
  onPress: () => void;
}) {
  const profileUrl = TMDB_IMAGE.poster(actor.profilePath);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${actor.name}`}
      className="items-center"
      style={{ width: 84 }}
    >
      <View className="rounded-full bg-heard-bg2 overflow-hidden mb-2" style={{ width: 84, height: 84 }}>
        {profileUrl ? (
          <Image
            source={{ uri: profileUrl }}
            className="w-full h-full"
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Text className="text-heard-faint text-xl">◎</Text>
          </View>
        )}
      </View>
      <Text className="font-serif text-m-display text-heard-ink text-center" numberOfLines={2}>
        {actor.name}
      </Text>
    </Pressable>
  );
}
