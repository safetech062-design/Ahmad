/**
 * Wake-phrase matching (pure). This is the text side of a future hands-free
 * mode: given what the speech recognizer heard, did the user say the wake
 * phrase, and what command followed it? It is NOT a wake-word engine - it only
 * works on recognizer output, which Android only provides while the app is
 * open (see wakeword.ts and docs/ANDROID13_LIMITS.md).
 */
export const DEFAULT_WAKE_PHRASES = [
  'hey jarvis',
  'jarvis',
  'mera dost',
  'میرا دوست',
  'جارویس',
  'جاروس',
  'صديقي',
  'جارفيس',
  'زما ملګری',
];

export function normalizeSpeech(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,!?;:"'“”،؟۔]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchWakePhrase(
  text: string,
  phrases: string[] = DEFAULT_WAKE_PHRASES,
): { matched: boolean; command: string } {
  const n = normalizeSpeech(text);
  let best: { idx: number; len: number } | null = null;
  for (const p of phrases) {
    const np = normalizeSpeech(p);
    const idx = n.indexOf(np);
    if (idx < 0) continue;
    if (!best || idx < best.idx || (idx === best.idx && np.length > best.len)) best = { idx, len: np.length };
  }
  if (!best) return { matched: false, command: '' };
  return { matched: true, command: n.slice(best.idx + best.len).trim() };
}
