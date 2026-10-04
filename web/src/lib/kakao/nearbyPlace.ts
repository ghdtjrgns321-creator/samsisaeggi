// 지도에서 누른 지점의 장소 찾기.
// Kakao SDK는 지도에 그려진 장소 이름을 눌렀는지 알려주지 않아서, 누른 좌표 주변을 검색해 대신한다.
// 손가락 범위 안의 음식점·카페를 가까운 순으로.
import type { PlaceBase } from "@/types/place";
import type { KakaoMap } from "./sdk";
import { toPlaceBase, type RawPlace } from "./placeSearch";
import { REVIEWABLE_CODES } from "./categories";
import { DETAIL_LEVEL } from "./mapView";

const TAP_RADIUS_PX = 24; // 손가락 오차를 감안해 누른 곳에서 이 픽셀 거리 안까지 인정
const MAX_CANDIDATES = 5;

/** 현재 확대 수준에서 TAP_RADIUS_PX가 실제 몇 m인지 */
function tapRadiusMeters(map: KakaoMap, lat: number, lng: number): number {
  const { maps } = window.kakao;
  const projection = map.getProjection();
  const point = projection.pointFromCoords(new maps.LatLng(lat, lng));
  const shifted = projection.coordsFromPoint(new maps.Point(point.x + TAP_RADIUS_PX, point.y));
  const metersPerLngDegree = 111320 * Math.cos((lat * Math.PI) / 180);
  return Math.max(5, Math.round(Math.abs(shifted.getLng() - lng) * metersPerLngDegree));
}

function searchCategory(code: string, lat: number, lng: number, radius: number): Promise<RawPlace[]> {
  const { maps } = window.kakao;
  const places = new maps.services.Places();
  return new Promise((resolve, reject) => {
    places.categorySearch(
      code,
      (data: RawPlace[], status: string) => {
        if (status === maps.services.Status.OK) resolve(data);
        else if (status === maps.services.Status.ZERO_RESULT) resolve([]);
        else reject(new Error(`Kakao 주변 검색 실패: ${status}`));
      },
      { location: new maps.LatLng(lat, lng), radius, sort: maps.services.SortBy.DISTANCE },
    );
  });
}

/** 후보: 음식점·카페 가까운 순 최대 5곳. 없으면 빈 배열 */
export async function findPlacesAt(map: KakaoMap, lat: number, lng: number): Promise<PlaceBase[]> {
  if (map.getLevel() > DETAIL_LEVEL) return [];
  const radius = tapRadiusMeters(map, lat, lng);

  const results = await Promise.all(REVIEWABLE_CODES.map((c) => searchCategory(c, lat, lng, radius)));
  return results
    .flat()
    .sort((a, b) => Number(a.distance) - Number(b.distance))
    .slice(0, MAX_CANDIDATES)
    .map(toPlaceBase);
}
