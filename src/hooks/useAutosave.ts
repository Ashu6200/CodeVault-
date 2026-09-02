import { useCallback, useEffect, useRef } from 'react';
import debounce from 'lodash/debounce';

type Debounced<T> = ReturnType<typeof debounce<(content: T) => void>>;

/**
 * Debounces a save callback.
 *
 * The latest callback lives in a ref so that changing it does not tear down a
 * pending save, and the debounced function is built inside an effect (and
 * cancelled on unmount) so nothing fires after the component goes away — the
 * previous implementation leaked a pending save across navigation.
 */
export function useAutosave<T>(
  saveFn: (content: T) => void | Promise<unknown>,
  delay: number = 1000,
) {
  const saveRef = useRef(saveFn);
  const debouncedRef = useRef<Debounced<T> | null>(null);

  useEffect(() => {
    saveRef.current = saveFn;
  }, [saveFn]);

  useEffect(() => {
    const debounced = debounce((content: T) => {
      void saveRef.current(content);
    }, delay);

    debouncedRef.current = debounced;

    return () => {
      debounced.cancel();
      debouncedRef.current = null;
    };
  }, [delay]);

  return useCallback((content: T) => {
    debouncedRef.current?.(content);
  }, []);
}
