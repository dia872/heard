// SignupExplore modal — adaptive copy based on owned/non-owned streamer.
// Phase 9 wires the full content; this skeleton just presents.

import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eyebrow } from '../src/ui/Eyebrow';
import { IconButton, PrimaryButton, GhostButton } from '../src/ui/buttons';

export default function SignupExploreModal() {
  const { streamerId } = useLocalSearchParams<{ streamerId: string }>();
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-heard-bg">
      <View className="flex-row justify-between items-center px-5.5 pt-3">
        <Text className="font-mono-medium text-m-label text-heard-muted uppercase tracking-wide-18">
          Before you sign up
        </Text>
        <IconButton glyph="✕" label="Close" onPress={() => router.back()} />
      </View>
      <ScrollView contentContainerClassName="px-5.5 pt-3.5 pb-15 gap-3.5">
        <Eyebrow num="◦">Phase 9</Eyebrow>
        <Text className="font-serif-italic text-h-large text-heard-ink tracking-tight-2">
          {streamerId ?? '—'}
        </Text>
        <Text className="font-serif text-h-body text-heard-muted">
          Curated 6-title grid + adaptive copy (owned vs non-owned) + commission disclosure.
        </Text>
        <PrimaryButton label="Save these · then sign up →" />
        <GhostButton label="Just take me there" onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}
