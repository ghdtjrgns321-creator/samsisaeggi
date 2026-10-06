"use client";

// 전체 리뷰 창 (화면 전체, 세로 목록). 한줄평·태그를 자르지 않고, 리뷰와 함께 올린 사진을 붙여 보여준다.
// body에 띄운다 — 시트 안에 두면 시트의 transform·overflow에 갇힌다.
// 포털이어도 React 이벤트는 시트로 올라가므로 끌기(시트 내리기)로 번지지 않게 막는다.
import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { Review } from "@/types/review";
import type { Photo } from "@/lib/db/photos";
import ReviewDetail from "./ReviewDetail";

type Props = {
  reviews: Review[];
  photosByReview: Map<string, Photo[]>;
  onWrite: () => void;
  onClose: () => void;
};

export default function ReviewsViewer({ reviews, photosByReview, onWrite, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return createPortal(
    <div
      role="dialog"
      aria-modal
      aria-label="전체 리뷰"
      data-modal
      onPointerDown={stop}
      onPointerMove={stop}
      onPointerUp={stop}
      onTouchStart={stop}
      onTouchMove={stop}
      onTouchEnd={stop}
      className="fixed inset-0 z-50 flex flex-col bg-white"
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-line px-2 pt-[env(safe-area-inset-top)]">
        <button type="button" onClick={onClose} aria-label="닫기" className="h-12 w-10 text-xl">
          ←
        </button>
        <h2 className="flex-1 text-base font-bold">
          리뷰 <span className="text-primary">{reviews.length}</span>
        </h2>
        <button type="button" onClick={onWrite} className="px-3 text-sm font-bold text-primary">
          + 리뷰 쓰기
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <ul className="divide-y divide-line">
          {reviews.map((r) => (
            <li key={r.id} className="px-5 py-4">
              <ReviewDetail review={r} photos={photosByReview.get(r.id) ?? []} />
            </li>
          ))}
        </ul>
        <div className="pb-[max(2rem,env(safe-area-inset-bottom))]" />
      </div>
    </div>,
    document.body,
  );
}
