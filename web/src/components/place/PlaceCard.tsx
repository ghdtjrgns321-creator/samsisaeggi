"use client";

// 핀을 누르면 뜨는 하단 카드. (위로 끌어올려 상세 화면으로 여는 기능은 다음 단계)
import type { PlaceStats, PlaceSummary } from "@/types/place";
import { isReviewable } from "@/lib/kakao/categories";
import PlaceActions from "./PlaceActions";
import PlaceStatsRow from "./PlaceStatsRow";

type Props = {
  place: PlaceSummary;
  stats: PlaceStats | null; // null = 리뷰 없음
  onToast: (msg: string) => void;
};

export default function PlaceCard({ place, stats, onToast }: Props) {
  const reviewable = isReviewable(place); // 음식점·카페만 별점·요약 표시

  return (
    <section className="w-full rounded-t-2xl bg-white px-5 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.12)]">
      <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" aria-hidden />

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
        <PlaceActions key={place.id} place={place} onToast={onToast} />
      </div>
    </section>
  );
}
