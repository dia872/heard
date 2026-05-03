// TitleCard — the bread-and-butter card. Used everywhere lists of
// titles render: trends, saved, streamer screens, signup-explore modal.
//
// Sizes come from the prototype's widths object and govern poster
// width + title font-size. Optional rank renders a giant numeral over
// the corner ("№ 01"-style); badge renders a mono pill on the poster.

import { Image, Pressable, Text, View } from 'react-native';
import type { TmdbTitle } from '../types';
import { TMDB_IMAGE } from '../infra/tmdb/client';

export type TitleCardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface TitleCardProps {
  item: Pick<
    TmdbTitle,
    'id' | 'title' | 'year' | 'mediaType' | 'voteAverage' | 'posterPath'
  >;
  onPress?: (item: TitleCardProps['item']) => void;
  size?: TitleCardSize;
  /** Big italic numeral overlaid on the poster (used in trending lists). */
  rank?: number;
  /** Mono-caps pill at the bottom-left of the poster (e.g., "NEW"). */
  badge?: string;
}

const widthFor: Record<TitleCardSize, number> = {
  xs: 78,
  sm: 96,
  md: 124,
  lg: 156,
  xl: 200,
};

const titleFontSizeFor: Record<TitleCardSize, string> = {
  xs: 'text-[11px]',
  sm: 'text-h-body',
  md: 'text-h-body',
  lg: 'text-h-small',
  xl: 'text-base',
};

export function TitleCard({
  item, onPress, size = 'md', rank, badge,
}: TitleCardProps) {
  const w = widthFor[size];
  const isTV = item.mediaType === 'tv';
  const posterUrl = TMDB_IMAGE.poster(item.posterPath);

  const Wrapper = onPress ? Pressable : View;
  const wrapperProps = onPress
    ? { onPress: () => onPress(item), accessibilityRole: 'button' as const }
    : {};

  return (
    <Wrapper
      style={{ width: w }}
      className="shrink-0"
      accessibilityLabel={item.title}
      {...wrapperProps}
    >
      <View
        style={{ aspectRatio: 2 / 3 }}
        className="bg-heard-bg2 rounded-tight overflow-hidden shadow-card relative"
      >
        {posterUrl ? (
          <Image
            source={{ uri: posterUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Text className="text-2xl text-heard-faint">◎</Text>
          </View>
        )}

        {rank !== undefined && (
          <Text
            style={{
              position: 'absolute',
              top: -8,
              left: -4,
              fontSize: size === 'lg' ? 60 : 48,
              lineHeight: size === 'lg' ? 60 : 48,
              color: '#faf8f3',
              // RN doesn't have text-stroke; the prototype's outlined
              // numeral is approximated via a 1.2px text shadow ring.
              // Acceptable visual delta for v0.5.
              textShadowColor: '#1a1a1a',
              textShadowRadius: 1.2,
            }}
            className="font-serif-italic tracking-tight-3"
          >
            {rank}
          </Text>
        )}

        {badge && (
          <View className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-heard-ink/85 rounded-sm">
            <Text className="font-mono-medium text-m-label text-heard-bg uppercase tracking-wide-12">
              {badge}
            </Text>
          </View>
        )}
      </View>

      <View className="pt-2 px-px">
        <Text
          numberOfLines={2}
          className={`font-serif-italic ${titleFontSizeFor[size]} text-heard-ink mb-1 tracking-tight-1`}
        >
          {item.title}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <Text className="font-mono text-[8.5px] text-heard-faint">
            {item.year ?? '—'}
          </Text>
          <Text className="font-mono text-[8.5px] text-heard-faint/40">·</Text>
          <Text className="font-mono text-[8.5px] text-heard-faint uppercase tracking-wide-1">
            {isTV ? 'Series' : 'Film'}
          </Text>
          {item.voteAverage > 0 && (
            <>
              <Text className="font-mono text-[8.5px] text-heard-faint/40">·</Text>
              <Text className="font-mono-medium text-[8.5px] text-heard-rust">
                ★ {item.voteAverage.toFixed(1)}
              </Text>
            </>
          )}
        </View>
      </View>
    </Wrapper>
  );
}
