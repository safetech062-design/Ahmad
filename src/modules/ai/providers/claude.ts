import { AIError, AIProvider } from '../types';

export const claudeProvider: AIProvider = {
  id: 'claude',
  label: 'Anthropic (Claude)',
  defaultModel: 'claude-sonnet-5-5',
  async complete({ apiKey, model, system, messages, signal }) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system,
        messages,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new AIError(data?.error?.message ?? `Claude request failed (${res.status})`, res.status);
    }
    const text = (data?.content ?? [])
      .filter((b: any) => b?.type === 'text')
      .map((b: any) => b.text)
      .join('');
    if (!text) throw new AIError('Claude returned an empty response');
    return text;
  },
};
