// Kakao 장소 키워드 검색. 모든 장소(식당·카페·역·건물 등)를 대상으로 한다.
import type { KakaoMap } from "./sdk";

export type KakaoPlace = {
  id: string;
  name: string;
  category: string; // "음식점 > 한식 > 국밥" 중 마지막 단계
  address: string;
  lat: number;
  lng: number;
};

type RawPlace = {
  id: string;
  place_name: string;
  category_name: string;
  road_address_name: string;
  address_name: string;
  x: string;
  y: string;
};

function toKakaoPlace(raw: RawPlace): KakaoPlace {
  return {
    id: raw.id,
    name: raw.place_name,
    category: raw.category_name.split(" > ").pop() ?? "",
    address: raw.road_address_name || raw.address_name,
    lat: Number(raw.y),
    lng: Number(raw.x),
  };
}

/** 현재 지도 중심 근처를 우선해 검색. 결과 없음은 빈 배열, 통신 오류는 throw. */
export function searchPlaces(keyword: string, map: KakaoMap): Promise<KakaoPlace[]> {
  const { services } = window.kakao.maps;
  const places = new services.Places();

  return new Promise((resolve, reject) => {
    places.keywordSearch(
      keyword,
      (data: RawPlace[], status: string) => {
        if (status === services.Status.OK) resolve(data.map(toKakaoPlace));
        else if (status === services.Status.ZERO_RESULT) resolve([]);
        else reject(new Error(`Kakao 장소 검색 실패: ${status}`));
      },
      { location: map.getCenter() },
    );
  });
}
