// 길찾기 앱별 링크 (도착지만 지정, 출발지는 각 앱에서 현재 위치나 직접 입력)
import type { PlaceBase } from "@/types/place";

export type DirectionsApp = "naver" | "kakao" | "tmap";

/** 네이버 지도 웹. 대중교통 경로 (PC, 또는 휴대폰에 앱이 없을 때) */
export function naverDirectionsUrl(place: PlaceBase): string {
  const params = new URLSearchParams({
    elng: String(place.lng),
    elat: String(place.lat),
    etext: place.name,
    menu: "route",
    pathType: "1",
  });
  return `https://map.naver.com/index.nhn?${params}`;
}

/** 네이버 지도 앱 대중교통 길찾기 (휴대폰 + 앱 설치 시에만 동작). appname = 호출한 서비스 식별자 */
export function naverAppDirectionsUrl(place: PlaceBase): string {
  const params = new URLSearchParams({
    dlat: String(place.lat),
    dlng: String(place.lng),
    dname: place.name,
    appname: window.location.hostname,
  });
  return `nmap://route/public?${params}`;
}

/** 카카오맵 웹 (휴대폰에선 앱이 있으면 앱으로 열림) */
export function kakaoDirectionsUrl(place: PlaceBase): string {
  return `https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;
}

/** 티맵은 웹 길찾기가 없어 앱 전용 주소만 가능 → 휴대폰 + 앱 설치 시에만 동작 */
export function tmapDirectionsUrl(place: PlaceBase): string {
  const params = new URLSearchParams({
    goalname: place.name,
    goalx: String(place.lng),
    goaly: String(place.lat),
  });
  return `tmap://route?${params}`;
}

export function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}
