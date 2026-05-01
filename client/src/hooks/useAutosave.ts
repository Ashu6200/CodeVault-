import { useCallback, useRef } from 'react';
import debounce from 'lodash/debounce';

export function useAutosave(
  saveFn: (content: any) => Promise<any>,
  delay: number = 1000
) {
  const saveRef = useRef(saveFn);
  saveRef.current = saveFn;

  const debouncedSave = useCallback(
    debounce((content: any) => {
      saveRef.current(content);
    }, delay),
    [delay]
  );

  return debouncedSave;
}
