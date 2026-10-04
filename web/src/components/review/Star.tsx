// 별 한 개: fill 0 = 빈 별, 0.5 = 왼쪽 절반, 1 = 꽉 찬 별 (회색 별 위에 주황 별을 fill 비율만큼 겹침)
export default function Star({ fill, className = "" }: { fill: number; className?: string }) {
  return (
    <span className={`relative inline-block leading-none text-line ${className}`} aria-hidden>
      ★
      <span className="absolute inset-y-0 left-0 overflow-hidden text-primary" style={{ width: `${fill * 100}%` }}>
        ★
      </span>
    </span>
  );
}

/** 별점(0.5 단위)을 별 5개의 채움 비율로 */
export function starFills(rating: number): number[] {
  return [0, 1, 2, 3, 4].map((i) => Math.min(1, Math.max(0, rating - i)));
}
