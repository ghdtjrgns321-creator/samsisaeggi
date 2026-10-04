// 지도 위에 올리는 DOM 요소들. 스타일은 globals.css의 .pin / .search-pin / .my-location-dot.
import type { Place } from "@/data/places";

function pin(className: string, label: string): HTMLElement {
  const el = document.createElement("div");
  el.className = `pin ${className}`;
  const text = document.createElement("span");
  text.className = "pin-label";
  text.textContent = label;
  const tail = document.createElement("span");
  tail.className = "pin-tail";
  el.append(text, tail);
  return el;
}

/** 등록 장소 말풍선 글자: 별점이 있으면 "★ 4.5 이름" */
export function placePinLabel(place: Place): string {
  return place.rating === null ? place.name : `★ ${place.rating.toFixed(1)} ${place.name}`;
}

/** 삼시세끼 등록 장소 핀 (식당 검정 / 카페 갈색) */
export function placePinElement(place: Place): HTMLElement {
  return pin(`pin-${place.kind}`, placePinLabel(place));
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
