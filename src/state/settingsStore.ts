import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { PROVIDERS } from '../modules/ai';
import type { ProviderId } from '../modules/ai/types';
import type { LanguageCode } from '../modules/language/translations';

interface SettingsState {
  language: LanguageCode;
  provider: ProviderId;
  /** per-provider model override; empty string = provider default */
  models: Record<ProviderId, string>;
  speakReplies: boolean;
  micEnabled: boolean;
  /** Phase 2/3 */
  autoDetectLanguage: boolean;
  allowCalls: boolean;
  allowMessages: boolean;
  allowFileDelete: boolean;
  memoryEnabled: boolean;
  /** digits only, e.g. 92; used to turn 03xx numbers into international form for WhatsApp */
  defaultCountryCode: string;
  /** Storage Access Framework tree URI the user granted for file search */
  filesFolderUri: string | null;
  update: (patch: Partial<Omit<SettingsState, 'update'>>) => void;
  setLanguage: (l: LanguageCode) => void;
  setProvider: (p: ProviderId) => void;
  setModel: (p: ProviderId, m: string) => void;
  setSpeakReplies: (v: boolean) => void;
  setMicEnabled: (v: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      provider: 'claude',
      models: {
        openai: PROVIDERS.openai.defaultModel,
        claude: PROVIDERS.claude.defaultModel,
        gemini: PROVIDERS.gemini.defaultModel,
      },
      speakReplies: true,
      micEnabled: true,
      autoDetectLanguage: true,
      allowCalls: true,
      allowMessages: true,
      allowFileDelete: false,
      memoryEnabled: true,
      defaultCountryCode: '',
      filesFolderUri: null,
      update: (patch) => set(patch),
      setLanguage: (language) => set({ language }),
      setProvider: (provider) => set({ provider }),
      setModel: (p, m) => set((s) => ({ models: { ...s.models, [p]: m } })),
      setSpeakReplies: (speakReplies) => set({ speakReplies }),
      setMicEnabled: (micEnabled) => set({ micEnabled }),
    }),
    { name: 'mera-dost-settings', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
