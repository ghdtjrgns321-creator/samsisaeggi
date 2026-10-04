"use client";

// 동료 리뷰를 옆으로 넘기는 카드로 (최신순). 접힌 시트에서도 넘겨 볼 수 있다.
// 없으면 첫 리뷰 안내 카드. version이 바뀌면(리뷰 저장 뒤) 다시 불러옴
import { useEffect, useState } from "react";
import type { Review } from "@/types/review";
import { fetchReviews } from "@/lib/db/reviews";
import { usePlaceSheet } from "./PlaceSheetContext";
import ReviewCard from "./ReviewCard";

export default function PlaceReviews({ version, onWrite }: { version: number; onWrite: () => void }) {
  const { place, onToast } = usePlaceSheet();
  const [reviews, setReviews] = useState<Review[] | null>(null); // null = 불러오는 중

  useEffect(() => {
    fetchReviews(place.id)
      .then(setReviews)
      .catch((e: Error) => {
        setReviews([]);
        onToast(e.message);
      });
  }, [place.id, onToast, version]);

  return (
    <section className="pb-4">
      <div className="flex items-center justify-between px-5 pb-2">
        <h3 className="text-base font-bold">
          리뷰 {reviews && reviews.length > 0 && <span className="text-primary">{reviews.length}</span>}
        </h3>
        {reviews && reviews.length > 0 && (
          <button type="button" onClick={onWrite} className="text-sm font-bold text-primary">
            + 리뷰 쓰기
          </button>
        )}
      </div>

      {reviews && reviews.length > 0 ? (
        <ul className="flex snap-x snap-mandatory scroll-px-5 gap-2 overflow-x-auto px-5 [scrollbar-width:none]">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </ul>
      ) : (
        // 불러오는 중에도 같은 높이(h-32)를 잡아 접힌 시트 높이가 튀지 않게
        <div className="mx-5 flex h-32 flex-col items-center justify-center gap-3 rounded-xl bg-surface">
          {reviews === null ? (
            <p className="text-sm text-gray">불러오는 중…</p>
          ) : (
            <>
              <p className="text-sm text-gray">아직 리뷰가 없어요</p>
              <button type="button" onClick={onWrite} className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-white">
                첫 리뷰를 남겨주세요
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
