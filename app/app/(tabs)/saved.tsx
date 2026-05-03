import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eyebrow } from '../../src/ui/Eyebrow';

export default function Saved() {
  return (
    <SafeAreaView className="flex-1 bg-heard-bg">
      <ScrollView contentContainerClassName="px-5.5 py-15 gap-3.5">
        <Text className="font-serif-italic text-h-large text-heard-ink tracking-tight-2">
          Your library
        </Text>
        <Eyebrow num="◦">Coming in Phase 5</Eyebrow>
        <Text className="font-serif text-h-body text-heard-muted">
          3-column grid of saved titles. All / On your services / Elsewhere filters.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
