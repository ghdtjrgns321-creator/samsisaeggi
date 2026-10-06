"use client";

// PC에서 마우스로 끌어 가로 목록 넘기기. 터치·트랙패드는 브라우저 기본 스크롤에 맡긴다.
// 끄는 동안은 스냅을 꺼서 손을 따라가게 하고, 놓으면 다시 켜서 가까운 칸에 붙게 한다.
// 끌고 난 직후의 클릭(카드 열기)은 막는다.
import { useRef } from "react";

const DRAG_TOLERANCE_PX = 5;

export function useMouseDragScroll<T extends HTMLElement>() {
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const justDragged = useRef(false);

  const end = (e: React.PointerEvent<T>) => {
    if (!drag.current) return;
    justDragged.current = drag.current.moved;
    drag.current = null;
    e.currentTarget.style.scrollSnapType = "";
  };

  return {
    onPointerDown: (e: React.PointerEvent<T>) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft, moved: false };
      justDragged.current = false;
    },
    onPointerMove: (e: React.PointerEvent<T>) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.x;
      if (!d.moved && Math.abs(dx) < DRAG_TOLERANCE_PX) return;
      if (!d.moved) {
        d.moved = true;
        e.currentTarget.setPointerCapture(e.pointerId); // 목록 밖으로 나가도 계속 따라감
        e.currentTarget.style.scrollSnapType = "none";
      }
      e.currentTarget.scrollLeft = d.left - dx;
    },
    onPointerUp: end,
    onPointerCancel: end,
    onClickCapture: (e: React.MouseEvent<T>) => {
      if (!justDragged.current) return;
      justDragged.current = false;
      e.stopPropagation();
      e.preventDefault();
    },
    onDragStart: (e: React.DragEvent<T>) => e.preventDefault(), // 이미지·글자 끌어가기 방지
  };
}
