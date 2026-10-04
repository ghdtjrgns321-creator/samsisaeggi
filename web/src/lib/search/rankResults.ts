// 검색 결과 정렬: 삼시세끼에 등록된 장소를 리뷰 많은 순으로 맨 위에, 나머지는 Kakao 순서 그대로.
import type { Place } from "@/data/places";
import type { PlaceBase, PlaceSummary } from "@/types/place";

/** Kakao 장소에 삼시세끼 리뷰 수를 붙인다 (미등록이면 null) */
export function withReviewCount(place: PlaceBase, registered: Place[]): PlaceSummary {
  const ours = registered.find((p) => p.id === place.id);
  return { ...place, reviewCount: ours ? ours.reviewCount : null };
}

export function rankResults(results: PlaceBase[], registered: Place[]): PlaceSummary[] {
  const withCounts = results.map((r) => withReviewCount(r, registered));

  const ours = withCounts
    .filter((r) => r.reviewCount !== null)
    .sort((a, b) => b.reviewCount! - a.reviewCount!);
  const others = withCounts.filter((r) => r.reviewCount === null);

  return [...ours, ...others];
}
