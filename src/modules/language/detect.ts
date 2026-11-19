import type { LanguageCode } from './translations';

/**
 * Script-based language detection (pure, no dependencies).
 *
 * What it can do:  Latin script -> English.  Arabic script -> Arabic / Urdu / Pashto,
 * decided by letters that exist in only one of them.
 * What it cannot do: Roman Urdu ("kya haal hai") is Latin script and is treated as
 * English; very short Urdu/Pashto phrases that use only shared letters are ambiguous
 * and fall back to `current`. The AI itself is told to match the user's language.
 */
const count = (text: string, re: RegExp) => (text.match(re) ?? []).length;

const ARABIC_SCRIPT = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/g;
const LATIN = /[A-Za-z]/g;
// Letters used by Pashto but not Urdu/Arabic: ټ ډ ړ ږ ښ ڼ ګ ې ۍ ځ څ
const PASHTO_ONLY = /[ټډړږښڼګېۍځڅ]/g;
// Letters used by Urdu but not Pashto/Arabic: ٹ ڈ ڑ ں ے ہ ھ ۓ
const URDU_ONLY = /[ٹڈڑںےہھۓ]/g;

export function detectLanguage(text: string, current?: LanguageCode): LanguageCode | null {
  const arabic = count(text, ARABIC_SCRIPT);
  const latin = count(text, LATIN);
  if (arabic + latin === 0) return null;
  if (latin >= arabic) return 'en';

  const pashto = count(text, PASHTO_ONLY);
  const urdu = count(text, URDU_ONLY);
  if (pashto > urdu) return 'ps';
  if (urdu > pashto) return 'ur';

  // Persian-style kaf/yeh are shared by Urdu and Pashto (Arabic uses ك ي).
  if (/[کی]/.test(text)) return current === 'ps' ? 'ps' : 'ur';
  return 'ar';
}

/** True when the text is mostly right-to-left script. */
export function isRtlText(text: string): boolean {
  return count(text, ARABIC_SCRIPT) > count(text, LATIN);
}
