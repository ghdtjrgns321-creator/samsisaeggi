"use client";

// 지금 지도에 보이는 범위. 지도를 옮기거나 확대·축소를 마칠 때마다 갱신.
import { useEffect, useState } from "react";
import type { KakaoMap } from "@/lib/kakao/sdk";

export type Bounds = { south: number; west: number; north: number; east: number };

export function useMapBounds(map: KakaoMap | null): Bounds | null {
  const [bounds, setBounds] = useState<Bounds | null>(null);

  useEffect(() => {
    if (!map) return;
    const { event } = window.kakao.maps;
    const update = () => {
      const b = map.getBounds();
      const sw = b.getSouthWest();
      const ne = b.getNorthEast();
      setBounds({ south: sw.getLat(), west: sw.getLng(), north: ne.getLat(), east: ne.getLng() });
    };
    update();
    event.addListener(map, "idle", update);
    return () => event.removeListener(map, "idle", update);
  }, [map]);

  return bounds;
}

export function isInBounds(b: Bounds, lat: number, lng: number): boolean {
  return lat >= b.south && lat <= b.north && lng >= b.west && lng <= b.east;
}

/** 아래쪽 insetPx만큼(목록 시트에 가려진 부분)을 뺀 범위. 화면 높이를 모르면 그대로 */
export function trimBottom(b: Bounds, insetPx: number, heightPx: number): Bounds {
  if (heightPx <= insetPx) return b;
  return { ...b, south: b.south + ((b.north - b.south) * insetPx) / heightPx };
}
