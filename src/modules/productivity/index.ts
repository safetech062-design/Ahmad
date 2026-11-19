/**
 * Productivity Engine (Phase 3): reminders (local notifications), tasks, notes
 * and a daily plan. State lives in state/productivityStore.ts; the UI never
 * touches notification code directly.
 */
export interface Task {
  id: string;
  title: string;
  dueAt?: number;
  done: boolean;
}

export * from './dailyPlan';
export * from './reminders';

/** Architecture only - not implemented. Plug a provider in later (Google/Android calendar, backend). */
export interface CalendarProvider {
  id: string;
  listEvents(fromMs: number, toMs: number): Promise<{ id: string; title: string; startMs: number; endMs: number }[]>;
  createEvent(title: string, startMs: number, endMs: number): Promise<string>;
}

/** Architecture only - not implemented. Reports render a data set into a file (PDF/XLSX/HTML). */
export interface ReportGenerator<TInput = unknown> {
  id: string;
  title: string;
  generate(input: TInput): Promise<{ fileUri: string; mimeType: string }>;
}
