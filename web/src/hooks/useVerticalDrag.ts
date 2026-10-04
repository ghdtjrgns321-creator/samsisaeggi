"use client";

// 위아래 끌기 감지. 끄는 동안 이동량(dy, 아래가 +)을 주고, 손을 떼면 방향에 따라 onUp/onDown.
// 거의 움직이지 않고 뗐으면 onTap.
import { useState } from "react";

const SWIPE_THRESHOLD_PX = 50;
const TAP_TOLERANCE_PX = 5;

type Handlers = { onUp: () => void; onDown: () => void; onTap: () => void };

export function useVerticalDrag({ onUp, onDown, onTap }: Handlers) {
  const [startY, setStartY] = useState<number | null>(null); // null = 끄는 중 아님
  const [dy, setDy] = useState(0);

  const end = () => {
    if (startY === null) return;
    if (dy <= -SWIPE_THRESHOLD_PX) onUp();
    else if (dy >= SWIPE_THRESHOLD_PX) onDown();
    else if (Math.abs(dy) <= TAP_TOLERANCE_PX) onTap();
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
    onPointerUp: end,
    onPointerCancel: end,
  };

  return { dy, dragging: startY !== null, bind };
}
