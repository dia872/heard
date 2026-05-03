// Tab layout — bottom navigation per the prototype: Front | Inbox |
// Capture (the rust circle in the middle) | Trends | Saved.
//
// The Capture tab is special: tapping it doesn't switch tabs, it
// opens the capture modal. Implemented as a separate Pressable that
// preempts router navigation.

import { Tabs, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useUiStore } from '../../src/state/uiStore';

const SERIF_GLYPHS = {
  front:   { glyph: 'R', label: 'Read' },
  inbox:   { glyph: 'i', label: 'Inbox' },
  trends:  { glyph: 'T', label: 'Trends' },
  saved:   { glyph: 's', label: 'Saved' },
} as const;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(250,248,243,0.95)',
          borderTopColor: '#e0ddd9',
          height: 78,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="front"
        options={{
          tabBarIcon: ({ focused }) => <TabGlyph kind="front" focused={focused} />,
          tabBarAccessibilityLabel: 'Read',
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          tabBarIcon: ({ focused }) => <TabGlyph kind="inbox" focused={focused} />,
          tabBarAccessibilityLabel: 'Inbox',
        }}
      />
      <Tabs.Screen
        name="capture"
        options={{
          tabBarButton: () => <CaptureTabButton />,
        }}
      />
      <Tabs.Screen
        name="trends"
        options={{
          tabBarIcon: ({ focused }) => <TabGlyph kind="trends" focused={focused} />,
          tabBarAccessibilityLabel: 'Trends',
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          tabBarIcon: ({ focused }) => <TabGlyph kind="saved" focused={focused} />,
          tabBarAccessibilityLabel: 'Saved',
        }}
      />
    </Tabs>
  );
}

function TabGlyph({ kind, focused }: { kind: keyof typeof SERIF_GLYPHS; focused: boolean }) {
  const { glyph, label } = SERIF_GLYPHS[kind];
  return (
    <View className="items-center justify-center pt-1">
      <Text
        className={`font-serif-italic text-base ${focused ? 'text-heard-ink' : 'text-heard-faint'}`}
      >
        {glyph}
      </Text>
      <Text
        className={`font-mono-medium text-m-label uppercase tracking-wide-1 mt-0.5 ${
          focused ? 'text-heard-ink' : 'text-heard-faint'
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

function CaptureTabButton() {
  const router = useRouter();
  const setShowCapture = useUiStore((s) => s.setShowCapture);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Capture"
      onPress={() => {
        setShowCapture(true);
        router.push('/capture');
      }}
      className="flex-1 items-center justify-center pt-1"
    >
      <View className="w-9 h-9 rounded-full bg-heard-rust items-center justify-center">
        <Text className="font-serif-italic text-base text-white">◉</Text>
      </View>
      <Text className="font-mono-medium text-m-label uppercase tracking-wide-1 mt-0.5 text-heard-rust">
        Capture
      </Text>
    </Pressable>
  );
}
