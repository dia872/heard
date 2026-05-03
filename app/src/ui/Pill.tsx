// Pill — small mono-caps badge. Used for source labels (Voice/Paste/
// Screenshot/TikTok), genres, "yours" tag on streamer cards, etc.
//
// Three tones cover all v0.2 prototype uses; add more as needed but
// resist the urge — pills should look like one design family, not nine.

import { Text, View } from 'react-native';

export type PillTone = 'neutral' | 'rust' | 'inkOnBg';

export interface PillProps {
  children: string;
  tone?: PillTone;
  /** Optional leading glyph (e.g., a mic icon for the Voice source). */
  leading?: string;
}

const styleFor: Record<PillTone, { container: string; text: string }> = {
  neutral: { container: 'bg-heard-bg2', text: 'text-heard-muted' },
  rust:    { container: 'bg-heard-rust-soft', text: 'text-heard-rust' },
  inkOnBg: { container: 'bg-heard-ink', text: 'text-heard-bg' },
};

export function Pill({ children, tone = 'neutral', leading }: PillProps) {
  const s = styleFor[tone];
  return (
    <View className={`flex-row items-center gap-1 px-1.5 py-px rounded-full ${s.container}`}>
      {leading && (
        <Text className={`font-mono-medium text-m-label uppercase tracking-wide-1 ${s.text}`}>
          {leading}
        </Text>
      )}
      <Text className={`font-mono-medium text-m-label uppercase tracking-wide-1 ${s.text}`}>
        {children}
      </Text>
    </View>
  );
}
