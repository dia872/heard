// ConfidenceMeter — three-bar visual + text label. Used on inbox
// entries to show how sure the extraction is.
//
// Maps the domain Confidence type to colors:
//   high → green (you can trust this)
//   med  → rust (probably right; tap to confirm)
//   low  → faint gray (best guess; check it)

import { Text, View } from 'react-native';
import type { Confidence } from '../types';

export interface ConfidenceMeterProps {
  level: Confidence;
}

const map: Record<Confidence, { label: string; n: number; colorClass: string; bgColor: string }> = {
  high: { label: 'high confidence',  n: 3, colorClass: 'text-[#1a8f4f]', bgColor: '#1a8f4f' },
  med:  { label: 'medium',           n: 2, colorClass: 'text-heard-rust', bgColor: '#c2410c' },
  low:  { label: 'low — best guess', n: 1, colorClass: 'text-heard-faint', bgColor: '#999999' },
};

export function ConfidenceMeter({ level }: ConfidenceMeterProps) {
  const c = map[level];
  return (
    <View className="flex-row items-center gap-2" accessibilityLabel={`extraction confidence ${level}`}>
      <View className="flex-row gap-[3px]">
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              width: 14,
              height: 5,
              borderRadius: 1,
              backgroundColor: i <= c.n ? c.bgColor : 'rgba(0,0,0,0.1)',
            }}
          />
        ))}
      </View>
      <Text
        className={`font-mono-medium text-m-button-sm uppercase tracking-wide-15 ${c.colorClass}`}
      >
        {c.label}
      </Text>
    </View>
  );
}
