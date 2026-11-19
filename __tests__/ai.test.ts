import { buildContext } from '../src/modules/ai/context';
import { buildPlannerSystemPrompt, parsePlan, toLocalIso } from '../src/modules/ai/planner';

describe('buildContext', () => {
  it('keeps the last N turns and starts with a user turn', () => {
    const h = [
      { role: 'assistant' as const, content: 'hi' },
      { role: 'user' as const, content: 'a' },
      { role: 'assistant' as const, content: 'b' },
      { role: 'user' as const, content: 'c' },
    ];
    const out = buildContext(h, 3);
    expect(out[0].role).toBe('user');
    expect(out[out.length - 1].content).toBe('c');
  });
  it('merges consecutive same-role turns', () => {
    const out = buildContext([
      { role: 'user', content: 'one' },
      { role: 'user', content: 'two' },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].content).toContain('two');
  });
  it('respects the character budget but keeps the newest turn', () => {
    const big = 'x'.repeat(100);
    const out = buildContext(
      [
        { role: 'user', content: big },
        { role: 'assistant', content: big },
        { role: 'user', content: big },
      ],
      20,
      150,
    );
    expect(out[out.length - 1].role).toBe('user');
    expect(out.length).toBeLessThan(3);
  });
});

describe('parsePlan', () => {
  const allowed = new Set(['open_app', 'call_contact']);
  it('parses a clean JSON plan', () => {
    const p = parsePlan('{"reply":"Opening maps","steps":[{"tool":"open_app","args":{"app":"maps"}}]}', allowed);
    expect(p.reply).toBe('Opening maps');
    expect(p.steps).toEqual([{ tool: 'open_app', args: { app: 'maps' } }]);
  });
  it('strips code fences', () => {
    const p = parsePlan('```json\n{"reply":"ok","steps":[]}\n```');
    expect(p.reply).toBe('ok');
  });
  it('drops unknown tools', () => {
    const p = parsePlan('{"reply":"x","steps":[{"tool":"format_phone","args":{}}]}', allowed);
    expect(p.steps).toHaveLength(0);
  });
  it('caps the number of steps', () => {
    const steps = Array.from({ length: 10 }, () => ({ tool: 'open_app', args: {} }));
    expect(parsePlan(JSON.stringify({ reply: '', steps }), allowed).steps).toHaveLength(6);
  });
  it('treats plain text as a reply', () => {
    const p = parsePlan('Hello there!');
    expect(p).toEqual({ reply: 'Hello there!', steps: [] });
  });
  it('treats broken JSON as a reply', () => {
    expect(parsePlan('{"reply": oops').steps).toHaveLength(0);
  });
});

describe('planner prompt', () => {
  it('lists tools, language, time and memory', () => {
    const prompt = buildPlannerSystemPrompt({
      tools: [{ name: 'open_app', args: '{"app": string}', description: 'Open an app' }],
      languageName: 'Urdu',
      now: new Date(2026, 10, 18, 7, 0, 0),
      memory: ['My boss is Ahmed'],
    });
    expect(prompt).toContain('open_app');
    expect(prompt).toContain('Urdu');
    expect(prompt).toContain('2026-11-18T07:00:00');
    expect(prompt).toContain('My boss is Ahmed');
  });
  it('formats ISO with offset', () => {
    expect(toLocalIso(new Date(2026, 0, 5, 9, 30, 0))).toMatch(/^2026-01-05T09:30:00[+-]\d\d:\d\d$/);
  });
});
