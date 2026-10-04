// 장소 관련 공통 타입. 등록 장소·검색 결과·카드가 모두 이 모양을 공유한다.

/** Kakao에서 얻는 기본 정보 */
export type PlaceBase = {
  id: string; // Kakao 장소 id
  name: string;
  category: string;
  groupCode: string; // Kakao 분류 코드 (FD6 음식점, CE7 카페 …). 없으면 ""
  address: string;
  phone: string;
  lat: number;
  lng: number;
};

/** 화면에 띄울 장소. reviewCount null = 삼시세끼 미등록 */
export type PlaceSummary = PlaceBase & {
  reviewCount: number | null;
};

/** 리뷰를 모아 계산한 값 (리뷰 DB 연결 후 채움) */
export type PlaceStats = {
  rating: number;
  reviewCount: number;
  uses: string[];
  maxPeople: number;
  pricePerPerson: number;
};
