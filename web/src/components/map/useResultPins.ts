"use client";

// 엔터 검색 결과(리뷰 없는 장소)를 흰 말풍선 핀으로 그린다. 핀을 누르면 onSelect.
// 화면에서 겹치는 말풍선은 우선순위(results 순서)가 낮은 쪽을 숨기고, 지도를 움직일 때마다 다시 계산한다.
// 등록 장소 핀은 항상 보이므로 자리만 차지하는 장애물로 취급한다.
import { useEffect, useRef } from "react";
import type { Place } from "@/data/places";
import type { PlaceSummary } from "@/types/place";
import type { KakaoMap } from "@/lib/kakao/sdk";
import { placePinLabel, resultPinElement } from "@/lib/kakao/overlays";
import { labelBox, pickVisible } from "@/lib/map/labelLayout";

export function useResultPins(
  map: KakaoMap | null,
  results: PlaceSummary[],
  registered: Place[],
  onSelect: (place: PlaceSummary) => void,
) {
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!map || results.length === 0) return;
    const { maps } = window.kakao;

    const pins = results.map((place) => {
      const content = resultPinElement(place.name);
      content.addEventListener("click", () => onSelectRef.current(place));
      const overlay = new maps.CustomOverlay({
        map,
        position: new maps.LatLng(place.lat, place.lng),
        content,
        yAnchor: 1,
        zIndex: 0, // 등록 장소 핀보다 아래
        clickable: true,
      });
      return { place, content, overlay };
    });

    const layout = () => {
      const projection = map.getProjection();
      const toBox = (text: string, lat: number, lng: number) => {
        const pt = projection.containerPointFromCoords(new maps.LatLng(lat, lng));
        return labelBox(text, pt.x, pt.y);
      };
      const fixed = registered.map((p) => toBox(placePinLabel(p), p.lat, p.lng));
      const visible = pickVisible(
        pins.map(({ place }) => toBox(place.name, place.lat, place.lng)),
        fixed,
      );
      pins.forEach(({ content }, i) => {
        content.style.display = visible.has(i) ? "" : "none";
      });
    };

    layout();
    maps.event.addListener(map, "idle", layout);
    return () => {
      maps.event.removeListener(map, "idle", layout);
      pins.forEach(({ overlay }) => overlay.setMap(null));
    };
  }, [map, results, registered]);
}
