"use client";

// 삼시세끼 등록 장소들을 지도에 핀으로 올린다. 핀을 누르면 onSelect.
import { useEffect, useRef } from "react";
import type { Place } from "@/data/places";
import type { KakaoMap } from "@/lib/kakao/sdk";
import { placePinElement } from "@/lib/kakao/overlays";

export function usePlacePins(map: KakaoMap | null, places: Place[], onSelect: (place: Place) => void) {
  // 렌더마다 바뀌는 콜백 때문에 핀을 다시 그리지 않도록 최신 값만 ref로 참조
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!map) return;
    const { maps } = window.kakao;

    const overlays = places.map((place) => {
      const content = placePinElement(place);
      content.addEventListener("click", () => onSelectRef.current(place));
      return new maps.CustomOverlay({
        map,
        position: new maps.LatLng(place.lat, place.lng),
        content,
        yAnchor: 1,
        zIndex: 1, // 검색 결과 핀보다 위
        clickable: true, // 핀 클릭이 지도 클릭으로 번지지 않게
      });
    });

    return () => overlays.forEach((o) => o.setMap(null));
  }, [map, places]);
}
