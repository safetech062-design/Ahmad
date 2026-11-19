import React, { createContext, useContext } from 'react';
import { useVoiceAssistant } from './useVoiceAssistant';

type VoiceValue = ReturnType<typeof useVoiceAssistant>;

const VoiceContext = createContext<VoiceValue | null>(null);

/** One shared voice state so Home and Chat always agree on the status. */
export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const value = useVoiceAssistant();
  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}

export function useVoice(): VoiceValue {
  const v = useContext(VoiceContext);
  if (!v) throw new Error('useVoice must be used inside <VoiceProvider>');
  return v;
}
