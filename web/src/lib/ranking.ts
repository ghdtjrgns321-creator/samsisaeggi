// 하단 목록 정렬. 랭킹 점수 = 0.1 × 평균 별점 × 리뷰 수 (기획 확정 규칙)
import type { Place } from "@/types/place";
import type { LatLng } from "./geolocation";
import { distanceMeters } from "./geo";

export const SORT_OPTIONS = [
  { value: "ranking", label: "랭킹순" },
  { value: "rating", label: "별점순" },
  { value: "reviews", label: "리뷰순" },
  { value: "distance", label: "거리순" }, // 내 위치를 알 때만
] as const;
export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

export function rankingScore(place: Place): number {
  return 0.1 * (place.rating ?? 0) * place.reviewCount;
}

export function sortPlaces(places: Place[], sort: SortKey, myLocation: LatLng | null): Place[] {
  const key: Record<SortKey, (p: Place) => number> = {
    ranking: (p) => -rankingScore(p),
    rating: (p) => -(p.rating ?? 0),
    reviews: (p) => -p.reviewCount,
    distance: (p) => (myLocation ? distanceMeters(myLocation, p) : 0),
  };
  return [...places].sort((a, b) => key[sort](a) - key[sort](b) || rankingScore(b) - rankingScore(a));
}
