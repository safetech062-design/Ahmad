import { create } from 'zustand';

/**
 * Confirmation gate. Any action that calls, messages, deletes or saves memory
 * must `await askConfirm(...)`. The <ConfirmModal/> mounted in App.tsx shows
 * the question; the action only continues if the user taps Yes.
 */
interface Pending {
  message: string;
  resolve: (ok: boolean) => void;
}

export const useConfirm = create<{ pending: Pending | null }>(() => ({ pending: null }));

export function askConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const prev = useConfirm.getState().pending;
    if (prev) prev.resolve(false);
    useConfirm.setState({ pending: { message, resolve } });
  });
}

export function answerConfirm(ok: boolean): void {
  const p = useConfirm.getState().pending;
  if (!p) return;
  useConfirm.setState({ pending: null });
  p.resolve(ok);
}
