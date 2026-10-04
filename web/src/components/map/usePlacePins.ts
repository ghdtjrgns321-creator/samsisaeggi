"use client";

// 리뷰 있는 등록 장소를 핀으로 올린다 (어떤 곳을 올릴지는 MapHome이 고름). 핀을 누르면 onSelect.
// namedIds에 든 곳만 이름까지, 나머지는 별점만 보여준다.
import { useEffect, useRef } from "react";
import type { Place } from "@/types/place";
import type { KakaoMap } from "@/lib/kakao/sdk";
import { placePinElement } from "@/lib/kakao/overlays";

export function usePlacePins(
  map: KakaoMap | null,
  places: Place[],
  namedIds: Set<string>,
  onSelect: (place: Place) => void,
) {
  // 렌더마다 바뀌는 콜백 때문에 핀을 다시 그리지 않도록 최신 값만 ref로 참조
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!map) return;
    const { maps } = window.kakao;

    const overlays = places.map((place) => {
      const named = namedIds.has(place.id);
      const content = placePinElement(place, named);
      content.addEventListener("click", () => onSelectRef.current(place));
      return new maps.CustomOverlay({
        map,
        position: new maps.LatLng(place.lat, place.lng),
        content,
        yAnchor: 1,
        zIndex: named ? 3 : 2, // 이름 핀 > 별점 핀 > 검색 결과 핀(말풍선 1, 점 0)
        clickable: true, // 핀 클릭이 지도 클릭으로 번지지 않게
      });
    });

    return () => overlays.forEach((o) => o.setMap(null));
  }, [map, places, namedIds]);
}
