"use client";

// 값이 delay(ms) 동안 바뀌지 않을 때만 갱신. 글자마다 검색 요청이 나가지 않게 한다.
import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
