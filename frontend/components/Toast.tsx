'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        className: 'dark:bg-gray-800 dark:text-white dark:border-gray-700',
        duration: 4000,
      }}
    />
  );
}
