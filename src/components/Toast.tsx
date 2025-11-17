// Toast Component - using sonner for toast notifications

import { toast as sonnerToast } from 'sonner';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export function toast(options: ToastOptions | string) {
  if (typeof options === 'string') {
    sonnerToast(options);
    return;
  }

  const { type = 'info', title, message, duration = 3000 } = options;

  const content = title ? `${title}: ${message}` : message;

  switch (type) {
    case 'success':
      sonnerToast.success(content, { duration });
      break;
    case 'error':
      sonnerToast.error(content, { duration });
      break;
    case 'warning':
      sonnerToast.warning(content, { duration });
      break;
    case 'info':
    default:
      sonnerToast.info(content, { duration });
      break;
  }
}

// Convenience methods
export const toastSuccess = (message: string, duration?: number) => {
  toast({ type: 'success', message, duration });
};

export const toastError = (message: string, duration?: number) => {
  toast({ type: 'error', message, duration });
};

export const toastWarning = (message: string, duration?: number) => {
  toast({ type: 'warning', message, duration });
};

export const toastInfo = (message: string, duration?: number) => {
  toast({ type: 'info', message, duration });
};
