import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** User-approved memory: facts are only added after the user confirms (see the `remember` tool). */
export interface MemoryItem {
  id: string;
  text: string;
  createdAt: number;
}

interface MemoryState {
  items: MemoryItem[];
  add: (text: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const MAX_ITEMS = 50;

export const useMemory = create<MemoryState>()(
  persist(
    (set) => ({
      items: [],
      add: (text) =>
        set((s) => ({
          items: [...s.items, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text: text.trim(), createdAt: Date.now() }].slice(-MAX_ITEMS),
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'mera-dost-memory', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
