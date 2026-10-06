// 요약 3칸: 용도 · 다녀간 인원 · 1인 가격. 리뷰가 없거나 그 값을 적은 리뷰가 없으면 "-".
import type { PlaceStats } from "@/types/place";

/** 천 원 단위 반올림 ("약 9,000원") */
const roundToThousand = (won: number) => Math.round(won / 1000) * 1000;

/** 리뷰에 적힌 인원 범위 ("1~8인", 하나뿐이면 "4인"). 정원이 아니라 실제로 다녀간 기록 */
function visitedPeople(stats: PlaceStats | null): string {
  const { minPeople: min, maxPeople: max } = stats ?? {};
  if (!max) return "-";
  return min && min !== max ? `${min}~${max}인` : `${max}인`;
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 text-center">
      <p className="text-xs text-gray">{label}</p>
      <p className="mt-1 truncate text-sm font-bold">{value}</p>
    </div>
  );
}

export default function PlaceStatsRow({ stats }: { stats: PlaceStats | null }) {
  return (
    <div className="flex divide-x divide-line rounded-xl bg-surface py-3">
      <Cell label="용도" value={stats?.uses.slice(0, 2).join(" · ") || "-"} />
      <Cell label="다녀간 인원" value={visitedPeople(stats)} />
      <Cell label="1인 가격" value={stats?.pricePerPerson ? `약 ${roundToThousand(stats.pricePerPerson).toLocaleString()}원` : "-"} />
    </div>
  );
}
