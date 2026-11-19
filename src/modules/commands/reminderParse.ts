/**
 * Minimal English reminder-time parser (pure).
 * Handles: "in 10 minutes", "in 2 hours", "tomorrow at 8 am", "today at 17:30",
 * "at 5 pm", "tomorrow morning". Anything else returns null and the request
 * falls through to the AI planner, which is told to return an ISO time.
 */
export interface ParsedReminder {
  title: string;
  when: Date;
}

const WORD_NUMBERS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, five: 5, ten: 10, fifteen: 15, thirty: 30,
};

const PART_OF_DAY_HOUR: Record<string, number> = { morning: 9, afternoon: 14, evening: 18 };

export function parseReminder(input: string, now: Date = new Date()): ParsedReminder | null {
  let rest = ` ${input.trim()} `;
  let when: Date | null = null;

  let dayWord: string | null = null;
  const dm = rest.match(/\b(tomorrow|today|tonight)\b/i);
  if (dm) {
    dayWord = dm[1].toLowerCase();
    rest = rest.replace(dm[0], ' ');
  }
  let partOfDay: string | null = null;
  const pm = rest.match(/\b(morning|afternoon|evening)\b/i);
  if (pm && dayWord) {
    partOfDay = pm[1].toLowerCase();
    rest = rest.replace(pm[0], ' ');
  }

  const rel = rest.match(/\bin\s+(\d+|an?|one|two|three|five|ten|fifteen|thirty)\s*(minutes?|mins?|hours?|hrs?)\b/i);
  if (rel) {
    const n = WORD_NUMBERS[rel[1].toLowerCase()] ?? parseInt(rel[1], 10);
    const isHour = /^h/i.test(rel[2]);
    when = new Date(now.getTime() + n * (isHour ? 3_600_000 : 60_000));
    rest = rest.replace(rel[0], ' ');
  } else {
    const abs =
      rest.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?(?![a-z0-9])/i) ??
      rest.match(/\b(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)(?![a-z])/i);
    if (abs) {
      let h = parseInt(abs[1], 10);
      const min = abs[2] ? parseInt(abs[2], 10) : 0;
      const ampm = abs[3] ? abs[3].toLowerCase().replace(/\./g, '') : null;
      if (ampm === 'pm' && h < 12) h += 12;
      else if (ampm === 'am' && h === 12) h = 0;
      else if (!ampm && h < 12 && (dayWord === 'tonight' || partOfDay === 'afternoon' || partOfDay === 'evening')) h += 12;
      if (h > 23 || min > 59) return null;
      when = buildDate(now, dayWord, h, min);
      rest = rest.replace(abs[0], ' ');
    } else if (dayWord) {
      const h = partOfDay ? PART_OF_DAY_HOUR[partOfDay] : dayWord === 'tonight' ? 20 : 9;
      when = buildDate(now, dayWord, h, 0);
    }
  }

  if (!when) return null;
  return { title: cleanTitle(rest), when };
}

function buildDate(now: Date, dayWord: string | null, h: number, min: number): Date {
  const d = new Date(now.getTime());
  if (dayWord === 'tomorrow') d.setDate(d.getDate() + 1);
  d.setHours(h, min, 0, 0);
  if (!dayWord && d.getTime() <= now.getTime()) d.setDate(d.getDate() + 1);
  return d;
}

function cleanTitle(s: string): string {
  let t = s
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(?:to|about|that|for)\s+/i, '')
    .replace(/\s+(?:at|on|in|by|for)$/i, '')
    .replace(/[.,;!?]+$/g, '')
    .trim();
  if (!t) return 'Reminder';
  t = t.charAt(0).toUpperCase() + t.slice(1);
  return t;
}
