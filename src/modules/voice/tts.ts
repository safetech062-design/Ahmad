import * as Speech from 'expo-speech';
import { LANGUAGES, LanguageCode } from '../language/translations';

/** Returns true if the phone has a TTS voice for this language installed. */
export async function isTtsLanguageAvailable(code: LanguageCode): Promise<boolean> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const base = LANGUAGES[code].speechLocale.split('-')[0].toLowerCase();
    return voices.some((v) => v.language.toLowerCase().startsWith(base));
  } catch {
    return false;
  }
}

export interface SpeakHandlers {
  onStart?: () => void;
  onDone?: () => void;
  onError?: () => void;
}

export function speak(text: string, code: LanguageCode, handlers: SpeakHandlers = {}): void {
  Speech.stop();
  Speech.speak(text, {
    language: LANGUAGES[code].speechLocale,
    onStart: handlers.onStart,
    onDone: handlers.onDone,
    onStopped: handlers.onDone,
    onError: handlers.onError,
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}
