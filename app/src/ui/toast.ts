// Toast helper — pure-JS implementation via react-native-toast-message
// so it works in Expo Go without a native rebuild. The provider that
// renders the toasts (<Toast />) lives at the root of the app.

import Toast from 'react-native-toast-message';

export type ToastSeverity = 'success' | 'error' | 'info';

export interface ToastOptions {
  message?: string;
  duration?: number;
}

function show(severity: ToastSeverity, title: string, opts: ToastOptions = {}) {
  Toast.show({
    type: severity,
    text1: title,
    text2: opts.message,
    visibilityTime: (opts.duration ?? 3) * 1000,
  });
}

export const toast = {
  success(title: string, opts?: ToastOptions) { show('success', title, opts); },
  error(title: string, opts?: ToastOptions)   { show('error', title, opts); },
  info(title: string, opts?: ToastOptions)    { show('info', title, opts); },
};
