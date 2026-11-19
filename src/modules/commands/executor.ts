import { TOOL_MAP } from './registry';
import type { PlanStep, StepOutcome, ToolContext } from './types';

/**
 * Runs a plan step by step. Stops at the first step that is not 'ok' - so if
 * the user cancels "call Ahmed", a following "then message Sara" is not run.
 */
export async function executePlan(steps: PlanStep[], ctx: ToolContext): Promise<StepOutcome[]> {
  const outcomes: StepOutcome[] = [];
  for (const step of steps) {
    const tool = TOOL_MAP.get(step.tool);
    if (!tool) {
      outcomes.push({ tool: step.tool, result: { code: 'unsupported', detail: step.tool } });
      break;
    }
    let result;
    try {
      result = await tool.run(step.args ?? {}, ctx);
    } catch (e: any) {
      result = { code: 'error' as const, detail: e?.message ?? String(e) };
    }
    outcomes.push({ tool: step.tool, result });
    if (result.code !== 'ok') break;
  }
  return outcomes;
}
