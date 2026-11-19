import { Linking } from 'react-native';
import { useMemory } from '../../state/memoryStore';
import { useProductivity } from '../../state/productivityStore';
import { createFolder, deleteEntry, normalizeKind, searchFiles } from '../files';
import { askExternalAI, normalizeService, openGoogleSearch, SERVICE_LABEL } from '../integrations';
import { looksLikePhoneNumber, findContacts } from '../phone/contacts';
import { getDeviceSummary } from '../phone/deviceInfo';
import { launchPackage, openMaps, openUrl } from '../phone/launcher';
import { normalizePhone, toDialable } from '../phone/numbers';
import { resolveApp } from '../phone/apps';
import { normalizeSettingsPage, openSystemSettings } from '../phone/systemSettings';
import { buildDailyPlan, formatDailyPlan } from '../productivity/dailyPlan';
import { scheduleReminder } from '../productivity/reminders';
import { isBlockedTarget } from '../settings/policy';
import type { ToolDef, ToolResult } from './types';

const str = (a: Record<string, unknown>, k: string): string => (a[k] == null ? '' : String(a[k]).trim());
const err = (detail?: string): ToolResult => ({ code: 'error', detail });

/** Resolve "Ahmed" -> { name, number } through the address book, or accept a raw number. */
async function resolveRecipient(
  a: Record<string, unknown>,
  nameKey: string,
): Promise<{ name: string; number: string; extra?: string } | ToolResult> {
  const given = str(a, 'number') || str(a, 'phone');
  const name = str(a, nameKey);
  if (given) return { name: name || given, number: given };
  if (!name) return err('missing name');
  if (looksLikePhoneNumber(name)) return { name, number: name };
  const found = await findContacts(name);
  if (found.status === 'denied') return { code: 'denied', detail: 'contacts permission' };
  if (!found.matches.length) return { code: 'not_found', detail: name };
  const m = found.matches[0];
  return {
    name: m.name,
    number: m.numbers[0],
    extra: found.matches.length > 1 ? ` (+${found.matches.length - 1} other matches)` : undefined,
  };
}

const isResult = (x: unknown): x is ToolResult => typeof x === 'object' && x !== null && 'code' in x;

