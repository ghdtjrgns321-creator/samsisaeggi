"use client";

// 장소 머리 정보: 종류 · 이름 · 별점 · 주소 (하단 시트의 맨 윗부분. 음식점·카페는 바로 아래에 리뷰가 온다)
import type { PlaceStats } from "@/types/place";
import { isReviewable } from "@/lib/kakao/categories";
import { usePlaceSheet } from "./PlaceSheetContext";

export default function PlaceInfo({ stats }: { stats: PlaceStats | null /* null = 리뷰 없음 */ }) {
  const { place } = usePlaceSheet();
  const reviewable = isReviewable(place); // 음식점·카페만 별점 표시

  return (
    <div className="px-5 pb-4">
      <p className="text-xs text-gray">{place.category}</p>
      <h2 className="mt-0.5 text-xl font-bold">{place.name}</h2>
      {reviewable && (
        <p className="mt-1 text-sm">
          {stats ? (
            <>
              <span className="font-bold text-primary">★ {stats.rating.toFixed(1)}</span>
              <span className="text-gray"> · 리뷰 {stats.reviewCount}</span>
            </>
          ) : (
            <span className="font-medium text-primary">첫 리뷰를 남겨주세요!</span>
          )}
        </p>
      )}
      <p className="mt-0.5 truncate text-sm text-gray">{place.address}</p>
    </div>
  );
}
