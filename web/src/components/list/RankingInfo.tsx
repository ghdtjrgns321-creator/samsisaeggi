"use client";

// 정렬 옆 ⓘ: 누르면 랭킹을 어떻게 매기는지 말풍선으로 보여준다.
// 말풍선은 버튼 위(지도 쪽)로 body에 띄운다 — 목록 시트 안에 두면 시트 높이(overflow)에 잘린다.
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useClickOutside } from "@/hooks/useClickOutside";

export default function RankingInfo() {
  const [bottom, setBottom] = useState<number | null>(null); // 말풍선 아래 끝 (화면 아래에서 px). null = 닫힘
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setBottom(null), []);
  useClickOutside(rootRef, close);

  const toggle = (button: HTMLElement) =>
    setBottom(bottom === null ? window.innerHeight - button.getBoundingClientRect().top + 8 : null);

  return (
    <div ref={rootRef} className="shrink-0">
      <button
        type="button"
        onClick={(e) => toggle(e.currentTarget)}
        aria-label="랭킹 기준 보기"
        aria-expanded={bottom !== null}
        className="flex h-5 w-5 items-center justify-center rounded-full border border-gray text-[11px] font-bold text-gray"
      >
        i
      </button>
      {bottom !== null &&
        createPortal(
          <div
            role="tooltip"
            style={{ bottom }}
            className="fixed right-4 z-20 w-64 rounded-xl bg-ink px-4 py-3 text-[13px] leading-relaxed text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
          >
            <p className="font-bold">랭킹은 이렇게 매겨요</p>
            <p className="mt-1">평균 별점 × 리뷰 수</p>
            <p className="mt-1 text-white/70">별점이 높고 동료 리뷰가 많을수록 위로 올라가요. 화면에 보이는 지역 안에서 순위를 매겨요.</p>
          </div>,
          document.body,
        )}
    </div>
  );
}
