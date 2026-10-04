"use client";

// 미등록 장소(검색 결과·지도에서 누른 가게)에 임시 주황 핀을 하나만 띄운다. 핀을 누르면 onSelect.
// null을 넘기거나 등록 장소를 넘기면 임시 핀을 지운다 (등록 장소는 이미 핀이 있음).
import { useCallback, useEffect, useRef } from "react";
import type { KakaoMap } from "@/lib/kakao/sdk";
import type { PlaceSummary } from "@/types/place";
import { searchPinElement } from "@/lib/kakao/overlays";

export function useSearchPin(map: KakaoMap | null, onSelect: (place: PlaceSummary) => void) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pinRef = useRef<any>(null);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  return useCallback(
    (place: PlaceSummary | null) => {
      pinRef.current?.setMap(null);
      pinRef.current = null;
      if (!map || !place || place.reviewCount !== null) return;

      const { maps } = window.kakao;
      const content = searchPinElement(place.name);
      content.addEventListener("click", () => onSelectRef.current(place));
      pinRef.current = new maps.CustomOverlay({
        map,
        position: new maps.LatLng(place.lat, place.lng),
        content,
        yAnchor: 1,
        zIndex: 2,
        clickable: true,
      });
    },
    [map],
  );
}
