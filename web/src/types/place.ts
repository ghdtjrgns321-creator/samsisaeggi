// 장소 관련 공통 타입. 등록 장소·검색 결과·카드가 모두 이 모양을 공유한다.

/** Kakao에서 얻는 기본 정보 */
export type PlaceBase = {
  id: string; // Kakao 장소 id
  name: string;
  category: string;
  categoryPath: string; // Kakao 분류 전체 경로 ("음식점 > 술집 > 호프,요리주점"). 경로 저장 전 등록 장소는 ""
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

/** 삼시세끼 등록 장소 + 리뷰 집계 (DB place_stats 뷰 한 줄) */
export type Place = PlaceBase & {
  reviewCount: number;
  rating: number | null; // 리뷰 없으면 null
  mealTimes: string[]; // 리뷰에 나온 시간대 (중복 포함)
  purposes: string[]; // 리뷰에 나온 용도 (중복 포함)
  workEnvs: string[]; // 리뷰에 나온 카페 작업 환경 (중복 포함)
  minPeople: number | null; // 다녀간 인원 (리뷰에 적힌 최소~최대)
  maxPeople: number | null;
  pricePerPerson: number | null; // 1인 가격 중앙값
  favoriteCount: number;
  mainPhotoPath: string | null;
};

/** 카드에 보여줄 리뷰 요약 (리뷰가 1개 이상일 때만) */
export type PlaceStats = {
  rating: number;
  reviewCount: number;
  uses: string[]; // 많이 나온 용도 순
  minPeople: number | null; // 다녀간 인원 (리뷰에 적힌 최소~최대)
  maxPeople: number | null;
  pricePerPerson: number | null;
};
