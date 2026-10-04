// 지도 위에 올리는 DOM 요소들. 스타일은 globals.css의 .pin / .search-pin / .my-location-dot.
import type { Place } from "@/types/place";
import { placeKindEmoji } from "@/lib/placeKind";

/** badge가 있으면 말풍선 왼쪽 흰 원에 넣는다 (등록 장소 종류 이모지) */
function pin(className: string, label: string, badge?: string): HTMLElement {
  const el = document.createElement("div");
  el.className = `pin ${className}`;
  const text = document.createElement("span");
  text.className = "pin-label";
  if (badge) {
    const icon = document.createElement("span");
    icon.className = "pin-badge";
    icon.textContent = badge;
    text.append(icon);
  }
  text.append(label);
  const tail = document.createElement("span");
  tail.className = "pin-tail";
  el.append(text, tail);
  return el;
}

/** 등록 장소 말풍선 글자: withName이면 "★ 4.5 이름", 아니면 "★ 4.5" */
export function placePinLabel(place: Place, withName: boolean): string {
  const star = place.rating === null ? "" : `★ ${place.rating.toFixed(1)}`;
  return withName ? `${star} ${place.name}`.trim() : star;
}

/** 삼시세끼 등록 장소 핀: 주황 반투명 말풍선 + 종류 이모지(밥·술·커피·빵·고기·회) */
export function placePinElement(place: Place, withName: boolean): HTMLElement {
  return pin("pin-place", placePinLabel(place, withName), placeKindEmoji(place));
}

/** 검색으로 고른 미등록 장소 임시 핀 */
export function searchPinElement(name: string): HTMLElement {
  return pin("search-pin", name);
}

/** 내 위치 파란 점 */
export function myLocationDotElement(): HTMLElement {
  const el = document.createElement("div");
  el.className = "my-location-dot";
  return el;
}

/** 엔터 검색 결과 중 리뷰 없는 장소: 흰 말풍선 */
export function resultPinElement(name: string): HTMLElement {
  return pin("result-pin", name);
}
