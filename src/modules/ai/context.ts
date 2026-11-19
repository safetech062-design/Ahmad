import type { ChatTurn } from './types';

/**
 * Context management (pure). Keeps the most recent turns within a turn and
 * character budget, drops empty turns, makes sure the window starts with a
 * user turn, and merges consecutive same-role turns (which happen after error
 * or action messages are filtered out) so every provider accepts the payload.
 */
export function buildContext(history: ChatTurn[], maxTurns = 20, maxChars = 12000): ChatTurn[] {
  const turns = history.filter((t) => t.content.trim().length > 0).slice(-maxTurns);

  const kept: ChatTurn[] = [];
  let total = 0;
  for (let i = turns.length - 1; i >= 0; i--) {
    const size = turns[i].content.length;
    if (kept.length > 0 && total + size > maxChars) break;
    total += size;
    kept.unshift(turns[i]);
  }
  while (kept.length > 0 && kept[0].role !== 'user') kept.shift();

  const merged: ChatTurn[] = [];
  for (const t of kept) {
    const last = merged[merged.length - 1];
    if (last && last.role === t.role) last.content += `\n${t.content}`;
    else merged.push({ role: t.role, content: t.content });
  }
  return merged;
}
