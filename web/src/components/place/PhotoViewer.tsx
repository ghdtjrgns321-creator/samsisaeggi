"use client";

// 사진 크게 보기 (화면 전체). 옆으로 넘겨 다른 사진, 바깥·✕·Esc로 닫음.
// body에 띄운다 — 시트 안에 두면 시트의 transform·overflow에 갇힌다.
// 포털이어도 React 이벤트는 시트로 올라가므로 끌기(시트 내리기)로 번지지 않게 막는다.
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Photo } from "@/lib/db/photos";

type Props = { photos: Photo[]; start: number; onClose: () => void };

export default function PhotoViewer({ photos, start, onClose }: Props) {
  const stripRef = useRef<HTMLUListElement>(null);

  // 누른 사진부터 보이게
  useEffect(() => {
    const strip = stripRef.current;
    if (strip) strip.scrollLeft = strip.clientWidth * start;
  }, [start]);

  // 리뷰 창 위에 떠 있을 때 Esc는 사진 창만 닫는다 (먼저 받고 전파를 끊음)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onClose();
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return createPortal(
    <div
      role="dialog"
      aria-modal
      aria-label="사진 크게 보기"
      onPointerDown={stop}
      onPointerMove={stop}
      onPointerUp={stop}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90"
    >
      <ul ref={stripRef} className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]">
        {photos.map((p, i) => (
          <li key={p.id} className="relative flex h-full w-full shrink-0 snap-center items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- 외부 저장소·자유 이용 사진 URL */}
            <img src={p.url} alt="" onClick={stop} className="max-h-full max-w-full object-contain" />
            <span className="absolute top-4 left-4 text-sm text-white/80">
              {i + 1} / {photos.length}
              {p.isSample && " · 예시 사진"}
            </span>
            {p.credit && <span className="absolute inset-x-4 bottom-4 truncate text-center text-xs text-white/70">{p.credit}</span>}
          </li>
        ))}
      </ul>
      <button type="button" onClick={onClose} aria-label="닫기" className="absolute top-3 right-3 h-10 w-10 text-2xl text-white">
        ✕
      </button>
    </div>,
    document.body,
  );
}
