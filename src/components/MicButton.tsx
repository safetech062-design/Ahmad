import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { AssistantStatus, colors, statusColor } from '../theme/colors';

const ICON: Record<AssistantStatus, keyof typeof Ionicons.glyphMap> = {
  idle: 'mic',
  listening: 'stop',
  processing: 'hourglass',
  speaking: 'volume-high',
};

export function MicButton({ status, onPress, disabled }: { status: AssistantStatus; onPress: () => void; disabled?: boolean }) {
  const color = statusColor[status];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.btn,
        { borderColor: color, backgroundColor: pressed ? colors.accentSoft : colors.surface, opacity: disabled ? 0.4 : 1 },
      ]}
    >
      <Ionicons name={ICON[status]} size={34} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
