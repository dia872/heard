// Tab layout — bottom navigation per the prototype: Front | Inbox |
// Capture (the rust circle in the middle) | Trends | Saved.
//
// The Capture "tab" navigates to the /capture modal route (declared at
// the root stack with presentation: 'modal'). Side effect of opening
// the modal also flips the ui-store flag for any downstream listeners.

import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';

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
          tabBarIcon: () => <CaptureGlyph />,
          tabBarAccessibilityLabel: 'Capture',
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

function CaptureGlyph() {
  return (
    <View className="items-center justify-center pt-1">
      <View className="w-9 h-9 rounded-full bg-heard-rust items-center justify-center">
        <Text className="font-serif-italic text-base text-white">◉</Text>
      </View>
      <Text className="font-mono-medium text-m-label uppercase tracking-wide-1 mt-0.5 text-heard-rust">
        Capture
      </Text>
    </View>
  );
}
