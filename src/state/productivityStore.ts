import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Task } from '../modules/productivity';

export interface Note {
  id: string;
  text: string;
  createdAt: number;
}

export interface Reminder {
  id: string;
  title: string;
  /** epoch ms */
  when: number;
  /** id returned by expo-notifications, used to cancel */
  notificationId: string;
}

export const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

interface ProductivityState {
  tasks: Task[];
  notes: Note[];
  reminders: Reminder[];
  addTask: (title: string, dueAt?: number) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  addNote: (text: string) => void;
  removeNote: (id: string) => void;
  addReminder: (r: Reminder) => void;
  removeReminder: (id: string) => void;
}

export const useProductivity = create<ProductivityState>()(
  persist(
    (set) => ({
      tasks: [],
      notes: [],
      reminders: [],
      addTask: (title, dueAt) => set((s) => ({ tasks: [...s.tasks, { id: newId(), title: title.trim(), dueAt, done: false }] })),
      toggleTask: (id) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      addNote: (text) => set((s) => ({ notes: [{ id: newId(), text: text.trim(), createdAt: Date.now() }, ...s.notes] })),
      removeNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
      addReminder: (r) => set((s) => ({ reminders: [...s.reminders, r].sort((a, b) => a.when - b.when) })),
      removeReminder: (id) => set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),
    }),
    { name: 'mera-dost-productivity', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