export const coreTools: ToolDef[] = [
  {
    name: 'open_app',
    description: 'Open an installed app by name (Google Maps, WhatsApp, ChatGPT, Claude, Gemini, Chrome, YouTube, Gmail, Calendar, Drive, Excel, Files, Settings...).',
    args: '{"app": string}',
    async run(a) {
      const name = str(a, 'app');
      if (!name) return err('missing app name');
      if (isBlockedTarget(name)) return { code: 'blocked', detail: name };
      const app = resolveApp(name);
      if (!app) return { code: 'not_found', detail: name };
      if (isBlockedTarget(app.pkg)) return { code: 'blocked', detail: app.label };
      const r = await launchPackage(app.pkg);
      if (r === 'launched') return { code: 'ok', detail: app.label };
      if (r === 'store') return { code: 'not_found', detail: `${app.label} is not installed - opened Play Store` };
      return err(app.label);
    },
  },
  {
    name: 'open_maps',
    description: 'Show a place or start navigation in the maps app.',
    args: '{"query": string}',
    async run(a) {
      const q = str(a, 'query');
      if (!q) return err('missing place');
      return (await openMaps(q)) ? { code: 'ok', detail: q } : err(q);
    },
  },
  {
    name: 'search_web',
    description: 'Search Google in the browser. Results open in the browser; they are not read back.',
    args: '{"query": string}',
    async run(a) {
      const q = str(a, 'query');
      if (!q) return err('missing query');
      return (await openGoogleSearch(q)) ? { code: 'ok', detail: q } : err(q);
    },
  },
  {
    name: 'call_contact',
    description: 'Open the phone dialer with a contact\'s number (the user confirms, then presses call). Use the contact name as spoken.',
    args: '{"name": string}',
    async run(a, ctx) {
      if (!ctx.settings.allowCalls) return { code: 'disabled' };
      const r = await resolveRecipient(a, 'name');
      if (isResult(r)) return r;
      const dial = toDialable(r.number);
      if (!dial) return err('no number');
      if (!(await ctx.confirm(ctx.t('confirm_call', { name: r.name, number: r.number })))) return { code: 'cancelled' };
      await Linking.openURL(`tel:${dial}`); // opens the dialer; the user presses call
      return { code: 'ok', detail: `${r.name} ${r.number}${r.extra ?? ''}` };
    },
  },
  {
    name: 'find_contact',
    description: 'Look up a contact\'s phone number(s) by name.',
    args: '{"name": string}',
    async run(a, ctx) {
      if (!ctx.settings.allowCalls) return { code: 'disabled' };
      const name = str(a, 'name');
      if (!name) return err('missing name');
      const found = await findContacts(name);
      if (found.status === 'denied') return { code: 'denied', detail: 'contacts permission' };
      if (!found.matches.length) return { code: 'not_found', detail: name };
      return { code: 'ok', detail: found.matches.map((m) => `${m.name}: ${m.numbers.join(', ')}`).join('\n') };
    },
  },
  {
    name: 'whatsapp_message',
    description: 'Prepare a WhatsApp message: opens the chat with the text filled in. The user presses send themselves; the assistant never sends it.',
    args: '{"contact": string, "text": string}',
    async run(a, ctx) {
      if (!ctx.settings.allowMessages) return { code: 'disabled' };
      const text = str(a, 'text');
      if (!text) return err('missing message text');
      const r = await resolveRecipient(a, 'contact');
      if (isResult(r)) return r;
      const phone = normalizePhone(r.number, ctx.settings.defaultCountryCode);
      if (!phone) return { code: 'needs_setup', detail: 'Set a default country code in Settings (numbers starting with 0)' };
      if (!(await ctx.confirm(ctx.t('confirm_whatsapp', { name: r.name })))) return { code: 'cancelled' };
      const enc = encodeURIComponent(text);
      const opened = (await openUrl(`whatsapp://send?phone=${phone}&text=${enc}`)) || (await openUrl(`https://wa.me/${phone}?text=${enc}`));
      return opened ? { code: 'ok', detail: `${r.name}: "${text}"` } : err('WhatsApp');
    },
  },
  {
    name: 'find_files',
    description: 'Search files in the folder the user granted. kind is one of excel, pdf, image, document, any. query is optional words from the file name.',
    args: '{"kind": string, "query": string}',
    async run(a, ctx) {
      const root = ctx.settings.filesFolderUri;
      if (!root) return { code: 'needs_setup', detail: 'Choose a folder in Settings > Files' };
      const found = await searchFiles(root, { kind: normalizeKind(a.kind), query: str(a, 'query') });
      if (!found.length) return { code: 'not_found', detail: str(a, 'query') || str(a, 'kind') };
      return { code: 'ok', detail: found.map((f) => f.name).join('\n') };
    },
  },
  {
    name: 'create_folder',
    description: 'Create a folder inside the folder the user granted.',
    args: '{"name": string}',
    async run(a, ctx) {
      const root = ctx.settings.filesFolderUri;
      if (!root) return { code: 'needs_setup', detail: 'Choose a folder in Settings > Files' };
      const name = str(a, 'name');
      if (!name) return err('missing folder name');
      try {
        await createFolder(root, name);
        return { code: 'ok', detail: name };
      } catch (e: any) {
        return err(e?.message);
      }
    },
  },
  {
    name: 'delete_file',
    description: 'Delete ONE file from the granted folder, found by name words. Always asks the user to confirm first.',
    args: '{"query": string, "kind": string}',
    async run(a, ctx) {
      if (!ctx.settings.allowFileDelete) return { code: 'disabled' };
      const root = ctx.settings.filesFolderUri;
      if (!root) return { code: 'needs_setup', detail: 'Choose a folder in Settings > Files' };
      const query = str(a, 'query');
      if (!query) return err('a file name is required');
      const found = await searchFiles(root, { kind: normalizeKind(a.kind), query, maxResults: 5 });
      if (!found.length) return { code: 'not_found', detail: query };
      if (found.length > 1) return err(`Several files match, be more specific:\n${found.map((f) => f.name).join('\n')}`);
      if (!(await ctx.confirm(ctx.t('confirm_delete', { name: found[0].name })))) return { code: 'cancelled' };
      await deleteEntry(found[0].uri);
      return { code: 'ok', detail: found[0].name };
    },
  },
  {
    name: 'open_settings',
    description: 'Open an Android settings screen: wifi, bluetooth, location, airplane, sound, display, battery, apps, main. (Cannot flip switches itself.)',
    args: '{"page": string}',
    async run(a) {
      const page = normalizeSettingsPage(a.page);
      return (await openSystemSettings(page)) ? { code: 'ok', detail: page } : err(page);
    },
  },
  {
    name: 'device_info',
    description: 'Report phone model, Android version, battery level and connectivity.',
    args: '{}',
    async run() {
      return { code: 'ok', detail: await getDeviceSummary() };
    },
  },
  {
    name: 'set_reminder',
    description: 'Schedule a reminder notification. "when" is ISO 8601 local time with offset, in the future.',
    args: '{"title": string, "when": string}',
    async run(a) {
      const title = str(a, 'title') || 'Reminder';
      const when = new Date(str(a, 'when'));
      if (Number.isNaN(when.getTime())) return err('invalid time');
      const r = await scheduleReminder(title, when);
      if (r === 'ok') return { code: 'ok', detail: `${title} - ${when.toLocaleString()}` };
      if (r === 'denied') return { code: 'denied', detail: 'notification permission' };
      if (r === 'past') return err('that time is in the past');
      return err();
    },
  },
  {
    name: 'add_task',
    description: 'Add a to-do task.',
    args: '{"title": string}',
    async run(a) {
      const title = str(a, 'title');
      if (!title) return err('missing title');
      useProductivity.getState().addTask(title);
      return { code: 'ok', detail: title };
    },
  },
  {
    name: 'list_tasks',
    description: 'List the open to-do tasks.',
    args: '{}',
    async run() {
      const open = useProductivity.getState().tasks.filter((t) => !t.done);
      if (!open.length) return { code: 'not_found', detail: 'no open tasks' };
      return { code: 'ok', detail: open.map((t) => `- ${t.title}`).join('\n') };
    },
  },
  {
    name: 'add_note',
    description: 'Save a note.',
    args: '{"text": string}',
    async run(a) {
      const text = str(a, 'text');
      if (!text) return err('missing note');
      useProductivity.getState().addNote(text);
      return { code: 'ok', detail: text };
    },
  },
  {
    name: 'daily_plan',
    description: 'Summarise today: reminders, overdue tasks and open tasks.',
    args: '{}',
    async run(_a, ctx) {
      const p = useProductivity.getState();
      const lines = formatDailyPlan(buildDailyPlan(p.tasks, p.reminders, ctx.now));
      return lines.length ? { code: 'ok', detail: lines.join('\n') } : { code: 'not_found', detail: 'nothing planned' };
    },
  },
  {
    name: 'remember',
    description: 'Save a fact the user asked you to remember (the user confirms first).',
    args: '{"fact": string}',
    async run(a, ctx) {
      if (!ctx.settings.memoryEnabled) return { code: 'disabled' };
      const fact = str(a, 'fact');
      if (!fact) return err('nothing to remember');
      if (!(await ctx.confirm(ctx.t('confirm_memory', { text: fact })))) return { code: 'cancelled' };
      useMemory.getState().add(fact);
      return { code: 'ok', detail: fact };
    },
  },
  {
    name: 'ask_ai',
    description: 'Send a request to another AI service (chatgpt, claude or gemini) and show its answer. Uses that service\'s API key if saved, otherwise copies the prompt and opens the app.',
    args: '{"service": "chatgpt"|"claude"|"gemini", "prompt": string}',
    async run(a) {
      const service = normalizeService(a.service);
      const prompt = str(a, 'prompt');
      if (!service) return { code: 'unsupported', detail: str(a, 'service') };
      if (!prompt) return err('missing prompt');
      try {
        const r = await askExternalAI(service, prompt);
        return r.via === 'api'
          ? { code: 'ok', detail: SERVICE_LABEL[service], output: r.text }
          : { code: 'ok', detail: r.text };
      } catch (e: any) {
        return err(e?.message);
      }
    },
  },
];
