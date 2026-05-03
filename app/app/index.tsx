// Placeholder home — gets replaced by the front-page tab in Phase 4.
// For now it visually exercises a few primitives so we can confirm
// fonts + tokens + nativewind are all wired correctly when running.

import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eyebrow } from '../src/ui/Eyebrow';
import { Pill } from '../src/ui/Pill';
import { PrimaryButton, GhostButton } from '../src/ui/buttons';
import { ConfidenceMeter } from '../src/ui/ConfidenceMeter';
import { StreamerLogo } from '../src/ui/StreamerLogo';
import { STREAMERS } from '../src/data/streamers';

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-heard-bg">
      <ScrollView className="px-5.5" contentContainerClassName="py-15 gap-7.5">
        <Text className="font-serif-italic text-h-display text-heard-ink tracking-tight-3">
          Heard
        </Text>

        <View className="gap-3.5">
          <Eyebrow num="◦">Capture sources</Eyebrow>
          <View className="flex-row gap-2 flex-wrap">
            <Pill leading="◉" tone="rust">Voice</Pill>
            <Pill>Paste</Pill>
            <Pill>Screenshot</Pill>
            <Pill>TikTok</Pill>
          </View>
        </View>

        <View className="gap-3.5">
          <Eyebrow num="◦">Confidence</Eyebrow>
          <ConfidenceMeter level="high" />
          <ConfidenceMeter level="med" />
          <ConfidenceMeter level="low" />
        </View>

        <View className="gap-3.5">
          <Eyebrow num="◦">Streamers</Eyebrow>
          <View className="flex-row gap-2 flex-wrap">
            {STREAMERS.map((s) => (
              <StreamerLogo key={s.id} streamer={s} />
            ))}
          </View>
        </View>

        <View className="gap-2">
          <PrimaryButton label="Save to library" />
          <GhostButton label="Read aloud" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
