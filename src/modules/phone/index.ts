/**
 * Phone Automation Engine (Phase 3).
 *
 * Apps, contacts, dialer, WhatsApp drafts, settings screens and device info are
 * implemented in the sibling files; commands/tools.ts wires them to the assistant.
 * Every outbound or destructive action goes through askConfirm() first.
 * Nothing here bypasses Android permissions.
 */
export interface PhoneAction {
  id: string;
  describe(): string;
  /** true = must ask the user before running */
  needsConfirmation: boolean;
  run(): Promise<void>;
}

export * from './apps';
export * from './numbers';
export * from './launcher';
export * from './contacts';
export * from './systemSettings';
export * from './deviceInfo';
