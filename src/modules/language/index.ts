import { useSettings } from '../../state/settingsStore';
import { LANGUAGES, LanguageInfo, translations } from './translations';

export * from './translations';
export * from './detect';

function fill(text: string, params?: Record<string, string>): string {
  return params ? text.replace(/\{(\w+)\}/g, (_m, k) => params[k] ?? `{${k}}`) : text;
}

export function useI18n(): {
  t: (key: string, params?: Record<string, string>) => string;
  lang: LanguageInfo;
  rtl: boolean;
} {
  const code = useSettings((s) => s.language);
  const dict = translations[code];
  return {
    t: (key, params) => fill(dict[key] ?? translations.en[key] ?? key, params),
    lang: LANGUAGES[code],
    rtl: LANGUAGES[code].rtl,
  };
}

/** Non-hook translation helper for use outside components. */
export function translate(code: keyof typeof translations, key: string, params?: Record<string, string>): string {
  return fill(translations[code][key] ?? translations.en[key] ?? key, params);
}

/** Cheap script-based detection so replies/typing can switch direction mid-conversation. */
export function detectScriptRtl(text: string): boolean {
  return /[؀-ۿݐ-ݿ]/.test(text);
}
