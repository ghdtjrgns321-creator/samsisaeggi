"use client";

// 장소 시트 안의 부품들(정보·버튼·사진·리뷰)이 함께 쓰는 값. 단계마다 props로 넘기지 않으려고 둔다.
import { createContext, useContext } from "react";
import type { Place, PlaceSummary } from "@/types/place";

type PlaceSheetValue = {
  place: PlaceSummary;
  registered: Place | undefined; // 삼시세끼 등록 장소면 DB 집계값 (찜 수·별점 등)
  onToast: (msg: string) => void;
  onChanged: () => void; // 찜·리뷰·사진을 바꾼 뒤 등록 장소를 다시 불러오기
};

const PlaceSheetContext = createContext<PlaceSheetValue | null>(null);

export const PlaceSheetProvider = PlaceSheetContext.Provider;

export function usePlaceSheet(): PlaceSheetValue {
  const value = useContext(PlaceSheetContext);
  if (!value) throw new Error("usePlaceSheet은 PlaceSheetProvider 안에서만 쓸 수 있어요");
  return value;
}
