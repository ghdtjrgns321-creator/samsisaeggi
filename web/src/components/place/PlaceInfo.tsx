"use client";

// 장소 기본 정보: 종류 · 이름 · 별점 · 주소 · 요약 3칸 · 버튼 4개 (하단 시트의 맨 윗부분)
import type { PlaceStats } from "@/types/place";
import { isReviewable } from "@/lib/kakao/categories";
import PlaceActions from "./PlaceActions";
import PlaceStatsRow from "./PlaceStatsRow";
import { usePlaceSheet } from "./PlaceSheetContext";

export default function PlaceInfo({ stats }: { stats: PlaceStats | null /* null = 리뷰 없음 */ }) {
  const { place } = usePlaceSheet();
  const reviewable = isReviewable(place); // 음식점·카페만 별점·요약 표시

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

      <div className="mt-4 space-y-3">
        {reviewable && <PlaceStatsRow stats={stats} />}
        {/* key: 다른 장소로 바뀌면 찜 상태를 새로 읽도록 다시 마운트 */}
        <PlaceActions key={place.id} />
      </div>
    </div>
  );
}
