// StreamerLogo — colored square with a 1-3 char glyph. Sized via prop.
// The glyph is the brand's letterform per Streamer config (e.g.,
// Netflix 'N', Apple 'tv+', Prime '▶').

import { Text, View } from 'react-native';
import type { Streamer } from '../data/streamers';

export interface StreamerLogoProps {
  streamer: Streamer;
  size?: number;
}

export function StreamerLogo({ streamer, size = 44 }: StreamerLogoProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        backgroundColor: streamer.color,
      }}
      className="items-center justify-center"
      accessibilityLabel={`${streamer.name} logo`}
    >
      <Text
        style={{
          color: streamer.textOn,
          fontSize: size * 0.28,
          letterSpacing: -size * 0.02 * 0.01, // ~tracking-tight-2 scaled to size
        }}
        className="font-sans-medium"
      >
        {streamer.glyph}
      </Text>
    </View>
  );
}
