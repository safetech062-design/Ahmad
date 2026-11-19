import { AIError, AIProvider } from '../types';

export const geminiProvider: AIProvider = {
  id: 'gemini',
  label: 'Google (Gemini)',
  defaultModel: 'gemini-2.5-flash',
  async complete({ apiKey, model, system, messages, signal }) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model,
    )}:generateContent`;
    const res = await fetch(url, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new AIError(data?.error?.message ?? `Gemini request failed (${res.status})`, res.status);
    }
    const text = (data?.candidates?.[0]?.content?.parts ?? [])
      .map((p: any) => p?.text ?? '')
      .join('');
    if (!text) throw new AIError('Gemini returned an empty response');
    return text;
  },
};
