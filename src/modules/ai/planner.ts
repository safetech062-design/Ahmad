/**
 * Command understanding + multi-step planning (pure, UI-independent).
 *
 * The model is asked to answer with ONE JSON object:
 *   { "reply": "<what to say>", "steps": [ { "tool": "<name>", "args": {...} } ] }
 * The app - not the model - executes the steps and reports real results, so the
 * model is told never to claim an action was done.
 */
export interface ToolSpec {
  name: string;
  description: string;
  /** Human-readable argument shape, e.g. {"name": string} */
  args: string;
}

export interface PlanStep {
  tool: string;
  args: Record<string, unknown>;
}

export interface Plan {
  reply: string;
  steps: PlanStep[];
}

export const MAX_PLAN_STEPS = 6;

/** Local time with UTC offset, e.g. 2026-11-18T08:00:00+04:00 (what the model must use for reminders). */
export function toLocalIso(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const a = Math.abs(off);
  return (
    `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T` +
    `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}${sign}${p(Math.floor(a / 60))}:${p(a % 60)}`
  );
}

export interface PlannerPromptInput {
  tools: ToolSpec[];
  languageName: string;
  now: Date;
  /** Facts the user explicitly approved to be remembered. */
  memory: string[];
}

export function buildPlannerSystemPrompt({ tools, languageName, now, memory }: PlannerPromptInput): string {
  const toolLines = tools.map((t) => `- ${t.name} ${t.args}: ${t.description}`).join('\n');
  const memoryBlock = memory.length
    ? `\nThings the user asked you to remember:\n${memory.map((m) => `- ${m}`).join('\n')}\n`
    : '';
  return [
    'You are Mera Dost ("My Friend"), a friendly, intelligent, professional personal assistant inside an Android app.',
    `Reply in ${languageName} unless the user clearly writes in another language; then match theirs.`,
    `Current local date/time: ${toLocalIso(now)}.`,
    '',
    'Respond with ONE JSON object and nothing else (no markdown, no code fences):',
    '{"reply": string, "steps": [{"tool": string, "args": object}]}',
    '- "reply": a short, natural sentence suitable for being read aloud. No markdown.',
    '- "steps": phone actions to run in order, using ONLY the tools below. Use [] for plain conversation.',
    '',
    'Rules:',
    '- The app executes the steps and reports the real result. Never say an action is already done.',
    '- Never open banking, payment or wallet apps and never perform financial transactions.',
    '- Do not invent phone numbers, file names or contacts. If needed information is missing, ask for it in "reply" and use no steps.',
    '- Calls, messages and file deletion are confirmed by the user in the app; just request the step.',
    '- For set_reminder, "when" must be ISO 8601 local time with offset, in the future.',
    '- If asked to do something no tool supports, say so honestly in "reply".',
    '',
    'Tools:',
    toolLines,
    memoryBlock,
  ].join('\n');
}

function stripFences(raw: string): string {
  return raw.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
}

/**
 * Tolerant parser. If the model ignored the format and wrote plain text, that
 * text becomes the reply with no steps (so chat still works).
 */
export function parsePlan(raw: string, allowedTools?: Set<string>, maxSteps = MAX_PLAN_STEPS): Plan {
  const text = stripFences(raw);
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first === -1 || last <= first) return { reply: raw.trim(), steps: [] };

  let obj: any;
  try {
    obj = JSON.parse(text.slice(first, last + 1));
  } catch {
    return { reply: raw.trim(), steps: [] };
  }
  if (!obj || typeof obj !== 'object') return { reply: raw.trim(), steps: [] };

  const reply = typeof obj.reply === 'string' ? obj.reply.trim() : '';
  const steps: PlanStep[] = [];
  if (Array.isArray(obj.steps)) {
    for (const s of obj.steps) {
      if (!s || typeof s.tool !== 'string') continue;
      if (allowedTools && !allowedTools.has(s.tool)) continue;
      const args = s.args && typeof s.args === 'object' && !Array.isArray(s.args) ? s.args : {};
      steps.push({ tool: s.tool, args });
      if (steps.length >= maxSteps) break;
    }
  }
  return { reply, steps };
}
