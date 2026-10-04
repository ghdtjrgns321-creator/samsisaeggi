"use client";

// 엔터 검색·둘러보기 결과(리뷰 없는 장소)를 흰 말풍선 핀으로 그린다. 핀을 누르면 onSelect.
// 지도가 복잡해지지 않게 보이는 화면 안에서 우선순위(results 순서)가 높은 MAX_RESULT_PINS곳만 보이고,
// 겹치는 말풍선은 숨긴다. 지도를 움직일 때마다 다시 고른다.
// 등록 장소 핀은 항상 보이므로 자리만 차지하는 장애물로 취급한다.
import { useEffect, useRef } from "react";
import type { Place, PlaceSummary } from "@/types/place";
import type { KakaoMap } from "@/lib/kakao/sdk";
import { placePinLabel, resultPinElement } from "@/lib/kakao/overlays";
import { BADGE_EXTRA_PX, labelBox, pickVisible } from "@/lib/map/labelLayout";

const MAX_RESULT_PINS = 5;

export function useResultPins(
  map: KakaoMap | null,
  results: PlaceSummary[],
  registered: Place[],
  namedIds: Set<string>,
  onSelect: (place: PlaceSummary) => void,
  topCoverPx: number, // 위 검색창·칩에 가려진 높이
  bottomCoverPx: number, // 아래 시트에 가려진 높이 — 가려진 곳의 말풍선은 화면 밖으로 친다
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
        zIndex: 1, // 등록 장소 핀보다 아래
        clickable: true,
      });
      return { place, content, overlay };
    });

    const layout = () => {
      const projection = map.getProjection();
      const toPoint = (lat: number, lng: number) => projection.containerPointFromCoords(new maps.LatLng(lat, lng));
      const b = map.getBounds();
      const width = toPoint(b.getNorthEast().getLat(), b.getNorthEast().getLng()).x;
      const bottom = toPoint(b.getSouthWest().getLat(), b.getSouthWest().getLng()).y - bottomCoverPx;
      const fixed = registered.map((p) => {
        const pt = toPoint(p.lat, p.lng);
        return labelBox(placePinLabel(p, namedIds.has(p.id)), pt.x, pt.y, BADGE_EXTRA_PX);
      });
      const candidates = pins.map(({ place }) => {
        const pt = toPoint(place.lat, place.lng);
        // 말풍선 전체가 가려지지 않은 지도 안에 들어와야 후보 (가려진 곳이 5자리를 차지하지 않게)
        const box = labelBox(place.name, pt.x, pt.y);
        const inView = box.left >= 0 && box.right <= width && box.top >= topCoverPx && pt.y <= bottom;
        return inView ? box : null;
      });
      const visible = pickVisible(candidates, fixed, MAX_RESULT_PINS);
      pins.forEach(({ content }, i) => content.classList.toggle("is-hidden", !visible.has(i)));
    };

    layout();
    maps.event.addListener(map, "idle", layout);
    return () => {
      maps.event.removeListener(map, "idle", layout);
      pins.forEach(({ overlay }) => overlay.setMap(null));
    };
  }, [map, results, registered, namedIds, topCoverPx, bottomCoverPx]);
}
