// Skeleton — simple pulsing rectangle for loading states. Used by
// every route's loading.tsx + inline placeholders inside lists.
//
// Animation runs on the JS thread (no Reanimated worklet) — simple
// enough that the perf cost is negligible at the volumes we render.

import { useEffect, useRef } from 'react';
import { Animated, View, ViewProps } from 'react-native';

export interface SkeletonProps extends Pick<ViewProps, 'style'> {
  width?: number | `${number}%`;
  height?: number;
  /** Override for radius; defaults to 4. */
  radius?: number;
}

export function Skeleton({ width = '100%', height = 12, radius = 4, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 750, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius: radius, backgroundColor: '#e0ddd9', opacity },
        style,
      ]}
    />
  );
}

/** Convenience: title-card-shaped skeleton for grid loading states. */
export function TitleCardSkeleton({ size = 124 }: { size?: number }) {
  return (
    <View style={{ width: size }} className="shrink-0">
      <Skeleton width={size} height={(size * 3) / 2} radius={3} />
      <View className="pt-2 gap-1">
        <Skeleton height={12} />
        <Skeleton height={8} width={'60%' as `${number}%`} />
      </View>
    </View>
  );
}
