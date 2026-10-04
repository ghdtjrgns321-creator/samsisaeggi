// 지도에서 누른 지점의 장소 찾기.
// Kakao SDK는 지도에 그려진 장소 이름을 눌렀는지 알려주지 않아서, 누른 좌표 주변을 검색해 대신한다.
// 바탕 지도가 이름을 그리는 방식(지점명 생략, 띄어쓰기마다 줄바꿈, 주로 아이콘 아래, 자리가 없으면 옆)을 흉내 내
// 장소마다 이름 글자 영역을 추정하고, 누른 곳이 그 영역에 얼마나 가까운지로 점수를 매긴다.
import type { PlaceBase } from "@/types/place";
import type { KakaoMap } from "./sdk";
import { toPlaceBase, type RawPlace } from "./placeSearch";
import { REVIEWABLE_CODES } from "./categories";
import { DETAIL_LEVEL } from "./mapView";

const CHAR_WIDTH_PX = 11; // 바탕 지도 이름 글자 한 자 폭
const LINE_HEIGHT_PX = 14; // 이름 한 줄 높이
const LABEL_GAP_PX = 8; // 아이콘 중심 → 이름 글자까지 거리
const ICON_RADIUS_PX = 9; // 아이콘 반지름
const SIDE_PENALTY_PX = 4; // 아래가 아닌 위치(위·왼쪽·오른쪽)는 덜 흔하므로 이만큼 멀리 친다
const MAX_SCORE_PX = 6; // 이름·아이콘에서 이 픽셀 이상 벗어나면 그 장소를 누른 게 아니다
const CLEAR_MARGIN_PX = 5; // 1등 점수가 2등보다 이만큼 앞서야 목록 없이 바로 선택
const SEARCH_REACH_PX = 90; // 이 안의 장소만 검사 (긴 이름이 옆으로 뻗는 거리)
const MAX_CANDIDATES = 5;

type Point = { x: number; y: number };

/** 바탕 지도에 실제로 찍히는 이름 줄들: 끝의 "○○점" 지점명을 빼고 띄어쓰기마다 줄을 나눈다 */
function labelLines(placeName: string): string[] {
  const words = placeName.trim().split(/\s+/);
  if (words.length > 1 && /점$/.test(words[words.length - 1])) words.pop();
  return words;
}

/** 점에서 사각형까지 거리 (안이면 0) */
function distToRect(p: Point, l: number, t: number, r: number, b: number): number {
  const dx = Math.max(l - p.x, 0, p.x - r);
  const dy = Math.max(t - p.y, 0, p.y - b);
  return Math.hypot(dx, dy);
}

/** 누른 곳이 이 장소의 아이콘·이름 글자에서 몇 px 떨어졌는가 (작을수록 이 장소를 누른 것) */
function tapScore(icon: Point, placeName: string, tap: Point): number {
  const lines = labelLines(placeName);
  const w = Math.max(...lines.map((s) => s.length)) * CHAR_WIDTH_PX;
  const h = lines.length * LINE_HEIGHT_PX;
  const g = LABEL_GAP_PX;
  const onIcon = Math.max(0, Math.hypot(tap.x - icon.x, tap.y - icon.y) - ICON_RADIUS_PX);
  const below = distToRect(tap, icon.x - w / 2, icon.y + g, icon.x + w / 2, icon.y + g + h);
  const above = distToRect(tap, icon.x - w / 2, icon.y - g - h, icon.x + w / 2, icon.y - g);
  const left = distToRect(tap, icon.x - g - w, icon.y - h / 2, icon.x - g, icon.y + h / 2);
  const right = distToRect(tap, icon.x + g, icon.y - h / 2, icon.x + g + w, icon.y + h / 2);
  return Math.min(onIcon, below, Math.min(above, left, right) + SIDE_PENALTY_PX);
}

/** 현재 확대 수준에서 px 픽셀이 실제 몇 m인지 */
function pxToMeters(map: KakaoMap, lat: number, lng: number, px: number): number {
  const { maps } = window.kakao;
  const projection = map.getProjection();
  const point = projection.pointFromCoords(new maps.LatLng(lat, lng));
  const shifted = projection.coordsFromPoint(new maps.Point(point.x + px, point.y));
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

/** 후보: 누른 곳에 이름·아이콘이 걸리는 음식점·카페. 1등이 확실하면 그 1곳, 애매하면 점수순 최대 5곳. 없으면 빈 배열 */
export async function findPlacesAt(map: KakaoMap, lat: number, lng: number): Promise<PlaceBase[]> {
  if (map.getLevel() > DETAIL_LEVEL) return [];
  const radius = pxToMeters(map, lat, lng, SEARCH_REACH_PX);
  const results = await Promise.all(REVIEWABLE_CODES.map((c) => searchCategory(c, lat, lng, radius)));

  const { maps } = window.kakao;
  const projection = map.getProjection();
  const tap: Point = projection.pointFromCoords(new maps.LatLng(lat, lng));
  const scored = results
    .flat()
    .map((raw) => {
      const icon: Point = projection.pointFromCoords(new maps.LatLng(Number(raw.y), Number(raw.x)));
      return { raw, score: tapScore(icon, raw.place_name, tap) };
    })
    .filter((c) => c.score <= MAX_SCORE_PX)
    .sort((a, b) => a.score - b.score);

  const isClear = scored.length === 1 || (scored.length > 1 && scored[1].score - scored[0].score >= CLEAR_MARGIN_PX);
  return (isClear ? scored.slice(0, 1) : scored.slice(0, MAX_CANDIDATES)).map(({ raw }) => toPlaceBase(raw));
}
