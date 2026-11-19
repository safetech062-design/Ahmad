import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { detectScriptRtl } from '../modules/language';
import type { Message } from '../state/chatStore';
import { colors } from '../theme/colors';

/** Direction is chosen per message so switching language mid-conversation reads correctly. */
export function ChatBubble({ message }: { message: Message }) {
  const rtl = detectScriptRtl(message.text);
  const isUser = message.role === 'user';
  const isError = message.role === 'error';
  const isAction = message.role === 'action';
  return (
    <View style={[styles.row, { justifyContent: isUser ? 'flex-end' : 'flex-start' }]}>
      <View
        style={[
          styles.bubble,
          isUser && styles.user,
          message.role === 'assistant' && styles.assistant,
          isError && styles.error,
          isAction && styles.action,
        ]}
      >
        <Text
          selectable
          style={[styles.text, { writingDirection: rtl ? 'rtl' : 'ltr', textAlign: rtl ? 'right' : 'left' }]}
        >
          {message.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: 4, paddingHorizontal: 12 },
  bubble: { maxWidth: '85%', borderRadius: 16, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1 },
  user: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  assistant: { backgroundColor: colors.surface, borderColor: colors.border },
  action: { backgroundColor: 'transparent', borderColor: colors.border, borderStyle: 'dashed', paddingVertical: 6 },
  error: { backgroundColor: 'rgba(255,93,108,0.12)', borderColor: colors.danger },
  text: { color: colors.text, fontSize: 16, lineHeight: 23 },
});
