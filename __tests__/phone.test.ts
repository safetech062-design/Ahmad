import { resolveApp } from '../src/modules/phone/apps';
import { normalizePhone, toDialable } from '../src/modules/phone/numbers';
import { displayName, matchesKind, matchesQuery, normalizeKind } from '../src/modules/files/fileTypes';
import { isBlockedTarget } from '../src/modules/settings/policy';
import { buildDailyPlan, formatDailyPlan } from '../src/modules/productivity/dailyPlan';
import { normalizeService, googleSearchUrl } from '../src/modules/integrations/services';

describe('apps', () => {
  it('resolves by alias', () => expect(resolveApp('google maps')?.pkg).toBe('com.google.android.apps.maps'));
  it('resolves Urdu alias', () => expect(resolveApp('واٹس ایپ')?.id).toBe('whatsapp'));
  it('strips "the" and "app"', () => expect(resolveApp('the WhatsApp app')?.id).toBe('whatsapp'));
  it('unknown app is null', () => expect(resolveApp('my secret game')).toBeNull());
});

describe('numbers', () => {
  it('keeps international numbers', () => expect(normalizePhone('+971 50 123 4567')).toBe('971501234567'));
  it('00 prefix', () => expect(normalizePhone('00923001234567')).toBe('923001234567'));
  it('local number with country code', () => expect(normalizePhone('0300 1234567', '92')).toBe('923001234567'));
  it('local number without country code is refused', () => expect(normalizePhone('0300 1234567')).toBeNull());
  it('dialable', () => expect(toDialable('+92 (300) 123-4567')).toBe('+923001234567'));
});

describe('files', () => {
  it('kinds', () => {
    expect(normalizeKind('Excel')).toBe('excel');
    expect(matchesKind('NCR Register.xlsx', 'excel')).toBe(true);
    expect(matchesKind('photo.jpg', 'pdf')).toBe(false);
  });
  it('query words', () => {
    expect(matchesQuery('Monthly NCR Report.xlsx', 'ncr report')).toBe(true);
    expect(matchesQuery('Monthly NCR Report.xlsx', 'wir')).toBe(false);
    expect(matchesQuery('anything.pdf', '')).toBe(true);
  });
  it('display name from SAF uri', () =>
    expect(
      displayName('content://com.android.externalstorage.documents/tree/primary%3ADocuments/document/primary%3ADocuments%2FNCR%20Log.xlsx'),
    ).toBe('NCR Log.xlsx'));
});

describe('policy', () => {
  it('blocks banking and payment apps', () => {
    expect(isBlockedTarget('open my bank app')).toBe(true);
    expect(isBlockedTarget('JazzCash')).toBe(true);
    expect(isBlockedTarget('com.paypal.android.p2pmobile')).toBe(true);
  });
  it('allows normal apps', () => {
    expect(isBlockedTarget('Google Maps')).toBe(false);
    expect(isBlockedTarget('WhatsApp')).toBe(false);
  });
});

describe('daily plan', () => {
  it('groups overdue, today and open', () => {
    const now = new Date(2026, 10, 18, 7, 0, 0);
    const yesterday = new Date(2026, 10, 17, 12).getTime();
    const plan = buildDailyPlan(
      [
        { id: '1', title: 'Late', dueAt: yesterday, done: false },
        { id: '2', title: 'Done', done: true },
        { id: '3', title: 'Open', done: false },
      ],
      [{ title: 'Call', when: new Date(2026, 10, 18, 8).getTime() }],
      now,
    );
    expect(plan.overdue.map((t) => t.title)).toEqual(['Late']);
    expect(plan.open.map((t) => t.title)).toEqual(['Open']);
    expect(formatDailyPlan(plan)[0]).toContain('08:00');
  });
});

describe('integrations', () => {
  it('normalizes service names', () => {
    expect(normalizeService('chat gpt')).toBe('chatgpt');
    expect(normalizeService('Claude')).toBe('claude');
    expect(normalizeService('Gemini')).toBe('gemini');
    expect(normalizeService('siri')).toBeNull();
  });
  it('builds search url', () => expect(googleSearchUrl('a b')).toBe('https://www.google.com/search?q=a%20b'));
});
