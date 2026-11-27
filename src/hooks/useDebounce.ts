import { useEffect, useState } from 'react';

/**
 * Mengembalikan `value` yang baru ter-update setelah `delay` ms tanpa perubahan.
 * Analogi: lift yang menunggu orang berhenti masuk dulu, baru jalan.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebounced(value), delay);

    // Cleanup: setiap value berubah sebelum delay habis, timer lama dibatalkan.
    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debounced;
}
