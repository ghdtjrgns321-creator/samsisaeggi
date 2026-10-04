"use client";

// 지금 보이는 지도 중심의 지역 이름. 동 여러 개가 들어올 만큼 축소하면 구 이름으로.
// 지도를 옮길 때마다 갱신 (늦게 온 이전 응답은 버림).
import { useEffect, useState } from "react";
import type { KakaoMap } from "@/lib/kakao/sdk";
import type { Bounds } from "./useMapBounds";
import { regionNameAt } from "@/lib/kakao/region";

const GU_LEVEL = 6; // 이 확대 레벨 이상(더 축소)이면 구 이름. 기본 화면은 4

export function useRegionName(map: KakaoMap | null, bounds: Bounds | null): string | null {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!map || !bounds) return;
    let stale = false;
    const depth = map.getLevel() >= GU_LEVEL ? "gu" : "dong";
    regionNameAt((bounds.south + bounds.north) / 2, (bounds.west + bounds.east) / 2, depth).then((n) => {
      if (!stale) setName(n);
    });
    return () => {
      stale = true;
    };
  }, [map, bounds]);

  return name;
}
