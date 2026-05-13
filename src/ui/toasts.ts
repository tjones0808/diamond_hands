/**
 * Lightweight toast queue. The reducer doesn't own toasts (transient UI noise shouldn't
 * pollute game state) — instead any code can push() and the <ToastStack> subscribes.
 */

export type ToastTone = 'info' | 'success' | 'warn' | 'danger';

export interface Toast {
  id: string;
  message: string;
  tone: ToastTone;
  createdAt: number;
  ttlMs: number;
}

type Listener = (toasts: Toast[]) => void;

const listeners = new Set<Listener>();
let toasts: Toast[] = [];
let nextId = 0;

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  listener(toasts);
  return () => {
    listeners.delete(listener);
  };
}

export function pushToast(message: string, tone: ToastTone = 'info', ttlMs = 4000): void {
  const toast: Toast = {
    id: `t${++nextId}`,
    message,
    tone,
    createdAt: Date.now(),
    ttlMs
  };
  toasts = [...toasts, toast];
  emit();
  setTimeout(() => dismissToast(toast.id), ttlMs);
}

export function dismissToast(id: string): void {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function emit() {
  for (const l of listeners) l(toasts);
}
