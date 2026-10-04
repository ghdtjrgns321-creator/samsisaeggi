// 등록 장소 집계 → 카드 요약값. 리뷰가 없으면 null (카드에 "첫 리뷰를 남겨주세요!")
import type { Place, PlaceStats } from "@/types/place";

const TOP_USES = 2; // 요약 칸이 좁아 많이 나온 용도 2개까지만

/** 많이 나온 순으로 중복 없이 */
function byFrequency(values: string[]): string[] {
  const counts = new Map<string, number>();
  values.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v);
}

export function toPlaceStats(place: Place): PlaceStats | null {
  if (place.reviewCount === 0 || place.rating === null) return null;
  return {
    rating: place.rating,
    reviewCount: place.reviewCount,
    uses: byFrequency(place.purposes).slice(0, TOP_USES),
    maxPeople: place.maxPeople,
    pricePerPerson: place.pricePerPerson,
  };
}
