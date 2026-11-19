/**
 * Honest feature matrix shown in Settings > "What works today".
 * 'built' means the code is written and its logic is unit-tested; it has NOT
 * been verified on a physical device yet - that is the first thing to do after install.
 */
export type FeatureStatus = 'built' | 'experimental' | 'planned' | 'blocked';

export interface FeatureRow {
  name: string;
  status: FeatureStatus;
  note: string;
}

export const FEATURES: FeatureRow[] = [
  { name: 'Voice input (speech-to-text)', status: 'experimental', note: 'Uses the phone\'s Google speech engine. Urdu/Arabic usually work; Pashto often not available.' },
  { name: 'Spoken replies (text-to-speech)', status: 'experimental', note: 'Needs a voice installed for the language.' },
  { name: '4-language UI, RTL, auto language detection', status: 'built', note: 'Detection is script-based (Roman Urdu counts as English).' },
  { name: 'AI chat: OpenAI, Claude, Gemini', status: 'built', note: 'Needs your own API key.' },
  { name: 'Command understanding + multi-step plans', status: 'built', note: 'Offline parser for common commands, AI planner for the rest.' },
  { name: 'Open apps', status: 'built', note: 'Only apps in the built-in catalog.' },
  { name: 'Contacts + phone calls', status: 'built', note: 'Opens the dialer after you confirm; you press call.' },
  { name: 'WhatsApp message drafts', status: 'built', note: 'Opens the chat with text filled in; you press send.' },
  { name: 'Read WhatsApp/other messages', status: 'blocked', note: 'Android and WhatsApp do not allow this for normal apps.' },
  { name: 'File search, create folder, delete', status: 'built', note: 'Only inside the folder you choose. Delete always asks first.' },
  { name: 'Rename / organize files', status: 'planned', note: 'Needs a small native module.' },
  { name: 'Wi-Fi / Bluetooth settings', status: 'built', note: 'Opens the screen; Android does not allow silent toggling.' },
  { name: 'Reminders, tasks, notes, daily plan', status: 'built', note: 'Reminders may be delayed if battery optimization is on for this app.' },
  { name: 'Ask ChatGPT / Claude / Gemini', status: 'built', note: 'Via API key, or copy-and-open-app hand-off.' },
  { name: 'Google search', status: 'built', note: 'Opens the browser; results are not read back.' },
  { name: 'Calendar integration, report generation', status: 'planned', note: 'Interfaces only.' },
  { name: 'Wake word / hands-free / background listening', status: 'planned', note: 'Phase 4. Not possible in Expo alone on Android 13.' },
  { name: 'QA/QC module (NCR, WIR, MIR, dashboards)', status: 'planned', note: 'Phase 5. Architecture hooks only.' },
];
