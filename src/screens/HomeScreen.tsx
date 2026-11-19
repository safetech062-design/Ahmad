import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MicButton } from '../components/MicButton';
import { OrbVisualizer } from '../components/OrbVisualizer';
import { useI18n } from '../modules/language';
import { useVoice } from '../modules/voice/VoiceContext';
import { useChat } from '../state/chatStore';
import { colors, statusColor } from '../theme/colors';

const STATUS_KEY = {
  idle: 'statusIdle',
  listening: 'statusListening',
  processing: 'statusProcessing',
  speaking: 'statusSpeaking',
} as const;

export function HomeScreen() {
  const { t, rtl } = useI18n();
  const { status, partial, toggleMic } = useVoice();
  const last = useChat((s) => [...s.messages].reverse().find((m) => m.role === 'assistant' || m.role === 'error'));

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>{t('appName')}</Text>

      <View style={styles.center}>
        <OrbVisualizer status={status} />
        <Text style={[styles.status, { color: statusColor[status] }]}>{t(STATUS_KEY[status])}</Text>
        {!!partial && <Text style={styles.partial}>{partial}</Text>}
      </View>

      {last && (
        <Text
          numberOfLines={4}
          style={[styles.last, { writingDirection: rtl ? 'rtl' : 'ltr', textAlign: rtl ? 'right' : 'left' }]}
        >
          {last.text}
        </Text>
      )}

      <View style={styles.micWrap}>
        <MicButton status={status} onPress={toggleMic} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center' },
  title: { color: colors.accent, fontSize: 22, letterSpacing: 6, fontWeight: '700', marginTop: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  status: { fontSize: 16, marginTop: 4, letterSpacing: 1 },
  partial: { color: colors.textDim, marginTop: 10, paddingHorizontal: 24, textAlign: 'center', fontSize: 16 },
  last: { color: colors.textDim, fontSize: 15, lineHeight: 22, paddingHorizontal: 24, alignSelf: 'stretch' },
  micWrap: { paddingVertical: 24 },
});
