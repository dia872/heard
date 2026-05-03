// Sheet — bottom-aligned modal container with the prototype's
// rounded top corners + brand-bg surface. Used by SignupExplore,
// confirm-extraction sheets, and anywhere a partial overlay reads.
//
// Composes Modal so we get the iOS-native dismiss gestures + backdrop.

import { Modal, Pressable, Text, View } from 'react-native';

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Optional eyebrow-style header for the sheet (ALL CAPS mono). */
  title?: string;
}

export function Sheet({ visible, onClose, children, title }: SheetProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/40"
        onPress={onClose}
        accessibilityLabel="Close sheet"
      />
      <View className="absolute bottom-0 left-0 right-0 bg-heard-bg rounded-t-[18px] pt-3.5 pb-15 px-5.5">
        <View className="self-center w-9 h-1 rounded-full bg-heard-hair mb-3.5" />
        <View className="flex-row justify-between items-center mb-3.5">
          {title && (
            <Text className="font-mono-medium text-m-label text-heard-muted uppercase tracking-wide-18">
              {title}
            </Text>
          )}
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
            className="ml-auto p-2"
            hitSlop={12}
          >
            <Text className="font-serif-italic text-h-modal text-heard-ink">✕</Text>
          </Pressable>
        </View>
        {children}
      </View>
    </Modal>
  );
}
