"use client";

// 지금 보이는 지도 중심의 동 이름. 지도를 옮길 때마다 갱신 (늦게 온 이전 응답은 버림).
import { useEffect, useState } from "react";
import type { Bounds } from "./useMapBounds";
import { regionNameAt } from "@/lib/kakao/region";

export function useRegionName(bounds: Bounds | null): string | null {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!bounds) return;
    let stale = false;
    regionNameAt((bounds.south + bounds.north) / 2, (bounds.west + bounds.east) / 2).then((n) => {
      if (!stale) setName(n);
    });
    return () => {
      stale = true;
    };
  }, [bounds]);

  return name;
}
