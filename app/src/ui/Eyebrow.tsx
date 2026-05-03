// Eyebrow — section divider + label. Used above lists ("Where to watch",
// "Also trending"). Optional num prefix (e.g., "№ 01").
//
// Keeps the prototype's three-part layout: optional small num, hairline
// rule that fills the gap, and the right-side mono caps label.

import { Text, View } from 'react-native';

export interface EyebrowProps {
  children: string;
  num?: string;
  /** Tailwind text color class for the label. Defaults to text-heard-ink. */
  colorClass?: string;
}

export function Eyebrow({ children, num, colorClass = 'text-heard-ink' }: EyebrowProps) {
  return (
    <View className="flex-row items-baseline mb-3.5" accessibilityRole="header">
      {num !== undefined && (
        <Text className="font-mono text-m-button-sm text-heard-faint tracking-wide-1 mr-2.5">
          {num}
        </Text>
      )}
      <View className="flex-1 h-px bg-heard-ink/[0.15] mx-2.5" />
      <Text
        className={`font-mono-medium text-m-button-sm ${colorClass} tracking-wide-18 uppercase`}
      >
        {children}
      </Text>
    </View>
  );
}
