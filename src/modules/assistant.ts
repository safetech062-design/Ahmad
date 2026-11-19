import { AIError, askAI, LANGUAGE_NAMES, buildPlannerSystemPrompt, parsePlan } from './ai';
import type { Plan } from './ai';
import { executePlan } from './commands/executor';
import { parseLocalIntent } from './commands/localParser';
import { TOOL_MAP, toolSpecs } from './commands/registry';
import type { StepOutcome, ToolContext } from './commands/types';
import { detectLanguage, translate } from './language';
import type { LanguageCode } from './language/translations';
import { isTtsLanguageAvailable, speak } from './voice/tts';
import { askConfirm } from '../state/confirmStore';
import { useChat } from '../state/chatStore';
import { useMemory } from '../state/memoryStore';
import { useSettings } from '../state/settingsStore';

/**
 * Orchestrates one user turn:
 *   detect language -> understand (offline parser, else AI planner) ->
 *   execute steps (with confirmations) -> store results -> speak.
 * UI-independent: screens only call handleUserText().
 */
let ttsWarned = false;

async function planWithAI(text: string, lang: LanguageCode): Promise<Plan> {
  const st = useSettings.getState();
  const history = useChat
    .getState()
    .messages.filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.text }));
  const system = buildPlannerSystemPrompt({
    tools: toolSpecs(),
    languageName: LANGUAGE_NAMES[lang],
    now: new Date(),
    memory: st.memoryEnabled ? useMemory.getState().items.map((i) => i.text) : [],
  });
  const raw = await askAI({ provider: st.provider, model: st.models[st.provider], language: lang, history, system });
  return parsePlan(raw, new Set(TOOL_MAP.keys()));
}

function describeOutcome(o: StepOutcome, t: ToolContext['t']): string {
  const base = `${o.tool} - ${t(`res_${o.result.code}`)}`;
  return o.result.detail ? `${base}: ${o.result.detail}` : base;
}

export async function handleUserText(
  text: string,
  hooks: { onSpeakStart?: () => void; onSpeakEnd?: () => void } = {},
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  const st = useSettings.getState();
  // Reply/speech language for THIS turn. The UI language is not changed.
  const lang: LanguageCode = st.autoDetectLanguage ? (detectLanguage(trimmed, st.language) ?? st.language) : st.language;
  const t: ToolContext['t'] = (key, params) => translate(lang, key, params);

  useChat.getState().add('user', trimmed);

  try {
    const local = parseLocalIntent(trimmed, new Date());
    const plan: Plan = local ? { reply: '', steps: local } : await planWithAI(trimmed, lang);

    if (plan.reply) useChat.getState().add('assistant', plan.reply);
    if (!plan.reply && plan.steps.length === 0) {
      useChat.getState().add('error', t('emptyReply'));
      return;
    }

    const ctx: ToolContext = { settings: useSettings.getState(), lang, now: new Date(), t, confirm: askConfirm };
    const outcomes = await executePlan(plan.steps, ctx);
    for (const o of outcomes) {
      useChat.getState().add('action', describeOutcome(o, t));
      if (o.result.output) useChat.getState().add('assistant', o.result.output);
    }

    const last = outcomes[outcomes.length - 1];
    const spoken = plan.reply || (last ? t(`res_${last.result.code}`) : '');
    if (st.speakReplies && spoken) {
      if (!ttsWarned && !(await isTtsLanguageAvailable(lang))) {
        ttsWarned = true;
        useChat.getState().add('error', translate(lang, 'ttsLangMissing'));
      }
      speak(spoken, lang, { onStart: hooks.onSpeakStart, onDone: hooks.onSpeakEnd, onError: hooks.onSpeakEnd });
    }
  } catch (e: any) {
    const msg =
      e instanceof AIError && e.message === 'NO_API_KEY'
        ? translate(lang, 'noKeyError')
        : `${translate(lang, 'errorPrefix')}: ${e?.message ?? String(e)}`;
    useChat.getState().add('error', msg);
  }
}
