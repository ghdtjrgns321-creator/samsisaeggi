// Kakao 장소 분류 코드
import type { PlaceBase } from "@/types/place";

/** 리뷰 대상이자 지도 누르기로 찾는 분류: 음식점(FD6), 카페(CE7) */
export const REVIEWABLE_CODES = ["FD6", "CE7"];

/** 삼시세끼 리뷰 대상(음식점·카페)인지 */
export function isReviewable(place: PlaceBase): boolean {
  return REVIEWABLE_CODES.includes(place.groupCode);
}
