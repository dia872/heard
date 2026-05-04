// Front — editorial entry point.
// Layout per the prototype masthead:
//   - Big "Heard" wordmark + tagline
//   - 2×2 mood card grid
//   - Footer eyebrow inviting exploration
//
// No TMDB calls here — content is hand-curated. Drilling into a mood
// (Phase 5 follow-up) will call TMDB to fetch titles for that genre.

import { useRouter } from 'expo-router';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eyebrow } from '../../src/ui/Eyebrow';
import { MoodCard } from '../../src/ui/MoodCard';
import { FRONT_MOOD_IDS, MOODS_BY_ID } from '../../src/data/moods';
import { useUiStore } from '../../src/state/uiStore';

const SCREEN_PADDING = 22;
const CARD_GAP = 10;

export default function Front() {
  const router = useRouter();
  const setActiveMood = useUiStore((s) => s.setActiveMood);
  const { width: winWidth } = useWindowDimensions();
  const cardWidth = (winWidth - SCREEN_PADDING * 2 - CARD_GAP) / 2;

  return (
    <SafeAreaView className="flex-1 bg-heard-bg" edges={['top']}>
      <ScrollView contentContainerClassName="pb-15" showsVerticalScrollIndicator={false}>
        {/* ─── Masthead ─────────────────────────────────────────────────── */}
        <View className="px-5.5 pt-7.5 pb-7.5">
          <Text className="font-mono-medium text-m-label text-heard-faint uppercase tracking-wide-2 mb-2">
            Issue 01 · This week
          </Text>
          <Text className="font-serif-italic text-[64px] text-heard-ink tracking-tight-35 leading-[64px]">
            Heard.
          </Text>
          <Text className="font-serif text-h-sub text-heard-muted mt-2 max-w-[280px]">
            Your friend's favorite show, not lost in the algorithm.
          </Text>
        </View>

        {/* ─── 2×2 Mood grid ────────────────────────────────────────────── */}
        <View className="px-5.5 mb-7.5">
          <Eyebrow num="◦">In the mood for</Eyebrow>
          <View className="flex-row flex-wrap" style={{ gap: CARD_GAP }}>
            {FRONT_MOOD_IDS.map((id) => {
              const mood = MOODS_BY_ID[id];
              return (
                <MoodCard
                  key={id}
                  mood={mood}
                  width={cardWidth}
                  onPress={(m) => {
                    setActiveMood(m.id);
                    // Mood detail screen is Phase 5+. For now no-op — the
                    // selection is kept in store so we can wire later.
                  }}
                />
              );
            })}
          </View>
        </View>

        {/* ─── Footer eyebrow ───────────────────────────────────────────── */}
        <View className="px-5.5 mt-3">
          <Eyebrow num="◦">More moods on the way</Eyebrow>
          <Text className="font-serif text-h-body text-heard-muted">
            Tap the rust circle to capture anything you've heard about.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
