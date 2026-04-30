// Toast helper — single import surface for the app's user-facing
// notifications. Wraps `burnt` so we can swap libs without touching
// callers.

import * as Burnt from 'burnt';

export type ToastSeverity = 'success' | 'error' | 'info';

export interface ToastOptions {
  message?: string;
  duration?: number;
}

function toastWith(severity: ToastSeverity, title: string, opts: ToastOptions = {}) {
  Burnt.toast({
    title,
    message: opts.message,
    preset: severity === 'success' ? 'done' : severity === 'error' ? 'error' : 'none',
    duration: opts.duration ?? 3,
  });
}

export const toast = {
  success(title: string, opts?: ToastOptions) {
    toastWith('success', title, opts);
  },
  error(title: string, opts?: ToastOptions) {
    toastWith('error', title, opts);
  },
  info(title: string, opts?: ToastOptions) {
    toastWith('info', title, opts);
  },
};
