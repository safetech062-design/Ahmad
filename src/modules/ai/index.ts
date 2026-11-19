import type { LanguageCode } from '../language/translations';
import { getApiKey } from '../settings/secureKeys';
import { claudeProvider } from './providers/claude';
import { geminiProvider } from './providers/gemini';
import { openaiProvider } from './providers/openai';
import { buildContext } from './context';
import { AIError, AIProvider, ChatTurn, ProviderId } from './types';

export * from './types';
export * from './planner';

/** Add new providers here; nothing else in the app needs to change. */
export const PROVIDERS: Record<ProviderId, AIProvider> = {
  openai: openaiProvider,
  claude: claudeProvider,
  gemini: geminiProvider,
};

export const PROVIDER_LIST = Object.values(PROVIDERS);

export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  ur: 'Urdu',
  ps: 'Pashto',
  ar: 'Arabic',
};

export function buildSystemPrompt(language: LanguageCode): string {
  return [
    'You are Mera Dost ("My Friend"), a friendly, intelligent, professional personal assistant.',
    `Reply in ${LANGUAGE_NAMES[language]} unless the user clearly writes in another language, then match theirs.`,
    'Keep answers concise and suitable for being read aloud.',
    'You cannot currently control the phone, open apps, or access files; do not claim to have done so.',
  ].join(' ');
}

/** How many past turns are sent to the model. Simple sliding window for now. */
const CONTEXT_WINDOW = 20;

export interface AskOptions {
  provider: ProviderId;
  model: string;
  language: LanguageCode;
  history: ChatTurn[];
  /** Overrides the default chat system prompt (the planner prompt is passed here). */
  system?: string;
  signal?: AbortSignal;
}

/** UI-independent entry point to the AI brain. */
export async function askAI({ provider, model, language, history, system, signal }: AskOptions): Promise<string> {
  const impl = PROVIDERS[provider];
  const apiKey = await getApiKey(provider);
  if (!apiKey) throw new AIError('NO_API_KEY');
  return impl.complete({
    apiKey,
    model: model || impl.defaultModel,
    system: system ?? buildSystemPrompt(language),
    messages: buildContext(history, CONTEXT_WINDOW),
    signal,
  });
}
