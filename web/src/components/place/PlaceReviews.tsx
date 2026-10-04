"use client";

// 동료 리뷰 목록 (최신순). 없으면 첫 리뷰 안내. version이 바뀌면(리뷰 저장 뒤) 다시 불러옴
import { useEffect, useState } from "react";
import type { Review } from "@/types/review";
import { fetchReviews } from "@/lib/db/reviews";
import { usePlaceSheet } from "./PlaceSheetContext";
import ReviewItem from "./ReviewItem";

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
    <section className="border-t-8 border-surface px-5 pt-4 pb-2">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold">
          리뷰 {reviews && reviews.length > 0 && <span className="text-primary">{reviews.length}</span>}
        </h3>
        {reviews && reviews.length > 0 && (
          <button type="button" onClick={onWrite} className="text-sm font-bold text-primary">
            + 리뷰 쓰기
          </button>
        )}
      </div>

      {reviews === null ? (
        <p className="py-8 text-center text-sm text-gray">불러오는 중…</p>
      ) : reviews.length > 0 ? (
        <ul>
          {reviews.map((r) => (
            <ReviewItem key={r.id} review={r} />
          ))}
        </ul>
      ) : (
        <div className="mt-3 flex flex-col items-center gap-3 rounded-xl bg-surface py-8">
          <p className="text-sm text-gray">아직 리뷰가 없어요</p>
          <button type="button" onClick={onWrite} className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-white">
            첫 리뷰를 남겨주세요
          </button>
        </div>
      )}
    </section>
  );
}
