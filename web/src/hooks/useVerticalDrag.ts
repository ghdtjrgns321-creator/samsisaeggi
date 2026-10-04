"use client";

// 위아래 끌기 감지. 끄는 동안 이동량(dy, 아래가 +)을 주고, 손을 떼면 방향에 따라 onUp/onDown.
//  - bind: 손잡이·제목처럼 끌기 전용 영역. 거의 움직이지 않고 뗐으면 onTap.
//  - bindScroll: 시트 본문(스크롤 영역). 접힌 상태에선 위아래 어느 쪽이든, 펼친 상태에선 맨 위까지 올라가 있을 때
//    아래로 쓸면 시트를 끈다. 그 외(가로 쓸기·본문 스크롤·누르기)는 브라우저에 맡긴다.
//    포인터 이벤트는 스크롤이 시작되면 취소되므로 터치 이벤트로 받는다.
import { useRef, useState } from "react";

const SWIPE_THRESHOLD_PX = 50;
const TAP_TOLERANCE_PX = 5;

type Handlers = { onUp: () => void; onDown: () => void; onTap: () => void; expanded: boolean };
type TouchStart = { x: number; y: number; atTop: boolean; mode: "pending" | "sheet" | "scroll" };

export function useVerticalDrag({ onUp, onDown, onTap, expanded }: Handlers) {
  const [startY, setStartY] = useState<number | null>(null); // null = 끄는 중 아님
  const [dy, setDy] = useState(0);
  const touch = useRef<TouchStart | null>(null);

  const finish = (allowTap: boolean) => {
    if (startY === null) return;
    if (dy <= -SWIPE_THRESHOLD_PX) onUp();
    else if (dy >= SWIPE_THRESHOLD_PX) onDown();
    else if (allowTap && Math.abs(dy) <= TAP_TOLERANCE_PX) onTap();
    setStartY(null);
    setDy(0);
  };

  const bind = {
    onPointerDown: (e: React.PointerEvent) => {
      setStartY(e.clientY);
      e.currentTarget.setPointerCapture(e.pointerId); // 손가락이 영역 밖으로 나가도 계속 추적
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (startY !== null) setDy(e.clientY - startY);
    },
    onPointerUp: () => finish(true),
    onPointerCancel: () => finish(true),
  };

  const bindScroll = {
    onTouchStart: (e: React.TouchEvent<HTMLElement>) => {
      // 시트 안에서 띄운 모달(리뷰 작성·길찾기)의 터치는 무시
      if ((e.target as Element).closest("[data-modal]")) return;
      const t = e.touches[0];
      touch.current = { x: t.clientX, y: t.clientY, atTop: e.currentTarget.scrollTop <= 0, mode: "pending" };
    },
    onTouchMove: (e: React.TouchEvent<HTMLElement>) => {
      const s = touch.current;
      if (!s || s.mode === "scroll") return;
      const t = e.touches[0];
      const dx = t.clientX - s.x;
      const d = t.clientY - s.y;
      if (s.mode === "pending") {
        if (Math.max(Math.abs(dx), Math.abs(d)) < TAP_TOLERANCE_PX) return;
        const vertical = Math.abs(d) > Math.abs(dx);
        const canDrag = vertical && (!expanded || (d > 0 && s.atTop));
        s.mode = canDrag ? "sheet" : "scroll";
        if (!canDrag) return;
        setStartY(s.y);
      }
      setDy(d);
    },
    onTouchEnd: () => {
      if (touch.current?.mode === "sheet") finish(false);
      touch.current = null;
    },
    onTouchCancel: () => {
      if (touch.current?.mode === "sheet") finish(false);
      touch.current = null;
    },
  };

  return { dy, dragging: startY !== null, bind, bindScroll };
}
