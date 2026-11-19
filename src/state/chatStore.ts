import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'error' | 'action';
  text: string;
  createdAt: number;
}

interface ChatState {
  messages: Message[];
  add: (role: Message['role'], text: string) => void;
  clear: () => void;
}

const MAX_STORED = 200;

export const useChat = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      add: (role, text) =>
        set((s) => ({
          messages: [
            ...s.messages,
            { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, role, text, createdAt: Date.now() },
          ].slice(-MAX_STORED),
        })),
      clear: () => set({ messages: [] }),
    }),
    { name: 'mera-dost-chat', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
