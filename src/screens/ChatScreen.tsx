import React, { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatBubble } from '../components/ChatBubble';
import { detectScriptRtl, useI18n } from '../modules/language';
import { useVoice } from '../modules/voice/VoiceContext';
import { useChat } from '../state/chatStore';
import { colors, statusColor } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

export function ChatScreen() {
  const { t } = useI18n();
  const { status, sendText, toggleMic } = useVoice();
  const messages = useChat((s) => s.messages);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages.length, status]);

  const submit = () => {
    const text = input;
    setInput('');
    void sendText(text);
  };

  const inputRtl = detectScriptRtl(input);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={{ paddingVertical: 12 }}
          ListEmptyComponent={<Text style={styles.empty}>{t('greeting')}</Text>}
        />
        <View style={styles.inputRow}>
          <Pressable onPress={toggleMic} style={styles.iconBtn} accessibilityLabel="Microphone">
            <Ionicons name={status === 'listening' ? 'stop' : 'mic'} size={24} color={statusColor[status]} />
          </Pressable>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={t('typeMessage')}
            placeholderTextColor={colors.textDim}
            style={[styles.input, { writingDirection: inputRtl ? 'rtl' : 'ltr', textAlign: inputRtl ? 'right' : 'left' }]}
            multiline
            onSubmitEditing={submit}
          />
          <Pressable onPress={submit} style={styles.iconBtn} accessibilityLabel={t('send')} disabled={!input.trim()}>
            <Ionicons name="send" size={22} color={input.trim() ? colors.accent : colors.textDim} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  empty: { color: colors.textDim, textAlign: 'center', marginTop: 40, paddingHorizontal: 24, fontSize: 16 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1,
    maxHeight: 120,
    color: colors.text,
    fontSize: 16,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 4,
  },
});
