import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { dismissToast, subscribeToasts, type Toast } from './toasts';

export function ToastStack() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => subscribeToasts(setToasts), []);

  if (typeof document === 'undefined') return null;
  if (toasts.length === 0) return null;

  const stack = (
    <div className="toast-stack" aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          className={`toast toast-${toast.tone}`}
          onClick={() => dismissToast(toast.id)}
        >
          <span>{toast.message}</span>
          <small>tap to dismiss</small>
        </button>
      ))}
    </div>
  );

  return createPortal(stack, document.body);
}
