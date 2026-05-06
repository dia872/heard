import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../../src/ui/buttons';
import { Eyebrow } from '../../src/ui/Eyebrow';
import { Skeleton } from '../../src/ui/Skeleton';
import { TMDB_IMAGE } from '../../src/infra/tmdb';
import { usePersonCredits } from '../../src/hooks/useTmdb';
import type { TmdbPersonCredit } from '../../src/types';

function parseId(id: string | undefined): number | undefined {
  const parsed = Number(id);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default function ActorDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const person = usePersonCredits(parseId(id));

  if (person.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-heard-bg">
        <ScrollView contentContainerClassName="px-5.5 py-3 gap-4">
          <BackButton onPress={() => router.back()} />
          <View className="flex-row gap-4 items-end">
            <Skeleton width={96} height={96} radius={48} />
            <View className="flex-1 gap-2">
              <Skeleton height={10} width={'42%' as `${number}%`} />
              <Skeleton height={26} />
            </View>
          </View>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={92} />
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (person.error || !person.data) {
    return (
      <SafeAreaView className="flex-1 bg-heard-bg">
        <View className="px-5.5 py-3 gap-3.5">
          <BackButton onPress={() => router.back()} />
          <Text className="font-serif-italic text-h-large text-heard-ink">
            Could not load this actor.
          </Text>
          <Text className="font-serif text-h-body text-heard-muted">
            Check the TMDB key and try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const profileUrl = TMDB_IMAGE.poster(person.data.profilePath);

  return (
    <SafeAreaView className="flex-1 bg-heard-bg" edges={['top']}>
      <ScrollView contentContainerClassName="pb-15">
        <View className="px-5.5 pt-3 pb-4 border-b border-heard-hair gap-4">
          <BackButton onPress={() => router.back()} />
          <View className="flex-row gap-4 items-end">
            <View className="w-24 h-24 rounded-full overflow-hidden bg-heard-bg2 shadow-card">
              {profileUrl ? (
                <Image
                  source={{ uri: profileUrl }}
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
              <Text className="font-mono text-m-button-sm text-heard-faint uppercase tracking-wide-2 mb-1.5">
                The actor
              </Text>
              <Text className="font-serif-italic text-h-large text-heard-ink tracking-tight-2" numberOfLines={3}>
                {person.data.name}
              </Text>
              {person.data.placeOfBirth && (
                <Text className="font-serif text-h-footer text-heard-muted mt-1.5" numberOfLines={2}>
                  b. {person.data.placeOfBirth}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View className="px-5.5 pt-4">
          <Eyebrow num="◦">Their best, ranked</Eyebrow>
          <View className="bg-heard-bg2 rounded-tight p-3 mb-4">
            <Text className="font-serif-italic text-h-footer text-heard-muted">
              Sorted by what people actually watched. Not by date, not by alphabetical chaos.
            </Text>
          </View>

          {person.data.credits.length === 0 ? (
            <Text className="font-serif text-h-body text-heard-muted">
              No filmography available yet.
            </Text>
          ) : (
            <View>
              {person.data.credits.map((credit, index) => (
                <CreditRow
                  key={credit.id}
                  credit={credit}
                  rank={index + 1}
                  isLast={index === person.data!.credits.length - 1}
                  onPress={() =>
                    router.push({
                      pathname: '/title/[id]',
                      params: { id: String(credit.id), mt: credit.mediaType },
                    })
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CreditRow({
  credit,
  rank,
  isLast,
  onPress,
}: {
  credit: TmdbPersonCredit;
  rank: number;
  isLast: boolean;
  onPress: () => void;
}) {
  const posterUrl = TMDB_IMAGE.poster(credit.posterPath);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${credit.title}`}
      className={`flex-row gap-3 py-3 ${isLast ? '' : 'border-b border-heard-hair'}`}
    >
      <Text className="font-serif-italic text-[30px] leading-[30px] text-heard-rust w-9">
        {rank}
      </Text>
      <View className="w-15 bg-heard-bg2 rounded-tight overflow-hidden" style={{ aspectRatio: 2 / 3 }}>
        {posterUrl ? (
          <Image
            source={{ uri: posterUrl }}
            className="w-full h-full"
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Text className="text-heard-faint">◎</Text>
          </View>
        )}
      </View>
      <View className="flex-1">
        <Text className="font-serif text-h-sub text-heard-ink mb-1" numberOfLines={2}>
          {credit.title}
        </Text>
        <Text className="font-mono text-m-button-sm text-heard-muted uppercase tracking-wide-12 mb-1.5">
          {credit.year ?? '—'} · {credit.mediaType === 'tv' ? 'Series' : 'Film'}
          {credit.voteAverage > 0 ? ` · ★ ${credit.voteAverage.toFixed(1)}` : ''}
        </Text>
        {credit.character && (
          <Text className="font-serif text-h-footer text-heard-muted" numberOfLines={2}>
            as {credit.character}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
