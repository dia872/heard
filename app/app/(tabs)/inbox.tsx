import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eyebrow } from '../../src/ui/Eyebrow';

export default function Inbox() {
  return (
    <SafeAreaView className="flex-1 bg-heard-bg">
      <ScrollView contentContainerClassName="px-5.5 py-15 gap-3.5">
        <Text className="font-serif-italic text-h-large text-heard-ink tracking-tight-2">
          Your captures
        </Text>
        <Eyebrow num="◦">Coming in Phase 5</Eyebrow>
        <Text className="font-serif text-h-body text-heard-muted">
          Captured entries, newest first, with confidence + Save/Dismiss/Archive actions.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
