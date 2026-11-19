/** Daily planning (pure): what is overdue, what is scheduled today, what is still open. */
export interface PlanTask {
  id: string;
  title: string;
  dueAt?: number;
  done: boolean;
}
export interface PlanReminder {
  title: string;
  when: number;
}
export interface DailyPlan {
  overdue: PlanTask[];
  today: PlanReminder[];
  open: PlanTask[];
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function buildDailyPlan(tasks: PlanTask[], reminders: PlanReminder[], now: Date): DailyPlan {
  const dayStart = startOfDay(now);
  const dayEnd = dayStart + 86_400_000;
  const openTasks = tasks.filter((t) => !t.done);
  return {
    overdue: openTasks.filter((t) => t.dueAt !== undefined && t.dueAt < dayStart),
    today: reminders.filter((r) => r.when >= dayStart && r.when < dayEnd).sort((a, b) => a.when - b.when),
    open: openTasks.filter((t) => t.dueAt === undefined || t.dueAt >= dayStart),
  };
}

const hhmm = (ms: number) => {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/** Plain-text lines (language-neutral content: titles and times only). */
export function formatDailyPlan(plan: DailyPlan): string[] {
  const lines: string[] = [];
  for (const r of plan.today) lines.push(`${hhmm(r.when)}  ${r.title}`);
  for (const t of plan.overdue) lines.push(`! ${t.title}`);
  for (const t of plan.open) lines.push(`- ${t.title}`);
  return lines;
}
