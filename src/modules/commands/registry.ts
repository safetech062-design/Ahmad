import type { ToolSpec } from '../ai/planner';
import { qaqcTools } from '../qaqc';
import { coreTools } from './tools';
import type { ToolDef } from './types';

/**
 * The tool registry. To add a capability: write a ToolDef and add it here (or
 * export it from a module and spread it in, like qaqcTools). The planner prompt,
 * executor and allow-list are all generated from this one list.
 */
export const TOOLS: ToolDef[] = [...coreTools, ...qaqcTools];

export const TOOL_MAP: Map<string, ToolDef> = new Map(TOOLS.map((t) => [t.name, t]));

export const toolSpecs = (): ToolSpec[] => TOOLS.map(({ name, description, args }) => ({ name, description, args }));
