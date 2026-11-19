import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { AssistantStatus, colors, statusColor } from '../theme/colors';

const SIZE = 220;

/** Concentric animated rings. Speed/amplitude change with the assistant status. */
export function OrbVisualizer({ status }: { status: AssistantStatus }) {
  const pulse = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const duration = status === 'idle' ? 2600 : status === 'listening' ? 900 : status === 'speaking' ? 600 : 1400;
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: status === 'processing' ? 1800 : 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    pulseLoop.start();
    spinLoop.start();
    return () => {
      pulseLoop.stop();
      spinLoop.stop();
      spin.setValue(0);
    };
  }, [status, pulse, spin]);

  const color = statusColor[status];
  const amp = status === 'idle' ? 0.06 : 0.18;
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1 - amp, 1 + amp] });
  const haloScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25 + amp] });
  const haloOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotateBack = spin.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[styles.ring, { borderColor: color, opacity: haloOpacity, transform: [{ scale: haloScale }] }]}
      />
      <Animated.View
        style={[styles.ring, styles.dashed, { borderColor: color, width: SIZE, height: SIZE, transform: [{ rotate }] }]}
      />
      <Animated.View
        style={[
          styles.ring,
          styles.dotted,
          { borderColor: color, width: SIZE * 0.78, height: SIZE * 0.78, transform: [{ rotate: rotateBack }] },
        ]}
      />
      <Animated.View
        style={[
          styles.core,
          { backgroundColor: color, shadowColor: color, transform: [{ scale }] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: SIZE * 1.4, height: SIZE * 1.4, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE,
    borderWidth: 2,
  },
  dashed: { borderStyle: 'dashed', borderWidth: 2, opacity: 0.8 },
  dotted: { borderStyle: 'dotted', borderWidth: 3, opacity: 0.6 },
  core: {
    width: SIZE * 0.42,
    height: SIZE * 0.42,
    borderRadius: SIZE,
    opacity: 0.9,
    shadowOpacity: 0.9,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: 6,
    borderColor: colors.bg,
  },
});
