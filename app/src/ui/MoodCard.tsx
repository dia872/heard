// MoodCard — large square card with emoji, title (serif italic),
// tag (mono caps). Used on the Front 2×2 grid + MoodScreen list.
//
// 170×170 in the prototype. Rendered as 2-up so width adapts to the
// container — caller passes width.

import { Pressable, Text, View } from 'react-native';
import type { Mood } from '../data/moods';

export interface MoodCardProps {
  mood: Mood;
  width: number;
  onPress?: (mood: Mood) => void;
}

export function MoodCard({ mood, width, onPress }: MoodCardProps) {
  return (
    <Pressable
      onPress={() => onPress?.(mood)}
      accessibilityRole="button"
      accessibilityLabel={`${mood.label} — ${mood.description}`}
      style={{
        width,
        height: width,
        backgroundColor: mood.tint,
        borderRadius: 8,
      }}
      className="overflow-hidden justify-end p-3.5"
    >
      <Text style={{ position: 'absolute', top: 14, right: 14, fontSize: 32 }}>
        {mood.emoji}
      </Text>
      <Text className="font-serif-italic text-h-large text-heard-ink tracking-tight-3">
        {mood.label}
      </Text>
      <Text className="font-mono-medium text-m-button-sm text-heard-ink/65 uppercase tracking-wide-15 mt-1">
        {mood.tag}
      </Text>
    </Pressable>
  );
}
