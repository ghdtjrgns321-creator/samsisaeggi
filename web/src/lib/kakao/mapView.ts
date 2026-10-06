// 지도 시점 이동 도우미
import type { KakaoMap } from "./sdk";

export const FOCUS_LEVEL = 3;
/** 첫 화면 중심: 삼일회계법인 (용산 아모레퍼시픽 사옥, 한강대로 100) */
export const DEFAULT_CENTER = { lat: 37.52879, lng: 126.96867 };
/** 이 수준까지 확대해야 지도에 가게 이름이 보이므로, 지도 누르기 찾기도 이때만 */
export const DETAIL_LEVEL = 4;
/** 지역 검색 결과로 옮길 때: 동네 하나가 한 화면에 들어오는 수준 */
export const REGION_LEVEL = 6;

/** 한 지점으로 확대 이동 */
export function focusOn(map: KakaoMap, lat: number, lng: number) {
  const { maps } = window.kakao;
  map.setLevel(FOCUS_LEVEL);
  map.panTo(new maps.LatLng(lat, lng));
}

/** 확대 수준은 그대로 두고 한 지점을 화면 가운데로 */
export function panTo(map: KakaoMap, lat: number, lng: number) {
  const { maps } = window.kakao;
  map.panTo(new maps.LatLng(lat, lng));
}

const CARD_COVER_RATIO = 0.5; // 하단 장소 시트(접힌 상태)가 지도 아래쪽 약 절반을 가린다

/** 지점이 하단 카드에 가려지는 위치일 때만 화면 가운데로 옮긴다 */
export function panIntoView(map: KakaoMap, lat: number, lng: number) {
  const bounds = map.getBounds();
  const south = bounds.getSouthWest().getLat();
  const north = bounds.getNorthEast().getLat();
  if (lat < south + (north - south) * CARD_COVER_RATIO) panTo(map, lat, lng);
}
