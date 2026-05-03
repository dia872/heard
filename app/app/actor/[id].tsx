import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../../src/ui/buttons';

export default function ActorDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-heard-bg">
      <ScrollView contentContainerClassName="px-5.5 py-3 gap-3.5">
        <BackButton onPress={() => router.back()} />
        <Text className="font-serif-italic text-h-large text-heard-ink tracking-tight-2">
          Actor #{id}
        </Text>
        <Text className="font-serif text-h-body text-heard-muted">
          Phase 6 wires headshot, name, filmography grid sorted by popularity.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
