// Kakao 장소 키워드 검색. 모든 장소(식당·카페·역·건물 등)를 대상으로 한다.
import type { PlaceBase } from "@/types/place";
import type { KakaoMap } from "./sdk";

/** Kakao 장소 검색 API 응답 한 건 */
export type RawPlace = {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  road_address_name: string;
  address_name: string;
  phone: string;
  x: string;
  y: string;
  distance: string; // 기준 위치를 줬을 때만 값이 있음 (m)
};

export function toPlaceBase(raw: RawPlace): PlaceBase {
  return {
    id: raw.id,
    name: raw.place_name,
    category: raw.category_name.split(" > ").pop() ?? "", // "음식점 > 한식 > 국밥" 중 마지막 단계
    address: raw.road_address_name || raw.address_name,
    phone: raw.phone,
    groupCode: raw.category_group_code,
    lat: Number(raw.y),
    lng: Number(raw.x),
  };
}

/** 현재 지도 중심 근처를 우선해 검색. 결과 없음은 빈 배열, 통신 오류는 throw. */
export function searchPlaces(keyword: string, map: KakaoMap): Promise<PlaceBase[]> {
  const { services } = window.kakao.maps;
  const places = new services.Places();

  return new Promise((resolve, reject) => {
    places.keywordSearch(
      keyword,
      (data: RawPlace[], status: string) => {
        if (status === services.Status.OK) resolve(data.map(toPlaceBase));
        else if (status === services.Status.ZERO_RESULT) resolve([]);
        else reject(new Error(`Kakao 장소 검색 실패: ${status}`));
      },
      { location: map.getCenter() },
    );
  });
}

const MAX_PAGES = 3; // Kakao 한도: 페이지당 15곳 × 3페이지 = 45곳

/** Kakao 검색 함수(keywordSearch·categorySearch)를 지금 화면 범위로 실행하고 최대 3페이지까지 모은다 */
function collectInView(
  run: (callback: (data: RawPlace[], status: string, pagination: any) => void, options: object) => void, // eslint-disable-line @typescript-eslint/no-explicit-any
  map: KakaoMap,
): Promise<PlaceBase[]> {
  const { services } = window.kakao.maps;
  const collected: RawPlace[] = [];

  return new Promise((resolve, reject) => {
    run(
      (data, status, pagination) => {
        if (status === services.Status.ZERO_RESULT) return resolve([]);
        if (status !== services.Status.OK) return reject(new Error(`Kakao 장소 검색 실패: ${status}`));
        collected.push(...data);
        // nextPage()는 같은 콜백을 다시 호출한다
        if (pagination.hasNextPage && pagination.current < MAX_PAGES) pagination.nextPage();
        else resolve(collected.map(toPlaceBase));
      },
      { bounds: map.getBounds() },
    );
  });
}

/** 지금 지도 화면 안에서 검색어로 찾기 (엔터 검색) */
export function searchPlacesInView(keyword: string, map: KakaoMap): Promise<PlaceBase[]> {
  const places = new window.kakao.maps.services.Places();
  return collectInView((cb, options) => places.keywordSearch(keyword, cb, options), map);
}

/** 지금 지도 화면 안의 분류(음식점 FD6·카페 CE7) 장소 (필터 칩) */
export function categoryPlacesInView(code: string, map: KakaoMap): Promise<PlaceBase[]> {
  const places = new window.kakao.maps.services.Places();
  return collectInView((cb, options) => places.categorySearch(code, cb, options), map);
}
