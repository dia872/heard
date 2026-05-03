// Three button styles, all with the same prototype rhythm:
// mono-medium 10px caps, 0.15em tracking, 3px rounded corners.
//
// PrimaryButton  — solid ink on bg, the affirmative action
// GhostButton    — outlined, the secondary/cancel action
// IconButton     — circular, mostly used for bottom-nav and X-close
//
// All ≥44pt hit targets per REFERENCE.md a11y standard.

import { Pressable, PressableProps, Text, View } from 'react-native';

interface CommonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  /** Optional override for testing (passed through to Pressable). */
  testID?: string;
}

export function PrimaryButton({ label, ...rest }: CommonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      className="bg-heard-ink rounded-tight items-center justify-center py-3 px-3.5 min-h-[44px]"
      {...rest}
    >
      <Text className="font-mono-medium text-m-button text-heard-bg uppercase tracking-wide-15">
        {label}
      </Text>
    </Pressable>
  );
}

export function GhostButton({ label, ...rest }: CommonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      className="bg-transparent border border-heard-hair rounded-tight items-center justify-center py-3 px-3.5 min-h-[44px]"
      {...rest}
    >
      <Text className="font-mono-medium text-m-button text-heard-ink uppercase tracking-wide-15">
        {label}
      </Text>
    </Pressable>
  );
}

interface IconButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;             // accessibility label
  glyph: string;             // visible content (e.g., "←", "✕")
  size?: number;             // square hit target; defaults to 44
  variant?: 'plain' | 'overlay';
}

export function IconButton({
  label, glyph, size = 44, variant = 'plain', ...rest
}: IconButtonProps) {
  const overlay = variant === 'overlay';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={`items-center justify-center ${overlay ? 'bg-heard-bg/85' : 'bg-transparent'}`}
      {...rest}
    >
      <Text className="font-serif-italic text-2xl text-heard-ink">{glyph}</Text>
    </Pressable>
  );
}

/**
 * BackButton — the white-on-blur pill used over hero images.
 * Composed on top of IconButton because it has a label, not a glyph.
 */
export function BackButton(rest: Omit<PressableProps, 'children' | 'style'>) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      className="self-start flex-row items-center bg-heard-bg/85 rounded-full pl-2 pr-3 py-1.5 min-h-[44px]"
      {...rest}
    >
      <Text className="font-mono-medium text-m-button-sm text-heard-ink uppercase tracking-wide-15">
        ← Back
      </Text>
    </Pressable>
  );
}
