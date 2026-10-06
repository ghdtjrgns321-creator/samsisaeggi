"use client";

// 리뷰 카드를 누르면 뜨는 작은 팝업: 그 리뷰 한 건 전문 + 함께 올린 사진. 바깥·✕·Esc로 닫음.
// body에 띄운다 — 시트 안에 두면 시트의 transform·overflow에 갇힌다.
// 포털이어도 React 이벤트는 시트로 올라가므로 끌기(시트 내리기)로 번지지 않게 막는다.
import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { Review } from "@/types/review";
import type { Photo } from "@/lib/db/photos";
import ReviewDetail from "./ReviewDetail";

type Props = { review: Review; photos: Photo[]; onClose: () => void };

export default function ReviewPopup({ review, photos, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return createPortal(
    <div
      data-modal
      onPointerDown={stop}
      onPointerMove={stop}
      onPointerUp={stop}
      onTouchStart={stop}
      onTouchMove={stop}
      onTouchEnd={stop}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5"
    >
      <div
        role="dialog"
        aria-modal
        aria-label="리뷰"
        onClick={stop}
        className="relative max-h-[80vh] w-full max-w-sm overflow-y-auto overscroll-contain rounded-2xl bg-white p-5 pt-4"
      >
        <button type="button" onClick={onClose} aria-label="닫기" className="absolute top-2 right-2 h-9 w-9 text-lg text-gray">
          ✕
        </button>
        <div className="pr-8">
          <ReviewDetail review={review} photos={photos} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
