// 카카오맵 장소 페이지 링크 (메뉴·사진은 카카오맵에서 보도록 연결만 한다)
import type { PlaceBase } from "@/types/place";

/** Kakao 장소 id가 없는 곳(건물 등)은 null */
export function kakaoPlaceUrl(place: PlaceBase): string | null {
  return /^\d+$/.test(place.id) ? `https://place.map.kakao.com/${place.id}` : null;
}
