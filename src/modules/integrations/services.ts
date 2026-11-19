import type { ProviderId } from '../ai/types';

/** AI Integration Engine - pure parts. */
export type ExternalService = 'chatgpt' | 'claude' | 'gemini';

export const SERVICE_PROVIDER: Record<ExternalService, ProviderId> = {
  chatgpt: 'openai',
  claude: 'claude',
  gemini: 'gemini',
};

export const SERVICE_LABEL: Record<ExternalService, string> = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  gemini: 'Gemini',
};

export function normalizeService(raw: unknown): ExternalService | null {
  const s = String(raw ?? '').toLowerCase().replace(/[^a-z]/g, '');
  if (s.includes('chatgpt') || s === 'gpt' || s === 'openai') return 'chatgpt';
  if (s.includes('claude') || s.includes('anthropic')) return 'claude';
  if (s.includes('gemini') || s.includes('bard')) return 'gemini';
  return null;
}

export function googleSearchUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}
