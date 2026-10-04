"use client";

// 검색 결과로 이동할 때 쓰는 함수. 미등록 장소면 임시 주황 핀을 하나만 띄운다.
import { useCallback, useRef } from "react";
import type { KakaoMap } from "@/lib/kakao/sdk";
import type { SearchResult } from "@/lib/search/rankResults";
import { searchPinElement } from "@/lib/kakao/overlays";

const ZOOM_LEVEL_ON_SELECT = 3;

export function useSearchPin(map: KakaoMap | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pinRef = useRef<any>(null);

  return useCallback(
    (result: SearchResult) => {
      if (!map) return;
      const { maps } = window.kakao;
      const position = new maps.LatLng(result.lat, result.lng);

      pinRef.current?.setMap(null);
      pinRef.current =
        result.reviewCount === null
          ? new maps.CustomOverlay({ map, position, content: searchPinElement(result.name), yAnchor: 1, zIndex: 2 })
          : null; // 등록 장소는 이미 핀이 있음

      map.setLevel(ZOOM_LEVEL_ON_SELECT);
      map.panTo(position);
    },
    [map],
  );
}
