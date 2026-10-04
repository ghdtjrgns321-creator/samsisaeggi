"use client";

// 엔터 검색: 지금 화면 안에서 keyword를 찾고, 지도를 옮기거나 확대할 때마다 새 화면에서 다시 찾아 결과를 보탠다.
// (Kakao는 한 번에 45곳까지만 주므로, 확대한 좁은 지역에서 다시 찾아야 덜 알려진 곳도 나온다)
// 결과 순서 = 먼저 찾은 것 우선, 같은 검색 안에서는 Kakao 정확도 순 → 말풍선 우선순위로 쓰인다.
// 리뷰 있는 등록 장소는 이미 핀이 있으므로 결과에서 뺀다.
import { useEffect, useRef, useState } from "react";
import type { Place } from "@/data/places";
import type { PlaceSummary } from "@/types/place";
import type { KakaoMap } from "@/lib/kakao/sdk";
import { searchPlacesInView } from "@/lib/kakao/placeSearch";
import { withReviewCount } from "@/lib/search/rankResults";

type Found = { keyword: string; items: PlaceSummary[] };

export function useAreaSearch(
  map: KakaoMap | null,
  keyword: string | null,
  registered: Place[],
  onEmpty: (keyword: string) => void,
): PlaceSummary[] {
  const [found, setFound] = useState<Found>({ keyword: "", items: [] });
  const onEmptyRef = useRef(onEmpty);
  useEffect(() => {
    onEmptyRef.current = onEmpty;
  }, [onEmpty]);

  useEffect(() => {
    if (!map || !keyword) return;
    const { maps } = window.kakao;
    const registeredIds = new Set(registered.map((p) => p.id));
    let cancelled = false;
    let requestId = 0;
    let isFirst = true;

    const search = async () => {
      const id = ++requestId;
      try {
        const results = await searchPlacesInView(keyword, map);
        if (cancelled || id !== requestId) return; // 그 사이 지도가 또 움직였으면 버린다
        if (isFirst && results.length === 0) onEmptyRef.current(keyword);
        isFirst = false;

        const fresh = results.filter((p) => !registeredIds.has(p.id)).map((p) => withReviewCount(p, registered));
        setFound((prev) => {
          const base = prev.keyword === keyword ? prev.items : [];
          const seen = new Set(base.map((p) => p.id));
          return { keyword, items: [...base, ...fresh.filter((p) => !seen.has(p.id))] };
        });
      } catch {
        // 검색 실패 시 기존 결과 유지
      }
    };

    search();
    maps.event.addListener(map, "idle", search);
    return () => {
      cancelled = true;
      maps.event.removeListener(map, "idle", search);
    };
  }, [map, keyword, registered]);

  return keyword && found.keyword === keyword ? found.items : [];
}
