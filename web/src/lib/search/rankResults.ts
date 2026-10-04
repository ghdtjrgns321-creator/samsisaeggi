// 검색 결과 정렬: 삼시세끼에 등록된 장소를 리뷰 많은 순으로 맨 위에, 나머지는 Kakao 순서 그대로.
import type { Place } from "@/data/places";
import type { KakaoPlace } from "@/lib/kakao/placeSearch";

export type SearchResult = KakaoPlace & {
  reviewCount: number | null; // null = 삼시세끼 미등록 장소
};

export function rankResults(results: KakaoPlace[], registered: Place[]): SearchResult[] {
  const reviewCountById = new Map(registered.map((p) => [p.id, p.reviewCount]));

  const withCounts: SearchResult[] = results.map((r) => ({
    ...r,
    reviewCount: reviewCountById.get(r.id) ?? null,
  }));

  const ours = withCounts
    .filter((r) => r.reviewCount !== null)
    .sort((a, b) => b.reviewCount! - a.reviewCount!);
  const others = withCounts.filter((r) => r.reviewCount === null);

  return [...ours, ...others];
}
