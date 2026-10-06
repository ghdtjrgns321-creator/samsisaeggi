"use client";

// 동료 리뷰를 옆으로 넘기는 카드로 (최신순). 접힌 시트에서도 넘겨 볼 수 있다.
// 카드를 누르면 그 리뷰만 작은 팝업으로, "전체 보기"는 전체 리뷰 창 (둘 다 한줄평 전문 + 함께 올린 사진).
// 없으면 첫 리뷰 안내 카드. version이 바뀌면(리뷰 저장 뒤) 다시 불러옴
import { useEffect, useMemo, useState } from "react";
import type { Review } from "@/types/review";
import { fetchReviews } from "@/lib/db/reviews";
import { fetchPhotos, type Photo } from "@/lib/db/photos";
import { useMouseDragScroll } from "@/hooks/useMouseDragScroll";
import { usePlaceSheet } from "./PlaceSheetContext";
import ReviewCard from "./ReviewCard";
import ReviewPopup from "./ReviewPopup";
import ReviewsViewer from "./ReviewsViewer";

export default function PlaceReviews({ version, onWrite }: { version: number; onWrite: () => void }) {
  const { place, onToast } = usePlaceSheet();
  const [reviews, setReviews] = useState<Review[] | null>(null); // null = 불러오는 중
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showAll, setShowAll] = useState(false); // 전체 리뷰 창
  const [opened, setOpened] = useState<Review | null>(null); // 카드를 눌러 팝업으로 보는 리뷰
  const dragScroll = useMouseDragScroll<HTMLUListElement>(); // PC에서 마우스로 끌어 넘기기

  useEffect(() => {
    fetchReviews(place.id)
      .then(setReviews)
      .catch((e: Error) => {
        setReviews([]);
        onToast(e.message);
      });
    fetchPhotos(place.id)
      .then(setPhotos)
      .catch((e: Error) => onToast(e.message));
  }, [place.id, onToast, version]);

  const photosByReview = useMemo(() => {
    const map = new Map<string, Photo[]>();
    for (const p of photos) {
      if (!p.reviewId) continue;
      map.set(p.reviewId, [...(map.get(p.reviewId) ?? []), p]);
    }
    return map;
  }, [photos]);

  // 리뷰 작성 화면은 시트 안에 뜨므로 전체 리뷰 창을 닫고 연다
  const writeFromViewer = () => {
    setShowAll(false);
    onWrite();
  };

  return (
    <section className="pb-4">
      <div className="flex items-center justify-between px-5 pb-2">
        <h3 className="text-base font-bold">
          리뷰 {reviews && reviews.length > 0 && <span className="text-primary">{reviews.length}</span>}
        </h3>
        {reviews && reviews.length > 0 && (
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setShowAll(true)} className="text-sm text-gray">
              전체 보기 ›
            </button>
            <button type="button" onClick={onWrite} className="text-sm font-bold text-primary">
              + 리뷰 쓰기
            </button>
          </div>
        )}
      </div>

      {reviews && reviews.length > 0 ? (
        <ul
          {...dragScroll}
          className="flex snap-x snap-mandatory scroll-px-5 gap-2 overflow-x-auto px-5 select-none [scrollbar-width:none]"
        >
          {reviews.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              photoCount={photosByReview.get(r.id)?.length ?? 0}
              onOpen={() => setOpened(r)}
            />
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

      {showAll && reviews && (
        <ReviewsViewer
          reviews={reviews}
          photosByReview={photosByReview}
          onWrite={writeFromViewer}
          onClose={() => setShowAll(false)}
        />
      )}
      {opened && (
        <ReviewPopup review={opened} photos={photosByReview.get(opened.id) ?? []} onClose={() => setOpened(null)} />
      )}
    </section>
  );
}
