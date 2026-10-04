"use client";

// 지도를 누르면: 일단 onMiss(카드·목록 닫기) → 근처 장소가 1곳이면 onPick, 여러 곳이면 onCandidates.
// 빠르게 여러 번 누르면 마지막으로 누른 곳의 결과만 반영한다.
import { useRef } from "react";
import type { Place, PlaceSummary } from "@/types/place";
import type { KakaoMap } from "@/lib/kakao/sdk";
import { findPlacesAt } from "@/lib/kakao/nearbyPlace";
import { withReviewCount } from "@/lib/search/rankResults";
import { useMapClick } from "./useMapClick";

type Handlers = {
  onPick: (place: PlaceSummary) => void;
  onCandidates: (places: PlaceSummary[]) => void;
  onMiss: () => void;
};

export function useTapToPick(map: KakaoMap | null, registered: Place[], { onPick, onCandidates, onMiss }: Handlers) {
  const tapIdRef = useRef(0);

  useMapClick(map, async (lat, lng) => {
    onMiss();
    if (!map) return;
    const tapId = ++tapIdRef.current;
    try {
      const found = (await findPlacesAt(map, lat, lng)).map((p) => withReviewCount(p, registered));
      if (tapId !== tapIdRef.current || found.length === 0) return;
      if (found.length === 1) onPick(found[0]);
      else onCandidates(found);
    } catch {
      // 주변 검색 실패 시 닫힌 상태로 둔다
    }
  });
}
