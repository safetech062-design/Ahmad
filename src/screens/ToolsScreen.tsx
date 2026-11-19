import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { detectScriptRtl, useI18n } from '../modules/language';
import { parseReminder } from '../modules/commands/reminderParse';
import { cancelReminder, scheduleReminder } from '../modules/productivity';
import { useProductivity } from '../state/productivityStore';
import { colors } from '../theme/colors';

type Tab = 'tasks' | 'notes' | 'reminders';

export function ToolsScreen() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>('tasks');
  const [input, setInput] = useState('');
  const p = useProductivity();

  const add = async () => {
    const text = input.trim();
    if (!text) return;
    if (tab === 'tasks') p.addTask(text);
    else if (tab === 'notes') p.addNote(text);
    else {
      const parsed = parseReminder(text);
      if (!parsed) return Alert.alert(t('reminders'), t('reminderParseFail'));
      const r = await scheduleReminder(parsed.title, parsed.when);
      if (r !== 'ok') return Alert.alert(t('reminders'), t(r === 'denied' ? 'res_denied' : 'res_error'));
    }
    setInput('');
  };

  const rows =
    tab === 'tasks'
      ? p.tasks.map((x) => ({ id: x.id, text: x.title, done: x.done, onPress: () => p.toggleTask(x.id), onDelete: () => p.removeTask(x.id) }))
      : tab === 'notes'
        ? p.notes.map((x) => ({ id: x.id, text: x.text, done: false, onPress: undefined, onDelete: () => p.removeNote(x.id) }))
        : p.reminders.map((x) => ({
            id: x.id,
            text: `${new Date(x.when).toLocaleString()}  ${x.title}`,
            done: false,
            onPress: undefined,
            onDelete: () => void cancelReminder(x.id),
          }));

  const placeholder = tab === 'tasks' ? t('taskPlaceholder') : tab === 'notes' ? t('notePlaceholder') : t('reminderPlaceholder');

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.tabs}>
        {(['tasks', 'notes', 'reminders'] as Tab[]).map((k) => (
          <Pressable key={k} onPress={() => setTab(k)} style={[styles.tab, tab === k && styles.tabActive]}>
            <Text style={[styles.tabText, tab === k && { color: colors.bg }]}>{t(k)}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={placeholder}
          placeholderTextColor={colors.textDim}
          style={styles.input}
          onSubmitEditing={add}
          returnKeyType="done"
        />
        <Pressable onPress={add} style={styles.addBtn}>
          <Ionicons name="add" size={24} color={colors.bg} />
        </Pressable>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        ListEmptyComponent={<Text style={styles.empty}>{t('nothingYet')}</Text>}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const rtl = detectScriptRtl(item.text);
          return (
            <View style={styles.item}>
              <Pressable style={{ flex: 1 }} onPress={item.onPress}>
                <Text
                  style={[
                    styles.itemText,
                    { writingDirection: rtl ? 'rtl' : 'ltr', textAlign: rtl ? 'right' : 'left' },
                    item.done && { textDecorationLine: 'line-through', color: colors.textDim },
                  ]}
                >
                  {item.text}
                </Text>
              </Pressable>
              <Pressable onPress={item.onDelete} hitSlop={10}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </Pressable>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  tabs: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 8 },
  tab: { borderWidth: 1, borderColor: colors.accent, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 },
  tabActive: { backgroundColor: colors.accent },
  tabText: { color: colors.accent, fontWeight: '600' },
  inputRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  input: { flex: 1, backgroundColor: colors.surface, color: colors.text, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, borderWidth: 1, borderColor: colors.border },
  addBtn: { width: 46, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8 },
  itemText: { color: colors.text, fontSize: 16, lineHeight: 22 },
  empty: { color: colors.textDim, textAlign: 'center', marginTop: 40 },
});
