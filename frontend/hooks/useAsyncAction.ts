import { useState, useCallback } from 'react';
import { toast } from '@/lib/toast';

interface UseAsyncActionOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
}

export function useAsyncAction<T = void, Args extends any[] = []>(
  action: (...args: Args) => Promise<T>,
  options: UseAsyncActionOptions<T> = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (...args: Args) => {
      setIsLoading(true);
      setError(null);

      let toastId: string | number | undefined;
      if (options.loadingMessage) {
        toastId = toast.loading(options.loadingMessage);
      }

      try {
        const result = await action(...args);
        setData(result);

        if (options.successMessage) {
          toast.success(options.successMessage);
        }

        if (options.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred');
        setError(error);

        if (options.errorMessage) {
          toast.error(options.errorMessage, error.message);
        } else {
          toast.error('Action failed', error.message);
        }

        if (options.onError) {
          options.onError(error);
        }

        throw error;
      } finally {
        setIsLoading(false);
        // Dismiss loading toast if it exists
        if (toastId !== undefined) {
          // sonner automatically dismisses loading toasts when success/error is shown
        }
      }
    },
    [action, options]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    isLoading,
    error,
    data,
    reset,
  };
}
