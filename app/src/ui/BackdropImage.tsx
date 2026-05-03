// BackdropImage — the wide hero image with brand-bg gradient at the
// bottom. Used by title detail and streamer screens to anchor a hero.
//
// Gradient brings the hero into the page background gracefully so the
// content below doesn't fight a hard image edge.

import { ImageBackground, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TMDB_IMAGE } from '../infra/tmdb/client';

export interface BackdropImageProps {
  /** TMDB backdrop_path or null. */
  backdropPath: string | null;
  /** Container height in px. */
  height?: number;
  /** Optional tint laid under the gradient (e.g., a streamer color). */
  tintColor?: string;
  children?: React.ReactNode;
}

export function BackdropImage({
  backdropPath, height = 280, tintColor, children,
}: BackdropImageProps) {
  const uri = TMDB_IMAGE.backdrop(backdropPath);
  return (
    <View style={{ height, backgroundColor: tintColor ?? '#1a1a1a' }} className="relative">
      {uri && (
        <ImageBackground
          source={{ uri }}
          style={{ width: '100%', height: '100%', opacity: tintColor ? 0.55 : 1 }}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      )}
      <LinearGradient
        colors={['transparent', '#faf8f3']}
        locations={[0.3, 1]}
        style={{ position: 'absolute', inset: 0 } as any}
      />
      {children && (
        <View className="absolute inset-0">{children}</View>
      )}
    </View>
  );
}
