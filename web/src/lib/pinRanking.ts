// 지도 핀에 이름까지 보여줄 곳 고르기: 지금 보이는 화면 안에서 리뷰 많은 상위 몇 곳만 "★ 4.5 이름",
// 나머지는 "★ 4.5"만. 화면을 옮기거나 확대하면 그 화면 기준으로 다시 고른다.
import type { Place } from "@/types/place";

export const NAMED_PIN_COUNT = 1;

/** visible(화면 안 장소) 중 리뷰 수 → 별점 순으로 상위 NAMED_PIN_COUNT곳의 id */
export function namedPinIds(visible: Place[]): Set<string> {
  const ranked = [...visible].sort((a, b) => b.reviewCount - a.reviewCount || (b.rating ?? 0) - (a.rating ?? 0));
  return new Set(ranked.slice(0, NAMED_PIN_COUNT).map((p) => p.id));
}
