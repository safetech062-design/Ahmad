import { AIError, AIProvider } from '../types';

export const openaiProvider: AIProvider = {
  id: 'openai',
  label: 'OpenAI (ChatGPT)',
  defaultModel: 'gpt-4o-mini',
  async complete({ apiKey, model, system, messages, signal }) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: system }, ...messages],
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new AIError(data?.error?.message ?? `OpenAI request failed (${res.status})`, res.status);
    }
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== 'string') throw new AIError('OpenAI returned an empty response');
    return text;
  },
};
