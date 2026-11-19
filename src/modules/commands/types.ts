import type { PlanStep } from '../ai/planner';
import type { LanguageCode } from '../language/translations';
import type { useSettings } from '../../state/settingsStore';

export type { PlanStep };
export type SettingsData = ReturnType<typeof useSettings.getState>;

/** Outcome of one tool run. `detail` carries data (names, paths); the wording comes from the code. */
export type ResultCode =
  | 'ok'
  | 'cancelled'
  | 'denied'
  | 'not_found'
  | 'unsupported'
  | 'error'
  | 'blocked'
  | 'disabled'
  | 'needs_setup';

export interface ToolResult {
  code: ResultCode;
  detail?: string;
  /** Optional longer content to show as an assistant message (e.g. an answer from another AI). */
  output?: string;
}

export interface ToolContext {
  settings: SettingsData;
  lang: LanguageCode;
  now: Date;
  t: (key: string, params?: Record<string, string>) => string;
  /** Ask the user yes/no. Resolves false on No / dismissal. */
  confirm: (message: string) => Promise<boolean>;
}

export interface ToolDef {
  name: string;
  /** Shown to the AI planner. */
  description: string;
  /** Argument shape shown to the AI planner. */
  args: string;
  run: (args: Record<string, unknown>, ctx: ToolContext) => Promise<ToolResult>;
}

export interface StepOutcome {
  tool: string;
  result: ToolResult;
}
