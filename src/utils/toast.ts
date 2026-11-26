/**
 * Tiny toast event bus. Lives outside Redux because toasts may carry callbacks
 * (e.g. "Undo") which must not be stored in serialisable state.
 */
export type ToastKind = 'default' | 'success' | 'error' | 'info';

export interface ToastOptions {
  message: string;
  kind?: ToastKind;
  duration?: number;
  action?: { label: string; onPress: () => void };
}

type Listener = (t: ToastOptions & { id: number }) => void;
const listeners = new Set<Listener>();
let counter = 0;

export const toast = {
  show(opts: ToastOptions | string) {
    const o = typeof opts === 'string' ? { message: opts } : opts;
    counter += 1;
    listeners.forEach(l => l({ ...o, id: counter }));
  },
  success(message: string, action?: ToastOptions['action']) {
    toast.show({ message, kind: 'success', action });
  },
  error(message: string) {
    toast.show({ message, kind: 'error' });
  },
  info(message: string) {
    toast.show({ message, kind: 'info' });
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};
