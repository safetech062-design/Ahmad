import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { detectScriptRtl, useI18n } from '../modules/language';
import { answerConfirm, useConfirm } from '../state/confirmStore';
import { colors } from '../theme/colors';

/** Yes/No gate for calls, messages, deletions and memory. Mounted once in App.tsx. */
export function ConfirmModal() {
  const pending = useConfirm((s) => s.pending);
  const { t } = useI18n();
  const rtl = pending ? detectScriptRtl(pending.message) : false;

  return (
    <Modal visible={!!pending} transparent animationType="fade" onRequestClose={() => answerConfirm(false)}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('confirmTitle')}</Text>
          <Text style={[styles.message, { writingDirection: rtl ? 'rtl' : 'ltr', textAlign: rtl ? 'right' : 'left' }]}>
            {pending?.message}
          </Text>
          <View style={styles.row}>
            <Pressable style={[styles.btn, styles.no]} onPress={() => answerConfirm(false)}>
              <Text style={styles.noText}>{t('confirmNo')}</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.yes]} onPress={() => answerConfirm(true)}>
              <Text style={styles.yesText}>{t('confirmYes')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', backgroundColor: colors.surface, borderColor: colors.accent, borderWidth: 1, borderRadius: 18, padding: 20 },
  title: { color: colors.accent, fontSize: 13, letterSpacing: 2, fontWeight: '700', marginBottom: 10 },
  message: { color: colors.text, fontSize: 17, lineHeight: 25, marginBottom: 20 },
  row: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  no: { borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  yes: { borderColor: colors.accent, backgroundColor: colors.accent },
  noText: { color: colors.text, fontSize: 16, fontWeight: '600' },
  yesText: { color: colors.bg, fontSize: 16, fontWeight: '700' },
});
