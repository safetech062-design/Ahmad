import type { PlanStep } from '../ai/planner';
import { parseReminder } from './reminderParse';
import { toLocalIso } from '../ai/planner';

/**
 * Offline command parser (pure). Handles the common, unambiguous commands in
 * English, Urdu and Arabic instantly, without an API call or internet.
 * Anything it does not recognise returns null and goes to the AI planner,
 * which understands free-form requests in all four languages.
 */
const WAKE_PREFIX = /^(?:hey\s+|ok\s+|okay\s+)?(?:jarvis|mera dost|میرا دوست|جارویس|جاروس)\s*[,:،-]?\s+/i;

function clean(input: string): string {
  return input
    .trim()
    .replace(WAKE_PREFIX, '')
    .replace(/^(?:please|pls)\s+/i, '')
    .replace(/[.!?۔؟]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const SETTINGS_PAGES: Record<string, string> = {
  wifi: 'wifi', 'wi-fi': 'wifi', bluetooth: 'bluetooth', location: 'location',
  'airplane mode': 'airplane', sound: 'sound', display: 'display', battery: 'battery',
  apps: 'apps', settings: 'main',
};

const step = (tool: string, args: Record<string, unknown>): PlanStep[] => [{ tool, args }];

export function parseLocalIntent(input: string, now: Date = new Date()): PlanStep[] | null {
  const s = clean(input);
  if (!s) return null;
  let m: RegExpMatchArray | null;

  // ---------- English ----------
  if ((m = s.match(/^(?:open|show|go to)\s+(?:the\s+)?(wi-?fi|bluetooth|location|airplane mode|sound|display|battery|apps|settings)(?:\s+settings?)?$/i))) {
    const key = m[1].toLowerCase();
    return step('open_settings', { page: SETTINGS_PAGES[key] ?? 'main' });
  }
  if ((m = s.match(/^(?:navigate to|directions to|take me to|show me directions to)\s+(.+)$/i))) {
    return step('open_maps', { query: m[1] });
  }
  if ((m = s.match(/^(?:open|launch|start)\s+(?:the\s+)?(.+?)(?:\s+app)?$/i))) {
    return step('open_app', { app: m[1] });
  }
  if ((m = s.match(/^(?:send\s+)?(?:a\s+)?whatsapp(?:\s+message)?\s+to\s+(.+?)\s+(?:saying|that says|that)\s+(.+)$/i))) {
    return step('whatsapp_message', { contact: m[1], text: m[2] });
  }
  if ((m = s.match(/^(?:message|text)\s+(.+?)\s+on\s+whatsapp\s+(?:saying|that)\s+(.+)$/i))) {
    return step('whatsapp_message', { contact: m[1], text: m[2] });
  }
  if ((m = s.match(/^(?:call|phone|dial|ring)\s+(.+)$/i))) {
    return step('call_contact', { name: m[1] });
  }
  if ((m = s.match(/^ask\s+(chat\s?gpt|claude|gemini)(?:\s+to)?\s+(.+)$/i))) {
    return step('ask_ai', { service: m[1].replace(/\s+/g, ''), prompt: m[2] });
  }
  if ((m = s.match(/^(?:find|search for|look for|show)\s+(?:me\s+)?(?:my\s+|the\s+|all\s+)?(excel|spreadsheet|pdf|image|photo|picture|document|file)s?(?:\s+files?)?(?:\s+(?:named|called|about|for)\s+(.+))?$/i))) {
    return step('find_files', { kind: m[1], query: m[2] ?? '' });
  }
  if ((m = s.match(/^(?:search|google)(?:\s+(?:google|the web|online))?(?:\s+for)?\s+(.+)$/i))) {
    return step('search_web', { query: m[1] });
  }
  if ((m = s.match(/^remind me\s+(.+)$/i))) {
    const r = parseReminder(m[1], now);
    return r ? step('set_reminder', { title: r.title, when: toLocalIso(r.when) }) : null;
  }
  if ((m = s.match(/^(?:add|create|new)\s+(?:a\s+)?task\s*[:-]?\s*(?:to\s+)?(.+)$/i))) {
    return step('add_task', { title: m[1] });
  }
  if ((m = s.match(/^(?:take|add|make|write)\s+(?:a\s+)?note\s*[:-]?\s*(.+)$/i)) || (m = s.match(/^note\s+(?:down|that)\s+(.+)$/i))) {
    return step('add_note', { text: m[1] });
  }
  if (/^(?:show|list|what are)\s+(?:me\s+)?(?:my\s+)?tasks?$/i.test(s)) return step('list_tasks', {});
  if (/^(?:plan my day|daily plan|what(?:'s| is) my day(?: like)?)$/i.test(s)) return step('daily_plan', {});
  if ((m = s.match(/^remember(?:\s+that)?\s+(.+)$/i))) return step('remember', { fact: m[1] });
  if (/^(?:battery|device info|phone info|phone status|how(?:'s| is) my (?:battery|phone))$/i.test(s)) {
    return step('device_info', {});
  }

  // ---------- Urdu ----------
  if ((m = s.match(/^(.+?)\s+کو\s+(?:کال|فون)\s+(?:کرو|کریں|کر دو|ملاؤ)$/))) return step('call_contact', { name: m[1] });
  if ((m = s.match(/^(.+?)\s+(?:کھولو|کھولیں|کھول دو|چلاؤ)$/))) return step('open_app', { app: m[1] });
  if ((m = s.match(/^(.+?)\s+(?:گوگل\s+)?(?:پر\s+)?(?:سرچ|تلاش)\s+(?:کرو|کریں)$/))) return step('search_web', { query: m[1] });

  // ---------- Arabic ----------
  if ((m = s.match(/^(?:افتح|شغل)\s+(.+)$/))) return step('open_app', { app: m[1] });
  if ((m = s.match(/^اتصل\s+(?:بـ|ب|على)\s*(.+)$/))) return step('call_contact', { name: m[1] });
  if ((m = s.match(/^ابحث(?:\s+في\s+جوجل)?\s+عن\s+(.+)$/))) return step('search_web', { query: m[1] });

  return null;
}
