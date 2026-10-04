// 리뷰 한 건 (DB reviews 한 줄)
export type Review = {
  id: string;
  rating: number; // 1~5
  comment: string; // 30자 이내
  purposes: string[];
  mealTime: string | null; // 음식점만
  workEnv: string[]; // 카페만
  people: number | null;
  totalPrice: number | null;
  isSample: boolean; // 시드로 넣은 예시 리뷰
  createdAt: string; // ISO
};
