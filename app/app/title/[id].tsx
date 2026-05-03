// Title detail — backdrop hero + poster + cast + where-to-watch grid.
// Real implementation lands in Phase 6.

import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../../src/ui/buttons';
import { useRouter } from 'expo-router';

export default function TitleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-heard-bg">
      <ScrollView contentContainerClassName="px-5.5 py-3 gap-3.5">
        <BackButton onPress={() => router.back()} />
        <Text className="font-serif-italic text-h-large text-heard-ink tracking-tight-2">
          Title #{id}
        </Text>
        <Text className="font-serif text-h-body text-heard-muted">
          Phase 6 wires backdrop, poster, save toggle, cast scroll, where-to-watch grid.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
