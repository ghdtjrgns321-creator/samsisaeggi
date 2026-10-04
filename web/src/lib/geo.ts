// 거리 계산 (목록의 "도보 n분")
import type { LatLng } from "./geolocation";

const EARTH_RADIUS_M = 6371000;
const WALK_METERS_PER_MIN = 67; // 시속 약 4km

/** 두 지점 사이 직선거리(m) */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** 직선거리 기준 도보 시간(분, 최소 1분). 실제 길은 더 돌아갈 수 있어 대략값 */
export function walkMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / WALK_METERS_PER_MIN));
}
