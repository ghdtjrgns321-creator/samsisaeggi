"use client";

// 요소의 현재 높이(px)를 추적한다. 내용이 바뀌어 높이가 달라지면 자동 갱신.
import { useEffect, useState, type RefObject } from "react";

export function useElementHeight(ref: RefObject<HTMLElement | null>): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry.borderBoxSize[0].blockSize));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return height;
}
