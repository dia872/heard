// Front — editorial entry point. Phase 5 fleshes this out with the
// masthead image + 4 mood cards + featured highlights.

import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eyebrow } from '../../src/ui/Eyebrow';

export default function Front() {
  return (
    <SafeAreaView className="flex-1 bg-heard-bg">
      <ScrollView contentContainerClassName="px-5.5 py-15 gap-7.5">
        <Text className="font-serif-italic text-h-display text-heard-ink tracking-tight-3">
          Heard
        </Text>
        <Eyebrow num="◦">Coming in Phase 5</Eyebrow>
        <Text className="font-serif text-h-body text-heard-muted">
          Front page — masthead, 4 mood cards, featured highlights.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
