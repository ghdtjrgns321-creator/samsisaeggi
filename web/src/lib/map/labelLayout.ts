// 말풍선 겹침 처리: 우선순위가 높은 것부터 자리를 차지하고, 이미 차지한 자리와 겹치는 것은 숨긴다.
// 지도를 확대하면 간격이 벌어져 숨었던 말풍선이 다시 들어갈 자리가 생긴다.

export type Box = { left: number; top: number; right: number; bottom: number };

const LABEL_FONT_PX = 12; // globals.css .pin-label
const LABEL_PADDING_X = 9;
const LABEL_HEIGHT = 26;
const TAIL_HEIGHT = 4;
const GAP = 2; // 말풍선 사이 최소 여백

let measureCtx: CanvasRenderingContext2D | null = null;

/** 말풍선 글자 폭(px) 추정 */
function labelWidth(text: string): number {
  measureCtx ??= document.createElement("canvas").getContext("2d");
  if (!measureCtx) return text.length * LABEL_FONT_PX;
  measureCtx.font = `700 ${LABEL_FONT_PX}px ${getComputedStyle(document.body).fontFamily}`;
  return measureCtx.measureText(text).width + LABEL_PADDING_X * 2;
}

/** 꼬리 끝이 (x, y)에 오는 말풍선의 화면 영역 */
export function labelBox(text: string, x: number, y: number): Box {
  const half = labelWidth(text) / 2;
  const bottom = y - TAIL_HEIGHT;
  return { left: x - half - GAP, right: x + half + GAP, top: bottom - LABEL_HEIGHT - GAP, bottom: bottom + GAP };
}

function overlaps(a: Box, b: Box): boolean {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
}

/**
 * candidates는 우선순위 순서. fixed는 항상 보이는 말풍선(자리만 차지).
 * 보여줄 candidates의 index 집합을 돌려준다 (최대 max개, null 후보는 건너뜀).
 */
export function pickVisible(candidates: (Box | null)[], fixed: Box[], max = Infinity): Set<number> {
  const placed = [...fixed];
  const visible = new Set<number>();
  candidates.forEach((box, i) => {
    if (!box || visible.size >= max || placed.some((p) => overlaps(p, box))) return;
    placed.push(box);
    visible.add(i);
  });
  return visible;
}
