// Capture modal — the multi-step flow. Phase 7 wires voice, paste,
// URL paste, screenshot OCR. This stub renders the menu so the
// modal presentation is verifiable from the bottom-tab Capture button.

import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eyebrow } from '../src/ui/Eyebrow';
import { GhostButton, IconButton } from '../src/ui/buttons';
import { useUiStore } from '../src/state/uiStore';

export default function CaptureModal() {
  const router = useRouter();
  const closeCapture = useUiStore((s) => s.closeCapture);
  const dismiss = () => {
    closeCapture();
    router.back();
  };
  return (
    <SafeAreaView className="flex-1 bg-heard-bg">
      <View className="flex-row justify-between items-center px-5.5 pt-3">
        <Text className="font-mono-medium text-m-label text-heard-muted uppercase tracking-wide-18">
          Capture
        </Text>
        <IconButton glyph="✕" label="Close capture" onPress={dismiss} />
      </View>

      <ScrollView contentContainerClassName="px-5.5 pt-3.5 pb-15 gap-7.5">
        <Eyebrow num="◦">Phase 7</Eyebrow>
        <Text className="font-serif-italic text-h-large text-heard-ink tracking-tight-2">
          How did you hear about it?
        </Text>
        <Text className="font-serif text-h-body text-heard-muted">
          Voice / Paste / URL / Screenshot — wired in Phase 7. The modal
          presentation, close button, and ui-store wiring all work.
        </Text>
        <GhostButton label="Cancel" onPress={dismiss} />
      </ScrollView>
    </SafeAreaView>
  );
}
