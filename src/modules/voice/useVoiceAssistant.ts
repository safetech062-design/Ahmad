import { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import type { AssistantStatus } from '../../theme/colors';
import { useChat } from '../../state/chatStore';
import { useSettings } from '../../state/settingsStore';
import { handleUserText } from '../assistant';
import { translate } from '../language';
import { cancelListening, isSttAvailable, startListening, stopListening } from './stt';
import { stopSpeaking } from './tts';

async function ensureMicPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
  return res === PermissionsAndroid.RESULTS.GRANTED;
}

/** Single source of truth for the Listening / Processing / Speaking state. */
export function useVoiceAssistant() {
  const [status, setStatus] = useState<AssistantStatus>('idle');
  const [partial, setPartial] = useState('');
  const busy = useRef(false);

  useEffect(() => () => void cancelListening(), []);

  const sendText = useCallback(async (text: string) => {
    if (busy.current) return;
    busy.current = true;
    setStatus('processing');
    await handleUserText(text, {
      onSpeakStart: () => setStatus('speaking'),
      onSpeakEnd: () => setStatus('idle'),
    });
    // If nothing is being spoken (speech off or error), return to idle.
    setStatus((s) => (s === 'processing' ? 'idle' : s));
    busy.current = false;
  }, []);

  const pushError = (key: string) => {
    const lang = useSettings.getState().language;
    useChat.getState().add('error', translate(lang, key));
  };

  const toggleMic = useCallback(async () => {
    const { micEnabled, language } = useSettings.getState();

    if (status === 'speaking') {
      stopSpeaking();
      setStatus('idle');
      return;
    }
    if (status === 'listening') {
      await stopListening();
      return;
    }
    if (status === 'processing') return;

    if (!micEnabled) return pushError('micDisabledNote');
    if (!isSttAvailable()) return pushError('voiceUnavailable');
    if (!(await ensureMicPermission())) return;

    setPartial('');
    setStatus('listening');
    try {
      await startListening(language, {
        onPartial: setPartial,
        onFinal: (text) => {
          setPartial('');
          void sendText(text);
        },
        onError: () => {
          setPartial('');
          setStatus('idle');
          pushError('voiceLangUnsupported');
        },
        onEnd: () => setStatus((s) => (s === 'listening' ? 'idle' : s)),
      });
    } catch {
      setStatus('idle');
      pushError('voiceUnavailable');
    }
  }, [status, sendText]);

  return { status, partial, toggleMic, sendText };
}
