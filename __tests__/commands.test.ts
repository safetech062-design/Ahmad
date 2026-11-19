import { parseLocalIntent } from '../src/modules/commands/localParser';
import { parseReminder } from '../src/modules/commands/reminderParse';

const NOW = new Date(2026, 10, 18, 7, 0, 0); // 18 Nov 2026, 07:00 local

describe('parseReminder', () => {
  it('tomorrow at 8 am', () => {
    const r = parseReminder('tomorrow at 8 am', NOW)!;
    expect(r.title).toBe('Reminder');
    expect(r.when.getDate()).toBe(19);
    expect(r.when.getHours()).toBe(8);
  });
  it('title before the time', () => {
    const r = parseReminder('to call the supplier tomorrow at 8 am', NOW)!;
    expect(r.title).toBe('Call the supplier');
  });
  it('relative minutes', () => {
    const r = parseReminder('in 10 minutes to check the oven', NOW)!;
    expect(r.when.getTime() - NOW.getTime()).toBe(10 * 60000);
    expect(r.title).toBe('Check the oven');
  });
  it('pm time today', () => {
    const r = parseReminder('at 5 pm to submit the NCR report', NOW)!;
    expect(r.when.getHours()).toBe(17);
    expect(r.when.getDate()).toBe(18);
    expect(r.title).toBe('Submit the NCR report');
  });
  it('time already passed rolls to tomorrow', () => {
    const r = parseReminder('at 6 am to stretch', NOW)!;
    expect(r.when.getDate()).toBe(19);
  });
  it('returns null without a time', () => expect(parseReminder('buy milk', NOW)).toBeNull());
});

describe('parseLocalIntent', () => {
  const tool = (s: string) => parseLocalIntent(s, NOW)?.[0];
  it('open app with wake word', () =>
    expect(tool('Hey Jarvis, open Google Maps.')).toEqual({ tool: 'open_app', args: { app: 'Google Maps' } }));
  it('wifi settings beat open_app', () =>
    expect(tool('open wifi settings')).toEqual({ tool: 'open_settings', args: { page: 'wifi' } }));
  it('call', () => expect(tool('Jarvis, call Ahmed')).toEqual({ tool: 'call_contact', args: { name: 'Ahmed' } }));
  it('search google', () =>
    expect(tool('Jarvis, search Google for best pdf tools')).toEqual({ tool: 'search_web', args: { query: 'best pdf tools' } }));
  it('find excel file', () => {
    const s = tool('Jarvis, find my Excel file.')!;
    expect(s.tool).toBe('find_files');
    expect(String(s.args.kind).toLowerCase()).toBe('excel');
  });
  it('ask claude', () =>
    expect(tool('Jarvis, ask Claude to create a professional NCR tracker.')).toEqual({
      tool: 'ask_ai',
      args: { service: 'Claude', prompt: 'create a professional NCR tracker' }, // tools normalise the name
    }));
  it('reminder', () => {
    const s = tool('Jarvis, remind me tomorrow at 8 AM.')!;
    expect(s.tool).toBe('set_reminder');
    expect(String(s.args.when)).toContain('2026-11-19T08:00:00');
  });
  it('whatsapp draft', () =>
    expect(tool('send a whatsapp message to Ahmed saying I will be late')).toEqual({
      tool: 'whatsapp_message',
      args: { contact: 'Ahmed', text: 'I will be late' },
    }));
  it('Urdu call', () => expect(tool('احمد کو کال کرو')).toEqual({ tool: 'call_contact', args: { name: 'احمد' } }));
  it('Urdu open', () => expect(tool('واٹس ایپ کھولو')).toEqual({ tool: 'open_app', args: { app: 'واٹس ایپ' } }));
  it('Arabic open', () => expect(tool('افتح الخرائط')).toEqual({ tool: 'open_app', args: { app: 'الخرائط' } }));
  it('free-form goes to the AI', () => expect(parseLocalIntent('what is the capital of France', NOW)).toBeNull());
  it('reminder without time goes to the AI', () => expect(parseLocalIntent('remind me to buy milk', NOW)).toBeNull());
});
