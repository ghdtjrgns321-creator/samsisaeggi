// 리뷰 한 건 (DB reviews 한 줄 + 그 리뷰에 붙인 사진)
export type Review = {
  id: string;
  rating: number; // 0.5~5, 0.5 단위
  comment: string;
  purposes: string[];
  mealTime: string | null; // 음식점만
  workEnv: string[]; // 카페만
  people: number | null;
  totalPrice: number | null;
  isSample: boolean; // 시드로 넣은 예시 리뷰
  createdAt: string; // ISO
  photos: { id: string; url: string }[]; // 올린 순
};
