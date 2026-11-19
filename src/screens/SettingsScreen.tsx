import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PROVIDER_LIST } from '../modules/ai';
import type { ProviderId } from '../modules/ai/types';
import { LANGUAGE_LIST, useI18n } from '../modules/language';
import { pickFolder } from '../modules/files';
import { FEATURES } from '../modules/status';
import { deleteApiKey, getApiKey, setApiKey } from '../modules/settings/secureKeys';
import { useChat } from '../state/chatStore';
import { useMemory } from '../state/memoryStore';
import { useSettings } from '../state/settingsStore';
import { colors } from '../theme/colors';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && { color: colors.bg }]}>{label}</Text>
    </Pressable>
  );
}

const STATUS_COLOR = { built: '#3DDC97', experimental: '#FFB84D', planned: '#8AA0B8', blocked: '#FF5D6C' } as const;

export function SettingsScreen() {
  const { t, lang } = useI18n();
  const s = useSettings();
  const clearChat = useChat((c) => c.clear);
  const memory = useMemory();

  const [keyInput, setKeyInput] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const refreshKey = useCallback(async (p: ProviderId) => {
    setHasKey(!!(await getApiKey(p)));
    setKeyInput('');
  }, []);

  useEffect(() => {
    void refreshKey(s.provider);
  }, [s.provider, refreshKey]);

  const saveKey = async () => {
    if (!keyInput.trim()) return;
    await setApiKey(s.provider, keyInput);
    await refreshKey(s.provider);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  const removeKey = async () => {
    await deleteApiKey(s.provider);
    await refreshKey(s.provider);
  };

  const align = { textAlign: lang.rtl ? ('right' as const) : ('left' as const), writingDirection: lang.rtl ? ('rtl' as const) : ('ltr' as const) };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        <Section title={t('settingsLanguage')}>
          <View style={styles.wrapRow}>
            {LANGUAGE_LIST.map((l) => (
              <Chip key={l.code} label={l.name} active={s.language === l.code} onPress={() => s.setLanguage(l.code)} />
            ))}
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{t('autoDetect')}</Text>
            <Switch value={s.autoDetectLanguage} onValueChange={(v) => s.update({ autoDetectLanguage: v })} />
          </View>
        </Section>

        <Section title={t('settingsAI')}>
          <Text style={[styles.label, align]}>{t('provider')}</Text>
          <View style={styles.wrapRow}>
            {PROVIDER_LIST.map((p) => (
              <Chip key={p.id} label={p.label} active={s.provider === p.id} onPress={() => s.setProvider(p.id)} />
            ))}
          </View>

          <Text style={[styles.label, align]}>{t('model')}</Text>
          <TextInput
            value={s.models[s.provider]}
            onChangeText={(m) => s.setModel(s.provider, m)}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            placeholderTextColor={colors.textDim}
          />

          <Text style={[styles.label, align]}>{t('apiKey')}</Text>
          <TextInput
            value={keyInput}
            onChangeText={setKeyInput}
            placeholder={t('apiKeyPlaceholder')}
            placeholderTextColor={colors.textDim}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          <View style={styles.wrapRow}>
            <Chip label={savedFlash ? t('saved') : t('save')} active onPress={saveKey} />
            {hasKey && <Chip label={t('clear')} active={false} onPress={removeKey} />}
          </View>
          <Text style={[styles.note, align]}>{hasKey ? t('keySet') : t('keyNotSet')}</Text>
        </Section>

        <Section title={t('settingsVoice')}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{t('speakReplies')}</Text>
            <Switch value={s.speakReplies} onValueChange={s.setSpeakReplies} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{t('micEnabled')}</Text>
            <Switch value={s.micEnabled} onValueChange={s.setMicEnabled} />
          </View>
          <Text style={[styles.note, align]}>{t('wakeWordNote')}</Text>
        </Section>

        <Section title={t('settingsPhone')}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{t('allowCalls')}</Text>
            <Switch value={s.allowCalls} onValueChange={(v) => s.update({ allowCalls: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{t('allowMessages')}</Text>
            <Switch value={s.allowMessages} onValueChange={(v) => s.update({ allowMessages: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{t('allowFileDelete')}</Text>
            <Switch value={s.allowFileDelete} onValueChange={(v) => s.update({ allowFileDelete: v })} />
          </View>
          <Text style={[styles.label, align]}>{t('countryCode')}</Text>
          <TextInput
            value={s.defaultCountryCode}
            onChangeText={(v) => s.update({ defaultCountryCode: v.replace(/\D/g, '') })}
            keyboardType="number-pad"
            style={styles.input}
            placeholderTextColor={colors.textDim}
          />
          <Text style={[styles.label, align]}>{t('filesFolder')}</Text>
          <View style={styles.wrapRow}>
            <Chip
              label={t('chooseFolder')}
              active
              onPress={async () => {
                try {
                  const uri = await pickFolder();
                  if (uri) s.update({ filesFolderUri: uri });
                } catch (e: any) {
                  Alert.alert(t('errorPrefix'), e?.message ?? String(e));
                }
              }}
            />
            {s.filesFolderUri && <Chip label={t('clear')} active={false} onPress={() => s.update({ filesFolderUri: null })} />}
          </View>
          <Text style={[styles.note, align]}>{s.filesFolderUri ? t('folderSet') : t('folderNone')}</Text>
          <Text style={[styles.note, align]}>{t('filesNote')}</Text>
        </Section>

        <Section title={t('settingsMemory')}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{t('memoryEnabled')}</Text>
            <Switch value={s.memoryEnabled} onValueChange={(v) => s.update({ memoryEnabled: v })} />
          </View>
          {memory.items.length === 0 && <Text style={[styles.note, align]}>{t('memoryEmpty')}</Text>}
          {memory.items.map((m) => (
            <View key={m.id} style={styles.switchRow}>
              <Text style={[styles.switchLabel, align]}>{m.text}</Text>
              <Pressable onPress={() => memory.remove(m.id)}>
                <Text style={{ color: colors.danger }}>{t('delete')}</Text>
              </Pressable>
            </View>
          ))}
        </Section>

        <Section title={t('settingsAbout')}>
          <Text style={styles.note}>
            Built = code written and logic unit-tested, not yet verified on a physical phone. Test each feature after installing.
          </Text>
          {FEATURES.map((f) => (
            <View key={f.name} style={{ marginTop: 10 }}>
              <Text style={{ color: colors.text, fontSize: 14 }}>
                {f.name} <Text style={{ color: STATUS_COLOR[f.status], fontWeight: '700' }}>[{f.status}]</Text>
              </Text>
              <Text style={styles.note}>{f.note}</Text>
            </View>
          ))}
        </Section>

        <Section title={t('settingsSecurity')}>
          <Text style={[styles.note, align]}>{t('keyWarning')}</Text>
          <View style={[styles.wrapRow, { marginTop: 12 }]}>
            <Chip
              label={t('clearChat')}
              active={false}
              onPress={() =>
                Alert.alert(t('clearChat'), undefined, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'OK', style: 'destructive', onPress: clearChat },
                ])
              }
            />
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  section: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  sectionTitle: { color: colors.accent, fontSize: 14, letterSpacing: 1.5, marginBottom: 10, fontWeight: '700' },
  label: { color: colors.textDim, fontSize: 13, marginTop: 10, marginBottom: 6 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.accent, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 },
  chipActive: { backgroundColor: colors.accent },
  chipText: { color: colors.accent, fontSize: 14, fontWeight: '600' },
  input: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 15,
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  switchLabel: { color: colors.text, fontSize: 15, flex: 1, marginRight: 12 },
  note: { color: colors.textDim, fontSize: 13, lineHeight: 19, marginTop: 6 },
});
