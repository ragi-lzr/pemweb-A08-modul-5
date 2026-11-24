
import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export function useLocalStorage<T>(
  key: string,
  initial: T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const savedValue = localStorage.getItem(key);

      if (savedValue !== null) {
        return JSON.parse(savedValue) as T;
      }
    } catch {
      // Jika data gagal dibaca, gunakan nilai awal.
    }

    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Jika penyimpanan gagal, state React tetap berjalan.
    }
  }, [key, value]);

  return [value, setValue];
}
