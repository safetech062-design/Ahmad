import { LANGUAGES, LanguageCode } from '../language/translations';

/**
 * Speech-to-text via Android's SpeechRecognizer (@react-native-voice/voice).
 * Needs a development build / APK. It does NOT work in Expo Go.
 *
 * Language support depends on the phone's Google speech engine. Urdu and Arabic
 * are normally available; Pashto often is not. If recognition fails for a
 * language we surface the error instead of pretending it worked.
 */
let Voice: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Voice = require('@react-native-voice/voice').default;
} catch {
  Voice = null;
}

export function isSttAvailable(): boolean {
  return !!Voice && typeof Voice.start === 'function';
}

export interface ListenHandlers {
  onPartial?: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (message: string) => void;
  onEnd?: () => void;
}

export async function startListening(code: LanguageCode, h: ListenHandlers): Promise<void> {
  if (!isSttAvailable()) throw new Error('STT_UNAVAILABLE');

  let finished = false;
  Voice.onSpeechPartialResults = (e: any) => {
    const t = e?.value?.[0];
    if (t) h.onPartial?.(t);
  };
  Voice.onSpeechResults = (e: any) => {
    const t = e?.value?.[0];
    finished = true;
    if (t) h.onFinal(t);
  };
  Voice.onSpeechError = (e: any) => {
    if (finished) return;
    finished = true;
    h.onError(e?.error?.message ?? 'Speech recognition error');
  };
  Voice.onSpeechEnd = () => h.onEnd?.();

  await Voice.start(LANGUAGES[code].speechLocale);
}

export async function stopListening(): Promise<void> {
  if (!isSttAvailable()) return;
  try {
    await Voice.stop();
  } catch {
    /* ignore */
  }
}

export async function cancelListening(): Promise<void> {
  if (!isSttAvailable()) return;
  try {
    await Voice.cancel();
    await Voice.destroy();
  } catch {
    /* ignore */
  }
}
