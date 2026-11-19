import { detectLanguage, isRtlText } from '../src/modules/language/detect';
import { matchWakePhrase } from '../src/modules/voice/wakeMatch';

describe('detectLanguage', () => {
  it('detects English', () => expect(detectLanguage('open google maps')).toBe('en'));
  it('detects Urdu by Urdu-only letters', () => expect(detectLanguage('مجھے ٹھیک وقت بتائیں')).toBe('ur'));
  it('detects Pashto by Pashto-only letters', () => expect(detectLanguage('زه ښه یم')).toBe('ps'));
  it('detects Arabic', () => expect(detectLanguage('كيف حالك اليوم')).toBe('ar'));
  it('returns null for digits only', () => expect(detectLanguage('12345')).toBeNull());
  it('flags RTL text', () => {
    expect(isRtlText('السلام عليكم')).toBe(true);
    expect(isRtlText('hello')).toBe(false);
  });
});

describe('matchWakePhrase', () => {
  it('extracts the command after the phrase', () => {
    expect(matchWakePhrase('Hey Jarvis, open maps')).toEqual({ matched: true, command: 'open maps' });
  });
  it('matches with no command', () => expect(matchWakePhrase('jarvis')).toEqual({ matched: true, command: '' }));
  it('ignores other speech', () => expect(matchWakePhrase('what a nice day').matched).toBe(false));
  it('matches Urdu phrase', () => expect(matchWakePhrase('میرا دوست کال کرو').matched).toBe(true));
});
