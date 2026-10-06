"use client";

// 리뷰 한 건 전체: 별점·날짜 / 한줄평 전문 / 태그 전부 / 함께 올린 사진 (누르면 크게 보기).
// 리뷰 팝업과 전체 리뷰 창이 같이 쓴다
import { useState } from "react";
import type { Review } from "@/types/review";
import type { Photo } from "@/lib/db/photos";
import PhotoTile from "./PhotoTile";
import PhotoViewer from "./PhotoViewer";
import { ReviewMeta, reviewTags } from "./ReviewCard";

export default function ReviewDetail({ review, photos }: { review: Review; photos: Photo[] }) {
  const [viewing, setViewing] = useState<number | null>(null); // 크게 보는 사진 순번
  const tags = reviewTags(review);

  return (
    <>
      <ReviewMeta review={review} />
      <p className="mt-2 text-sm font-medium break-words whitespace-pre-wrap">“{review.comment}”</p>
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {tags.map((t) => (
            <span key={t} className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-gray">
              {t}
            </span>
          ))}
        </div>
      )}
      {photos.length > 0 && (
        <div className="mt-3 flex gap-1 overflow-x-auto [scrollbar-width:none]">
          {photos.map((p, i) => (
            <PhotoTile key={p.id} photo={p} className="aspect-square w-24 shrink-0 rounded-lg" onOpen={() => setViewing(i)} />
          ))}
        </div>
      )}
      {viewing !== null && <PhotoViewer photos={photos} start={viewing} onClose={() => setViewing(null)} />}
    </>
  );
}
