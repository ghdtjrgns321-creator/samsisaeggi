"use client";

// 화면 안 장소 찾기: 엔터 검색어 또는 장소 종류 칩(음식점·카페)으로 지금 화면 안을 찾고,
// 지도를 옮기거나 확대할 때마다 새 화면에서 다시 찾아 결과를 보탠다.
// (Kakao는 한 번에 45곳까지만 주므로, 확대한 좁은 지역에서 다시 찾아야 덜 알려진 곳도 나온다)
// 검색어와 칩이 같이 켜지면 검색 결과 중 그 종류만 남긴다.
// 결과 순서 = 먼저 찾은 것 우선, 같은 검색 안에서는 Kakao 정확도 순 → 말풍선 우선순위로 쓰인다.
// 리뷰 있는 등록 장소는 이미 핀이 있으므로 결과에서 뺀다.
import { useEffect, useRef, useState } from "react";
import type { Place, PlaceSummary } from "@/types/place";
import type { KakaoMap } from "@/lib/kakao/sdk";
import { categoryPlacesInView, searchPlacesInView } from "@/lib/kakao/placeSearch";
import { matchesKind } from "@/lib/filters";
import { withReviewCount } from "@/lib/search/rankResults";

export type AreaQuery = { keyword: string | null; kind: string | null }; // kind = Kakao 분류 코드

type Found = { key: string; items: PlaceSummary[] };

const queryKey = ({ keyword, kind }: AreaQuery) => `${keyword ?? ""}|${kind ?? ""}`;

export function useAreaSearch(
  map: KakaoMap | null,
  query: AreaQuery,
  registered: Place[],
  onEmpty: () => void,
): PlaceSummary[] {
  const [found, setFound] = useState<Found>({ key: "", items: [] });
  const onEmptyRef = useRef(onEmpty);
  useEffect(() => {
    onEmptyRef.current = onEmpty;
  }, [onEmpty]);

  const { keyword, kind } = query;
  const key = queryKey(query);
  const active = Boolean(keyword || kind);

  useEffect(() => {
    if (!map || !active) return;
    const { maps } = window.kakao;
    const pinnedIds = new Set(registered.filter((p) => p.reviewCount > 0).map((p) => p.id)); // 이미 핀이 있는 곳
    let cancelled = false;
    let requestId = 0;
    let isFirst = true;

    const fetchInView = async () =>
      keyword
        ? (await searchPlacesInView(keyword, map)).filter((p) => matchesKind(p, kind))
        : categoryPlacesInView(kind!, map);

    const search = async () => {
      const id = ++requestId;
      try {
        const results = await fetchInView();
        if (cancelled || id !== requestId) return; // 그 사이 지도가 또 움직였으면 버린다
        if (isFirst && results.length === 0) onEmptyRef.current();
        isFirst = false;

        const fresh = results.filter((p) => !pinnedIds.has(p.id)).map((p) => withReviewCount(p, registered));
        setFound((prev) => {
          const base = prev.key === key ? prev.items : [];
          const seen = new Set(base.map((p) => p.id));
          return { key, items: [...base, ...fresh.filter((p) => !seen.has(p.id))] };
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
  }, [map, active, keyword, kind, key, registered]);

  return active && found.key === key ? found.items : [];
}
