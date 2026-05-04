// Three-tab segmented control matching the prototype's Trends header.
// Generic over the value type so callers get type-safe selection.

import { Pressable, Text, View } from 'react-native';

export interface SegmentedControlProps<T extends string> {
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (v: T) => void;
}

export function SegmentedControl<T extends string>({
  value, options, onChange,
}: SegmentedControlProps<T>) {
  return (
    <View
      className="flex-row bg-heard-bg2 rounded-tight p-0.5"
      accessibilityRole="tablist"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={o.label}
            className={`flex-1 items-center justify-center py-2 rounded-tight ${active ? 'bg-heard-bg shadow-subtle' : ''}`}
          >
            <Text
              className={`font-mono-medium text-m-button-sm uppercase tracking-wide-15 ${active ? 'text-heard-ink' : 'text-heard-muted'}`}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
